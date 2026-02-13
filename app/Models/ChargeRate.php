<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChargeRate extends Model
{
    use HasFactory;

    protected $table = 'charge_rates';

    protected $fillable = [
        'title',
        'customer_id',
        'position',
        'level',
        'state',
        
        // Default metro rates
        'def_metro_mon_to_fri_day_rate',
        'def_metro_mon_to_fri_night_rate',
        'def_metro_sat_day_rate',
        'def_metro_sat_night_rate',
        'def_metro_sun_day_rate',
        'def_metro_sun_night_rate',
        'def_metro_pub_holi_day_rate',
        'def_metro_pub_holi_night_rate',

        // Default regional rates
        'def_reg_mon_to_fri_day_rate',
        'def_reg_mon_to_fri_night_rate',
        'def_reg_sat_day_rate',
        'def_reg_sat_night_rate',
        'def_reg_sun_day_rate',
        'def_reg_sun_night_rate',
        'def_reg_pub_holi_day_rate',
        'def_reg_pub_holi_night_rate',

        // EBA metro rates
        'eba_metro_mon_to_fri_day_rate',
        'eba_metro_mon_to_fri_night_rate',
        'eba_metro_sat_day_rate',
        'eba_metro_sat_night_rate',
        'eba_metro_sun_day_rate',
        'eba_metro_sun_night_rate',
        'eba_metro_pub_holi_day_rate',
        'eba_metro_pub_holi_night_rate',

        // EBA regional rates
        'eba_reg_mon_to_fri_day_rate',
        'eba_reg_mon_to_fri_night_rate',
        'eba_reg_sat_day_rate',
        'eba_reg_sat_night_rate',
        'eba_reg_sun_day_rate',
        'eba_reg_sun_night_rate',
        'eba_reg_pub_holi_day_rate',
        'eba_reg_pub_holi_night_rate',

        'ot_base_rate',
        'status'
    ];

    protected $casts = [
        'status' => 'string',
    ];
}