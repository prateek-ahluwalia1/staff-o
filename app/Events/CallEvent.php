<?php

namespace App\Events;

use App\Models\Call;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $call;
    public $action;
    public $targetUserId;

    /**
     * @param Call      $call
     * @param string    $action        e.g. start_call, accepted, rejected, call_ended, participant_left, participant_removed
     * @param int|null  $targetUserId  If set, broadcast ONLY to this user (e.g. newly added participant)
     */
    public function __construct(Call $call, string $action, ?int $targetUserId = null)
    {
        $this->call         = $call;
        $this->action       = $action;
        $this->targetUserId = $targetUserId;
    }

    public function broadcastOn(): array
    {
        // If a specific target is set (e.g. adding one new participant mid-call),
        // only notify that user.
        if ($this->targetUserId) {
            return [
                new PrivateChannel('notifications.' . $this->targetUserId),
            ];
        }

        // Otherwise broadcast to caller + ALL participants
        $channels = [
            new PrivateChannel('notifications.' . $this->call->caller_id),
        ];

        // Load participants if not already loaded
        $participants = $this->call->relationLoaded('participants')
            ? $this->call->participants
            : $this->call->participants()->get();

        foreach ($participants as $participant) {
            // Avoid duplicate channel for caller (if they're also in participants table)
            if ($participant->user_id !== $this->call->caller_id) {
                $channels[] = new PrivateChannel('notifications.' . $participant->user_id);
            }
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'push.notification';
    }

    public function broadcastWith(): array
    {
        // Load caller if not already loaded
        $caller = $this->call->relationLoaded('caller')
            ? $this->call->caller
            : $this->call->caller()->first();

        // Build participants list for conference calls
        $participantList = [];
        if ($this->call->is_conference) {
            $participants = $this->call->relationLoaded('participants')
                ? $this->call->participants
                : $this->call->participants()->with('user')->get();

            $participantList = $participants->map(fn($p) => [
                'user_id'   => $p->user_id,
                'name'      => $p->user->name ?? null,
                'status'    => $p->status,
                'joined_at' => $p->joined_at?->toDateTimeString(),
            ])->toArray();
        }

        return [
            'type'          => $this->action,
            'call_id'       => $this->call->id,
            'caller_id'     => $this->call->caller_id,
            'caller_name'   => $caller->name ?? null,
            'channel_name'  => $this->call->channel_name,
            'status'        => $this->call->status,
            'is_conference' => $this->call->is_conference ?? false,
            'call_type'     => $this->call->call_type ?? 'audio',
            'participants'  => $participantList,
            // Only present for targeted events (participant_left / participant_removed)
            'target_user_id'=> $this->targetUserId,
            'started_at'    => $this->call->started_at?->toDateTimeString(),
        ];
    }
}