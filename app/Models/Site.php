<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Site extends Model
{
    use HasFactory;

    protected $table = 'sites';

    protected $fillable = [
        'user_id',
        'site_name',
        'site_description',
        'signin_radius',
        'address',
        'coordinates',
        'state',
    ];

    public function jobRoster()
    {
        return $this->hasMany(JobRoster::class, 'site_id', 'id');
    }

}
