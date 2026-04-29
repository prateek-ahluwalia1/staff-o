<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'user_id',
        'phone',
        'company_name',
        'bank_details',
        'otp_expires_at',
        'phone_otp',
        'email_otp',
        'verify_profile',
        'profile_image',
    ];

    /* ======================
        RELATIONS
    ====================== */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function staff()
    {
        return $this->hasMany(Staff::class);
    }

    public function sites()
    {
        return $this->hasMany(Site::class, 'user_id');
    }
}
