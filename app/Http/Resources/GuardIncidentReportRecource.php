<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GuardIncidentReportRecource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $photos = [];

        foreach (json_decode($this->photo) as $key => $value) {
            $newObject = new \stdClass();
            $newObject->imgPath = returnImgPathCheck('uploads', $value->imgPath );
            $newObject->timestamp = $value->timestamp;
            $photos[] = $newObject;
        }
        return [
            'id' => $this->id,
            'site_name' => !empty($this->site_name) ? $this->site_name : '',
            'incident_date' => !empty($this->incident_date) ? $this->incident_date : '',
            'incident_time' => !empty($this->incident_time) ? $this->incident_time : '',
            'injury_type' => !empty($this->injury_type) ? $this->injury_type : '',
            'pdf' => !empty($this->pdf) ? $this->pdf : '',
            'injury_detail' => !empty($this->injury_detail) ? $this->injury_detail : '',
            'people_involved' => !empty($this->people_involved) ? json_decode($this->people_involved) : '',
            'vehicle' => !empty($this->vehicle) ? json_decode($this->vehicle) : '',
            'emergency_services' => !empty($this->emergency_services) ? json_decode($this->emergency_services) : '',
            'wittness' => !empty($this->wittness) ? json_decode($this->wittness) : '',
            'signature' => !empty($this->signature) ? returnImgPathCheck('uploads', $this->signature) : '',
            'photo' => !empty($photos) ? $photos : '',

        ];
    }
    
}
