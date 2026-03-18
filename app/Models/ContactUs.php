<?php
// app/Models/ContactUs.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactUs extends Model
{
    use HasFactory;

    protected $table = 'contact_us';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'company',
        'inquiry_type',
        'subject',
        'message',
        'source',
        'submitted_at',
        'status',
        'admin_notes'
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Scope for pending inquiries
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Scope for reviewed inquiries
    public function scopeReviewed($query)
    {
        return $query->where('status', 'reviewed');
    }

    // Get inquiry types
    public static function getInquiryTypes()
    {
        return [
            'General Inquiry',
            'Candidate Support',
            'Technical Support',
            'Sales',
            'Partnership',
            'Feedback',
            'Other'
        ];
    }
}