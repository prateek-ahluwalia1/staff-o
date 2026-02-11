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
        ];
    
        protected $hidden = [
            'password',
            'remember_token',
        ];
    
    
     protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

     public function customer()
    {
        return $this->hasOne(customer::class);
    }

    public function contractor()
    {
        return $this->hasOne(contractor::class);
    }

    public function staff()
    {
        return $this->hasOne(staff::class);
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
}
