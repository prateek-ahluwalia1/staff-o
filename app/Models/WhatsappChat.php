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
        'otp_verified_at',
        'otp_verified_user_id',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'otp_verified_at'  => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Whether this chat has a live, successful OTP verification for the
     * given user. Verification is scoped to the active chat session, not
     * stored forever, so a new session (see isStale()) starts unverified
     * again.
     */
    public function isVerifiedFor(int $userId, int $ttlMinutes = 30): bool
    {
        if (!$this->otp_verified_at || (int) $this->otp_verified_user_id !== $userId) {
            return false;
        }

        return $this->otp_verified_at->diffInMinutes(now()) < $ttlMinutes;
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
