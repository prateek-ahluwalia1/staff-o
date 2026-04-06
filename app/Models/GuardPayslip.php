<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuardPayslip extends Model
{
    protected $fillable = ['guard_id', 'file_url', 'start_date', 'end_date', 'status'];
}
