<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'user_id',
        'phone',
        'company_name',
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
}
