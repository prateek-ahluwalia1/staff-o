<?php

namespace App\Http\Controllers\Api;

use App\Events\CallEvent;
use App\Http\Controllers\Controller;
use App\Models\Call;
use App\Models\CallParticipant;
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

    /**
     * Initiate a 1-on-1 OR conference call.
     * Pass receiver_id for 1-on-1, or participant_ids[] for conference.
     */
    public function initiateCall(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // 'receiver_id'      => 'required_without:participant_ids|exists:users,id|different:user_id',
            // 'participant_ids'  => 'required_without:receiver_id|array|min:1',
            // 'participant_ids.*'=> 'exists:users,id',
            'call_type'        => 'nullable|in:audio,video',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $caller = Auth::user();

        // Build participant list
        // if ($request->has('participant_ids')) {
        //     $participantIds = array_unique(
        //         array_filter($request->participant_ids, fn($id) => $id != $caller->id)
        //     );
        // } else {
            $participantIds = [$request->receiver_id];
        // }

        // Validate all participants are online
        $participants = User::whereIn('id', $participantIds)->get();
        $offlineUsers = $participants->where('is_online', false)->pluck('id');
        if ($offlineUsers->isNotEmpty()) {
            return response()->json([
                'error'        => 'Some participants are offline',
                'offline_ids'  => $offlineUsers->values(),
            ], 400);
        }

        $isConference = count($participantIds) > 1;
        $callType     = $request->get('call_type', 'audio');

        // Create the call record
        $call = $this->agoraService->createCall(
            $caller->id,
            $participantIds,   // now accepts array
            $isConference,
            $callType
        );

        // Generate token for the caller
        $tokenData = $this->agoraService->generateRtcToken(
            $call->channel_name,
            $caller->agora_uid ?? $caller->id
        );

        // Notify every participant
        foreach ($participantIds as $participantId) {
            broadcast(new CallEvent($call, 'start_call', $participantId));
        }

        return response()->json([
            'success'      => true,
            'call'         => $call->load('participants.user'),
            'agora_config' => $tokenData,
            'is_conference'=> $isConference,
        ]);
    }

    /**
     * Accept the call (participant side).
     */
    public function acceptCall($callId)
    {
        $call = Call::with('participants')->findOrFail($callId);

        $participant = $call->participants()->where('user_id', Auth::id())->first();

        if (!$participant) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // if (!in_array($call->status, ['initiated', 'ringing'])) {
        //     return response()->json(['error' => 'Call is no longer available'], 400);
        // }

        // Mark this participant as joined
        $participant->update(['status' => 'joined', 'joined_at' => now()]);

        // If all participants have joined, mark call as ongoing
        $pendingCount = $call->participants()
            ->whereNotIn('status', ['joined', 'rejected', 'left'])
            ->count();

        if ($pendingCount === 0) {
            $this->agoraService->updateCallStatus($callId, 'ongoing');
        }

        $tokenData = $this->agoraService->generateRtcToken(
            $call->channel_name,
            Auth::user()->agora_uid ?? Auth::id()
        );

        broadcast(new CallEvent($call->fresh(), 'accepted', Auth::id()));

        return response()->json([
            'success'       => true,
            'call'          => $call->fresh()->load('participants.user'),
            'agora_config'  => $tokenData,
        ]);
    }

    /**
     * Reject the call (participant side).
     */
    public function rejectCall($callId)
    {
        $call = Call::with('participants')->findOrFail($callId);

        $participant = $call->participants()->where('user_id', Auth::id())->first();

        if (!$participant) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $participant->update(['status' => 'rejected', 'left_at' => now()]);

        // If ALL participants rejected, mark call as rejected
        $activeCount = $call->participants()
            ->whereNotIn('status', ['rejected', 'left'])
            ->count();

        if ($activeCount === 0) {
            $this->agoraService->updateCallStatus($callId, 'rejected');
        }

        broadcast(new CallEvent($call->fresh(), 'rejected', Auth::id()));

        return response()->json(['success' => true]);
    }

    /**
     * End / leave the call.
     * - For conference: user "leaves", call ends only when all have left.
     * - For 1-on-1: call ends immediately.
     */
    public function endCall($callId)
    {
        $call = Call::with('participants')->findOrFail($callId);

        $userId = Auth::id();
        $isCaller      = $call->caller_id === $userId;
        $isParticipant = $call->participants()->where('user_id', $userId)->exists();

        if (!$isCaller && !$isParticipant) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Mark this user as left
        $call->participants()
            ->where('user_id', $userId)
            ->update(['status' => 'left', 'left_at' => now()]);

        // Check remaining active participants
        $activeCount = $call->participants()
            ->whereNotIn('status', ['rejected', 'left'])
            ->count();

        // End the whole call if caller leaves OR no one is left
        if ($isCaller || $activeCount === 0) {
            $call = $this->agoraService->updateCallStatus($callId, 'ended');
            broadcast(new CallEvent($call, 'call_ended'));
        } else {
            // Just notify others this user left
            broadcast(new CallEvent($call->fresh(), 'participant_left', $userId));
        }

        return response()->json([
            'success'  => true,
            'call'     => $call->fresh()->load('participants.user'),
            'duration' => $call->fresh()->duration,
        ]);
    }

    /**
     * Add a new participant to an ongoing conference call.
     */
    public function addParticipant(Request $request, $callId)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $call = Call::findOrFail($callId);

        if ($call->caller_id !== Auth::id()) {
            return response()->json(['error' => 'Only the caller can add participants'], 403);
        }

        if (!in_array($call->status, ['ongoing', 'initiated', 'ringing'])) {
            return response()->json(['error' => 'Cannot add to a finished call'], 400);
        }

        $newUser = User::findOrFail($request->user_id);

        if (!$newUser->is_online) {
            return response()->json(['error' => 'User is offline'], 400);
        }

        // Avoid duplicate
        $exists = $call->participants()->where('user_id', $newUser->id)->exists();
        if ($exists) {
            return response()->json(['error' => 'User is already in this call'], 400);
        }

        $call->participants()->create([
            'user_id' => $newUser->id,
            'status'  => 'invited',
        ]);

        broadcast(new CallEvent($call->fresh(), 'start_call', $newUser->id));

        return response()->json([
            'success' => true,
            'call'    => $call->fresh()->load('participants.user'),
        ]);
    }

    /**
     * Remove / kick a participant (caller only).
     */
    public function removeParticipant(Request $request, $callId)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $call = Call::findOrFail($callId);

        if ($call->caller_id !== Auth::id()) {
            return response()->json(['error' => 'Only the caller can remove participants'], 403);
        }

        $call->participants()
            ->where('user_id', $request->user_id)
            ->update(['status' => 'removed', 'left_at' => now()]);

        broadcast(new CallEvent($call->fresh(), 'participant_removed', $request->user_id));

        return response()->json([
            'success' => true,
            'call'    => $call->fresh()->load('participants.user'),
        ]);
    }

    /**
     * Call history for the authenticated user.
     */
    public function callHistory(Request $request)
    {
        $calls = Call::where('caller_id', Auth::id())
            ->orWhereHas('participants', fn($q) => $q->where('user_id', Auth::id()))
            ->with(['caller', 'participants.user'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($calls);
    }

    /**
     * Get details of a single call.
     */
    public function getCallDetails($callId)
    {
        $call = Call::with(['caller', 'participants.user'])
            ->where(function ($query) {
                $query->where('caller_id', Auth::id())
                      ->orWhereHas('participants', fn($q) => $q->where('user_id', Auth::id()));
            })
            ->findOrFail($callId);

        return response()->json($call);
    }
}