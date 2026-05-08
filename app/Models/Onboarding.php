<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Onboarding extends Model {
    protected $casts = ['id_checks' => 'array'];
    protected $fillable = [
        'full_name','dob','address','mobile','email','passport_number',
        'passport_country','passport_expiry','work_rights','id_checks',
        'bank_name','bsb','account_number','tfn','super_fund','super_usi',
        'super_member','security_license','security_license_expiry',
        'first_aid_cert','first_aid_expiry','signature','signed_date','user_id'
    ];
}