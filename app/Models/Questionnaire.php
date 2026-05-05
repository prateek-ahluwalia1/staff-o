<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Questionnaire extends Model
{
    use HasFactory;

    protected $table = 'questionnaires';

    public function Admin(){
        return $this->belongsTo(User::class, 'admin_id')->select('id', 'name');
    }
    
    protected $casts = [
        'questionnaire' => 'array',
        'sub_heading' => 'array',
    ];
}
