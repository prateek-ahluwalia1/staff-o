<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $table = 'staff';

    protected $fillable = [
        'user_id',
        'profile_image',
        'gender',
        'phone',
        'staff_document_type',
        'tfn_form',
        'super_form',
        'onboarding_form',
        'security_license_no',
        'date_of_birth',
        'is_policy_accepted',
        'current_coordinates',
        'origin_country'
    ];

    /* ======================
        RELATIONS
    ====================== */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function contractor()
    {
        return $this->belongsTo(Contractor::class);
    }

    /* ======================
        HELPERS
    ====================== */

    public function belongsToCustomer()
    {
        return !is_null($this->customer_id);
    }

    public function belongsToContractor()
    {
        return !is_null($this->contractor_id);
    }
}
