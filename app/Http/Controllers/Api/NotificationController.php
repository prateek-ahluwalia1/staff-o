<?php

namespace App\Http\Controllers\Api;

use App\Events\DynamicUserNotification;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Send a real-time notification to a specific user.
     *
     * POST /api/notifications/send
     * Body: { user_id, message, title?, type?, data? }
     *
     * Protected by auth:sanctum — only authenticated users/admins can call this.
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'message' => 'required|string|max:500',
            'title'   => 'nullable|string|max:100',
            'type'    => 'nullable|string|in:info,success,warning,error',
            'data'    => 'nullable|array',
        ]);

        $userId  = (int) $validated['user_id'];
        $message = $validated['message'];
        $title   = $validated['title']  ?? 'Notification';
        $type    = $validated['type']   ?? 'info';
        $data    = $validated['data']   ?? [];

        // Fire the broadcast event — Pusher delivers it to the private channel
        broadcast(new DynamicUserNotification($userId, $message, $title, $data, $type));

        return response()->json([
            'success' => true,
            'message' => "Notification dispatched to user {$userId}",
        ]);
    }

    /**
     * Quick helper: send a notification to the currently authenticated user.
     * Useful for testing from Postman / frontend.
     *
     * POST /api/notifications/send-self
     * Body: { message, title?, type?, data? }
     */
    public function sendSelf(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500',
            'title'   => 'nullable|string|max:100',
            'type'    => 'nullable|string|in:info,success,warning,error',
            'data'    => 'nullable|array',
        ]);

        $user = $request->user();

        broadcast(new DynamicUserNotification(
            $user->id,
            $validated['message'],
            $validated['title']  ?? 'Notification',
            $validated['data']   ?? [],
            $validated['type']   ?? 'info',
        ));

        return response()->json([
            'success' => true,
            'message' => 'Notification sent to yourself',
        ]);
    }

     /**
     * Get user notifications
     */
    public function getUserNotifications($userId)
    {
        $guard = DB::table('users')->where('id', $userId)->select('state', 'name', 'user_type')->first();
        if($guard->user_type == 'admin'){
            $notifications = Notification::orderBy('created_at', 'desc')
            ->paginate(20);
        }else{
        $notifications = Notification::where('id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);    
        }

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Get unread count
     */
    public function getUnreadCount($userId)
    {
        $count = Notification::where('receiver_id', $userId)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id)
    {
        $notification = Notification::find($id);
        
        if ($notification) {
            $notification->markAsRead();
            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false], 404);
    }

    /**
     * Mark all as read
     */
    public function markAllAsRead($userId)
    {
        Notification::where('receiver_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}