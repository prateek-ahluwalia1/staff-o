<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobRosterTask extends Model
{
    use HasFactory;

    protected $table = 'job_roster_tasks';


    public function shift()
    {
        return $this->belongsTo(JobRoster::class, 'job_roster_id', 'id')->withDefault();
    }



}
