<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'job_roster_id',
        'payment_intent_id',
        'charge_id',
        'amount',
        'discount',
        'amount_charged',
        'balance',
        'service_fee',
        'total_amount',
        'currency',
        'status',
        'response'
    ];
}
