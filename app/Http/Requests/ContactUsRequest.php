<?php
// app/Http/Requests/ContactUsRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactUsRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'inquiry_type' => 'required|string|max:100',
            'subject' => 'required|string|max:500',
            'message' => 'required|string',
            'source' => 'nullable|string|max:100',
            'submitted_at' => 'nullable|date'
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Name is required',
            'email.required' => 'Email is required',
            'email.email' => 'Please provide a valid email address',
            'inquiry_type.required' => 'Inquiry type is required',
            'subject.required' => 'Subject is required',
            'message.required' => 'Message is required'
        ];
    }
}