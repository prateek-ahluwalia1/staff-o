<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobRoster extends Model
{
    use HasFactory;


    public function site()
    {
        return $this->belongsTo(Site::class, 'site_id', 'id');
    }

    public function rosterActivity()
    {
        return $this->hasOne(JobRosterActivity::class, 'job_roster_id', 'id');
    }

    public function guards() {
        return $this->belongsTo(User::class, 'assigned_to', 'id');
    }

    public function customer() {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

     public function jobRosterTask()
    {
        return $this->hasMany(JobRosterTask::class, 'job_roster_id', 'id');
    }

    public function callScript()
    {
        return $this->belongsTo(CallScript::class, 'script_id');
    }

    public function callLogs()
    {
        return $this->hasMany(CallLog::class, 'uuid', 'uuid');
    }

}
