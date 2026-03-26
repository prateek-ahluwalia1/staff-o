<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageEvent;
use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Services\AgoraService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    protected $agoraService;

    public function __construct(AgoraService $agoraService)
    {
        $this->agoraService = $agoraService;
    }

    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'receiver_id' => 'required|exists:users,id|different:user_id',
            'message' => 'required|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message = $this->agoraService->saveMessage(
            Auth::id(),
            $request->receiver_id,
            $request->message
        );

        broadcast(new MessageEvent($message));

        return response()->json([
            'success' => true,
            'message' => $message->load('sender')
        ], 201);
    }

    public function getConversation($userId, Request $request)
    {
        $otherUser = User::findOrFail($userId);
        
        $messages = Message::where(function($query) use ($userId) {
                $query->where('sender_id', Auth::id())
                      ->where('receiver_id', $userId);
            })
            ->orWhere(function($query) use ($userId) {
                $query->where('sender_id', $userId)
                      ->where('receiver_id', Auth::id());
            })
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', $request->get('order', 'asc'))
            ->paginate($request->get('per_page', 50));

        // Mark messages as read
        Message::where('sender_id', $userId)
            ->where('receiver_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json([
            'user' => $otherUser,
            'messages' => $messages
        ]);
    }

    public function getConversations()
    {
        $userId = Auth::id();
        
        $conversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function($message) use ($userId) {
                return $message->sender_id === $userId ? $message->receiver_id : $message->sender_id;
            })
            ->map(function($messages) use ($userId) {
                $latestMessage = $messages->first();
                $otherUser = $latestMessage->sender_id === $userId ? 
                            $latestMessage->receiver : $latestMessage->sender;
                
                return [
                    'user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'email' => $otherUser->email,
                        'is_online' => $otherUser->is_online,
                        'last_seen' => $otherUser->last_seen
                    ],
                    'last_message' => [
                        'message' => $latestMessage->message,
                        'created_at' => $latestMessage->created_at,
                        'is_sent_by_me' => $latestMessage->sender_id === $userId
                    ],
                    'unread_count' => $messages->where('receiver_id', $userId)
                                            ->where('is_read', false)
                                            ->count()
                ];
            })
            ->values();

        return response()->json($conversations);
    }

    public function markAsRead($messageId)
    {
        $message = Message::findOrFail($messageId);
        
        if ($message->receiver_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->markAsRead();

        return response()->json(['success' => true]);
    }

    public function markAllAsRead($userId)
    {
        $count = Message::where('sender_id', $userId)
            ->where('receiver_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    }

    public function deleteMessage($messageId)
    {
        $message = Message::findOrFail($messageId);
        
        if ($message->sender_id !== Auth::id() && $message->receiver_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->delete();

        return response()->json(['success' => true]);
    }
}