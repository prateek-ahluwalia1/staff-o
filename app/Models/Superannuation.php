<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Superannuation extends Model {
    protected $fillable = [
        'full_name','employee_number','fund_choice','fund_name',
        'fund_abn','fund_usi','member_account','signature','signed_date','user_id'
    ];
}
