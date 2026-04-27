<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    
        protected $fillable = [
            'name',
            'email',
            'password',
            'user_type',
            'is_active',
            'user_id',
            'city',
            'country',
            'google_id',
            'state',
            'coordinates',
            'address',
            'phone',
            'agora_uid', 
            'is_online', 
            'last_seen',
            'notification_token',
            'staffo_id',
            'phone_otp'
        ];
    
        protected $hidden = [
            'password',
            'remember_token',
        ];
    
    
     protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'is_online' => 'boolean',
        'last_seen' => 'datetime',
    ];

     public function customer()
    {
        return $this->hasOne(Customer::class, 'user_id', 'id');

    }

    public function contractor()
    {
        return $this->hasOne(Contractor::class, 'user_id', 'id');

    }

    public function staff()
    {
        return $this->hasOne(Staff::class, 'user_id', 'id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }


    /* ======================
        HELPERS
    ====================== */

    public function isCustomer()
    {
        return $this->user_type === 'customer';
    }

    public function isContractor()
    {
        return $this->user_type === 'contractor';
    }

    public function isStaff()
    {
        return $this->user_type === 'staff';
    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function children()
    {
        return $this->hasMany(User::class, 'user_id');
    }

     // Relationships
    public function initiatedCalls()
    {
        return $this->hasMany(Call::class, 'caller_id');
    }

    public function receivedCalls()
    {
        return $this->hasMany(Call::class, 'receiver_id');
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    // Accessor for unread messages count
    public function getUnreadMessagesCountAttribute()
    {
        return $this->receivedMessages()->where('is_read', false)->count();
    }
}
