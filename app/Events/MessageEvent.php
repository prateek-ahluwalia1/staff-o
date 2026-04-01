<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message->load('sender');
    }

    // public function broadcastOn()
    // {
    //     return new PrivateChannel('chat.' . $this->message->receiver_id);
    // }
    public function broadcastOn()
    {
        return new PrivateChannel('notifications.' . $this->message->receiver_id);
    }

 public function broadcastAs(): string
    {
        return 'push.notification';
    }
    public function broadcastWith()
    {
        return [
            'message_id' => $this->message->id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $this->message->sender->name,
            'message' => $this->message->message,
            'created_at' => $this->message->created_at->toDateTimeString()
        ];
    }
}