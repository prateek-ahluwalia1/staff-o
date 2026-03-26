<?php

namespace App\Http\Controllers\Api;

use App\Events\CallEvent;
use App\Http\Controllers\Controller;
use App\Models\Call;
use App\Models\User;
use App\Services\AgoraService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CallController extends Controller
{
    protected $agoraService;

    public function __construct(AgoraService $agoraService)
    {
        $this->agoraService = $agoraService;
    }

    public function initiateCall(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'receiver_id' => 'required|exists:users,id|different:user_id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $caller = Auth::user();
        $receiver = User::find($request->receiver_id);

        if (!$receiver->is_online) {
            return response()->json(['error' => 'User is offline'], 400);
        }

        if ($this->agoraService->isUserInCall($caller->id)) {
            return response()->json(['error' => 'You are already in a call'], 400);
        }

        if ($this->agoraService->isUserInCall($receiver->id)) {
            return response()->json(['error' => 'User is already in a call'], 400);
        }

        $call = $this->agoraService->createCall($caller->id, $receiver->id);
        $tokenData = $this->agoraService->generateRtcToken(
            $call->channel_name, 
            $caller->agora_uid ?? $caller->id
        );

        broadcast(new CallEvent($call, 'initiated'));

        return response()->json([
            'success' => true,
            'call' => $call,
            'agora_config' => $tokenData
        ]);
    }

    public function acceptCall($callId)
    {
        $call = Call::findOrFail($callId);
        
        if ($call->receiver_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!in_array($call->status, ['initiated', 'ringing'])) {
            return response()->json(['error' => 'Call is no longer available'], 400);
        }

        $call = $this->agoraService->updateCallStatus($callId, 'ongoing');
        $tokenData = $this->agoraService->generateRtcToken(
            $call->channel_name, 
            Auth::user()->agora_uid ?? Auth::id()
        );

        broadcast(new CallEvent($call, 'accepted'));

        return response()->json([
            'success' => true,
            'call' => $call,
            'agora_config' => $tokenData
        ]);
    }

    public function rejectCall($callId)
    {
        $call = Call::findOrFail($callId);
        
        if ($call->receiver_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $call = $this->agoraService->updateCallStatus($callId, 'rejected');
        broadcast(new CallEvent($call, 'rejected'));

        return response()->json(['success' => true]);
    }

    public function endCall($callId)
    {
        $call = Call::findOrFail($callId);
        
        $userId = Auth::id();
        if ($call->caller_id !== $userId && $call->receiver_id !== $userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $call = $this->agoraService->updateCallStatus($callId, 'ended');
        broadcast(new CallEvent($call, 'ended'));

        return response()->json([
            'success' => true,
            'call' => $call,
            'duration' => $call->duration
        ]);
    }

    public function callHistory(Request $request)
    {
        $calls = Call::where('caller_id', Auth::id())
            ->orWhere('receiver_id', Auth::id())
            ->with(['caller', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($calls);
    }

    public function getCallDetails($callId)
    {
        $call = Call::with(['caller', 'receiver'])
            ->where(function($query) {
                $query->where('caller_id', Auth::id())
                      ->orWhere('receiver_id', Auth::id());
            })
            ->findOrFail($callId);

        return response()->json($call);
    }
}