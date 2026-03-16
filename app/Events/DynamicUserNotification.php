<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DynamicUserNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $message;
    public string $title;
    public array $data;
    public string $timestamp;
    public string $type;
    public int $userId;

    public function __construct(int $userId, string $message, string $title = 'Notification', array $data = [], string $type = 'info')
    {
        $this->userId    = $userId;
        $this->message   = $message;
        $this->title     = $title;
        $this->data      = $data;
        $this->type      = $type;
        $this->timestamp = now()->toDateTimeString();
    }

    /**
     * Private channel named  notifications.{userId}
     * Must match the channel authorised in routes/channels.php
     * and subscribed to in the React useEcho hook.
     */
    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("notifications.{$this->userId}");
    }

    /**
     * Event name the React listener must match:  .push.notification
     * (Laravel prepends the app namespace, the leading dot bypasses that)
     */
    public function broadcastAs(): string
    {
        return 'push.notification';
    }

    public function broadcastWith(): array
    {
        return [
            'id'        => uniqid('notif_', true),
            'userId'    => $this->userId,
            'message'   => $this->message,
            'title'     => $this->title,
            'type'      => $this->type,
            'data'      => $this->data,
            'timestamp' => $this->timestamp,
            'read'      => false,
        ];
    }
}