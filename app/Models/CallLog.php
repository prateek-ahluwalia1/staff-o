<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CallLog extends Model
{
    protected $fillable = [
        'uuid',
        'conversation_uuid',
        'status',
        'direction',
        'rate',
        'duration',
        'price',
        'start_time',
        'end_time',
        'network',
        'to_number',
        'from_number',
    ];
}
