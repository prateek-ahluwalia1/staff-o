<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CallParticipant extends Model
{
    protected $fillable = ['call_id', 'user_id', 'status', 'joined_at', 'left_at'];

    public function user() {
        return $this->belongsTo(User::class);
    }
    public function call() {
        return $this->belongsTo(Call::class);
    }
}