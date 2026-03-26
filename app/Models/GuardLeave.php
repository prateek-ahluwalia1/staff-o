<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuardLeave extends Model
{
    use HasFactory;
    protected $table = "guard_leave_requests";


    public function guardss()
    {
        return $this->belongsTo(User::class, 'guard_id', 'id');
    }
    public function jobRoster(){
        return $this->hasMany(JobRoster::class, 'roster_id','id');
    }

}


