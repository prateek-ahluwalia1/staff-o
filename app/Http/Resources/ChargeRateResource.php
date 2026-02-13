<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ChargeRateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        //return parent::toArray($request);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'user_id' => $this->user_id,
            'position' => $this->position,
            'level' => $this->level,
            'state' => $this->state,
            'def_metro_mon_to_fri_day_rate' => $this->def_metro_mon_to_fri_day_rate,
            'def_metro_mon_to_fri_night_rate' => $this->def_metro_mon_to_fri_night_rate,
            'def_metro_sat_day_rate' => $this->def_metro_sat_day_rate,
            'def_metro_sat_night_rate' => $this->def_metro_sat_night_rate,
            'def_metro_sun_day_rate' => $this->def_metro_sun_day_rate,
            'def_metro_sun_night_rate' => $this->def_metro_sun_night_rate,
            'def_metro_pub_holi_day_rate' => $this->def_metro_pub_holi_day_rate,
            'def_metro_pub_holi_night_rate' => $this->def_metro_pub_holi_night_rate,
            'def_reg_mon_to_fri_day_rate' => $this->def_reg_mon_to_fri_day_rate,
            'def_reg_mon_to_fri_night_rate' => $this->def_reg_mon_to_fri_night_rate,
            'def_reg_sat_day_rate' => $this->def_reg_sat_day_rate,
            'def_reg_sat_night_rate' => $this->def_reg_sat_night_rate,
            'def_reg_sun_day_rate' => $this->def_reg_sun_day_rate,
            'def_reg_sun_night_rate' => $this->def_reg_sun_night_rate,
            'def_reg_pub_holi_day_rate' => $this->def_reg_pub_holi_day_rate,
            'def_reg_pub_holi_night_rate' => $this->def_reg_pub_holi_night_rate,
            'eba_metro_mon_to_fri_day_rate' => $this->eba_metro_mon_to_fri_day_rate,
            'eba_metro_mon_to_fri_night_rate' => $this->eba_metro_mon_to_fri_night_rate,
            'eba_metro_sat_day_rate' => $this->eba_metro_sat_day_rate,
            'eba_metro_sat_night_rate' => $this->eba_metro_sat_night_rate,
            'eba_metro_sun_day_rate' => $this->eba_metro_sun_day_rate,
            'eba_metro_sun_night_rate' => $this->eba_metro_sun_night_rate,
            'eba_metro_pub_holi_day_rate' => $this->eba_metro_pub_holi_day_rate,
            'eba_metro_pub_holi_night_rate' => $this->eba_metro_pub_holi_night_rate,
            'eba_reg_mon_to_fri_day_rate' => $this->eba_reg_mon_to_fri_day_rate,
            'eba_reg_mon_to_fri_night_rate' => $this->eba_reg_mon_to_fri_night_rate,
            'eba_reg_sat_day_rate' => $this->eba_reg_sat_day_rate,
            'eba_reg_sat_night_rate' => $this->eba_reg_sat_night_rate,
            'eba_reg_sun_day_rate' => $this->eba_reg_sun_day_rate,
            'eba_reg_sun_night_rate' => $this->eba_reg_sun_night_rate,
            'eba_reg_pub_holi_day_rate' => $this->eba_reg_pub_holi_day_rate,
            'eba_reg_pub_holi_night_rate' => $this->eba_reg_pub_holi_night_rate,

            'ot_base_rate' => $this->ot_base_rate,
        ];
    }
}
