<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_name',
        'email',
        'transaction_id',
        'status',
        'response'
    ];

    // Optional: Add scope for filtering
    public function scopeByEmail($query, $email)
    {
        return $query->where('email', $email);
    }

    public function scopeByFileName($query, $fileName)
    {
        return $query->where('file_name', $fileName);
    }
}