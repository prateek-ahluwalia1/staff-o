<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TfnDeclaration extends Model {
    protected $fillable = [
        'tfn','title','first_name','surname','previous_name','dob','address',
        'basis_of_payment','australian_resident','claim_threshold','help_debt',
        'signature','signed_date','user_id','full_name'
    ];
}