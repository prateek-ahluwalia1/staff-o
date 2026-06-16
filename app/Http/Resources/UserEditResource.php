<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserEditResource extends JsonResource
{
    /**
     * Disable the default data wrapping if you want absolute control over the root keys.
     */
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        // Pull the sub-profile relation dynamically based on user type
        $profile = match ($this->user_type) {
            'customer'   => $this->relationLoaded('customer') ? $this->customer : null,
            'contractor' => $this->relationLoaded('contractor') ? $this->contractor : null,
            'staff'      => $this->relationLoaded('staff') ? $this->staff : null,
            default      => null,
        };

        $documentsCollection = collect($this->documents);

        $documents = $documentsCollection->keyBy('document_type');

        $passport        = $documents->get('passport');
        $securityLicense = $documents->get('security_license');
        $firstAid        = $documents->get('first_aid');

        return [
            'name'                    => $this->name,
            'email'                   => $this->email,
            'date_of_birth'           => $profile?->date_of_birth ?? null,
            'address'                 => $this->address ?? null,
            'city'                    => $this->city ?? null,
            'state'                   => $this->state ?? null,
            'country'                 => $this->country ?? null,
            'phone'                   => $this->phone ?? null,
            
            // Passport
            'passport_no'             => $passport?->document_no ?? null,
            'passport_attachment'     => $passport?->file ?? null,
            'passport_expiry'         => $passport?->document_expiry ?? null,

            // Security License
            'security_license_no'     => $securityLicense?->document_no ?? null,
            'security_license_expiry' => $securityLicense?->document_expiry ?? null,
            'security_license_file'   => $securityLicense?->file ?? null,

            // First Aid
            'first_aid_no'            => $firstAid?->document_no ?? null,
            'first_aid_expiry'        => $firstAid?->document_expiry ?? null,
            'first_aid_file'          => $firstAid?->file ?? null,
        ];
    }
}