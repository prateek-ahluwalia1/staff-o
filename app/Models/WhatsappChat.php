<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappChat extends Model
{
    protected $fillable = [
        'phone',
        'chat_id',
        'user_id',
        'status',
        'last_message_at',
        'message_count',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * A session is stale once nothing has been said for a while. Retell keeps
     * its own chat alive far longer, but a guard who messages again three days
     * later is starting a new conversation, not continuing the old one.
     */
    public function isStale(int $timeoutMinutes): bool
    {
        if (!$this->last_message_at) {
            return true;
        }

        return $this->last_message_at->diffInMinutes(now()) >= $timeoutMinutes;
    }
}
