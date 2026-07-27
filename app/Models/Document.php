<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'user_id',
        'document_category',
        'document_name',
        'document_no',
        'document_type',
        'document_expiry',
        'working_rights',
        'file',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

