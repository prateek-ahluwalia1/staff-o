<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VisaDetails extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'details',
        'is_correct',
        'passport_number',
        'passport_country',
        'given_name',
        'family_name',
        'date_of_birth',
        'check_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'details' => 'array',
        'is_correct' => 'boolean',
        'date_of_birth' => 'date',
        'check_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

}