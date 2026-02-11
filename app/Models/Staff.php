<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $table = 'staff';

    protected $fillable = [
        'user_id',
        'customer_id',
        'contractor_id',
        'employee_code',
        'designation',
        'joining_date',
        'salary',
    ];

    protected $casts = [
        'joining_date' => 'date',
        'salary' => 'decimal:2',
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
