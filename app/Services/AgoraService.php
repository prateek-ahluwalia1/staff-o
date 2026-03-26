<?php

namespace App\Services;

use App\Models\Call;
use App\Models\Message;
use Illuminate\Support\Facades\Log;

class AgoraService
{
    protected $appId;
    protected $appCertificate;

    public function __construct()
    {
        $this->appId = env('AGORA_APP_ID');
        $this->appCertificate = env('AGORA_APP_CERTIFICATE');
    }

    /**
     * Generate RTC token for voice calls
     */
    public function generateRtcToken($channelName, $uid, $role = 1)
    {
        try {
            return [
                'token' => $this->generateSimpleToken($channelName, $uid),
                'appId' => $this->appId,
                'channel' => $channelName,
                'uid' => $uid
            ];
        } catch (\Exception $e) {
            Log::error('RTC token generation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate RTM token for messaging
     */
    public function generateRtmToken($uid)
    {
        try {
            return [
                'token' => $this->generateSimpleRtmToken($uid),
                'appId' => $this->appId,
                'uid' => (string) $uid
            ];
        } catch (\Exception $e) {
            Log::error('RTM token generation failed: ' . $e->getMessage());
            return null;
        }
    }

    private function generateSimpleToken($channelName, $uid)
    {
        return base64_encode($this->appId . '|' . $channelName . '|' . $uid . '|' . time());
    }

    private function generateSimpleRtmToken($uid)
    {
        return base64_encode($this->appId . '|rtm|' . $uid . '|' . time());
    }

    public function createCall($callerId, $receiverId, $channelName = null)
    {
        $channel = $channelName ?? 'call_' . uniqid() . '_' . time();
        
        return Call::create([
            'caller_id' => $callerId,
            'receiver_id' => $receiverId,
            'channel_name' => $channel,
            'status' => 'initiated',
            'started_at' => now()
        ]);
    }

    public function updateCallStatus($callId, $status)
    {
        $call = Call::find($callId);
        if ($call) {
            $updateData = ['status' => $status];
            
            if ($status === 'ended' && !$call->ended_at) {
                $updateData['ended_at'] = now();
                if ($call->started_at && $call->status === 'ongoing') {
                    $updateData['duration'] = now()->diffInSeconds($call->started_at);
                }
            }
            
            $call->update($updateData);
        }
        return $call;
    }

    public function isUserInCall($userId)
    {
        return Call::where(function($query) use ($userId) {
                $query->where('caller_id', $userId)
                      ->orWhere('receiver_id', $userId);
            })
            ->whereIn('status', ['initiated', 'ringing', 'ongoing'])
            ->exists();
    }

    public function saveMessage($senderId, $receiverId, $message, $channelName = null)
    {
        $channel = $channelName ?? 'private_' . min($senderId, $receiverId) . '_' . max($senderId, $receiverId);
        
        return Message::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'message' => $message,
            'channel_name' => $channel,
            'is_read' => false
        ]);
    }
}