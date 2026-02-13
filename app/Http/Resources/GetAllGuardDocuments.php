<?php

namespace App\Http\Resources;

use App\Models\DocumentCategory;
use App\Models\GuardWorkDetail;
use Illuminate\Http\Resources\Json\JsonResource;

class GetAllGuardDocuments extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {

        return [
            'id' => $this->id,
            'user_id' => ($this->user_id != '' ? $this->user_id : ''),
            'document_name' => ($this->document_name != '' ? $this->document_name : ''),
            'document_type' => ($this->document_type != '' ? $this->document_type : ''),
            'document_expire' => ($this->document_expire == 'current, pending renewal' ? $this->document_expire : ($this->document_expire != '' ? usaToAus($this->document_expire) : '')),
            'document_no' =>  $this->document_no !='' ? $this->document_no : '',
            'file' => $this->file != '' ? returnImgPath('staff_documents',$this->file) : '',
        ];
    }
}
