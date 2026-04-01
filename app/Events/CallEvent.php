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

    public function __construct(Call $call, $action)
    {
        $this->call = $call;
        $this->action = $action;
    }
 
    // public function broadcastOn()
    // {
    //     return new PrivateChannel('notifications.' . $this->call->receiver_id);
    // }

    public function broadcastOn()
    {
        // Send to both caller and receiver
        return [
            new PrivateChannel('notifications.' . $this->call->receiver_id),
            new PrivateChannel('notifications.' . $this->call->caller_id)
        ];
    }

 public function broadcastAs(): string
    {
        return 'push.notification';
    }

    public function broadcastWith()
    {
        return [
            'type' => $this->action,
            'call_id' => $this->call->id,
            'caller_id' => $this->call->caller_id,
            'caller_name' => $this->call->caller->name,
            'channel_name' => $this->call->channel_name,
            'status' => $this->call->status,
            'started_at' => $this->call->started_at->toDateTimeString()
        ];
    }
}