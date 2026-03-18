<?php
// app/Mail/ContactAutoReply.php

namespace App\Mail;

use App\Models\ContactUs;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactAutoReply extends Mailable
{
    use Queueable, SerializesModels;

    public $contact;
    public $contactMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(ContactUs $contact)
    {
        $this->contact = $contact;
        $this->contactMessage = $contact->message;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '✅ Thank You for Contacting ' . config('app.name'),
            tags: ['contact-form', 'auto-reply'],
            metadata: [
                'contact_id' => $this->contact->id,
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-auto-reply',
            with: [
                'name' => $this->contact->name,
                'email' => $this->contact->email,
                'phone' => $this->contact->phone,
                'company' => $this->contact->company,
                'inquiryType' => $this->contact->inquiry_type,
                'subject' => $this->contact->subject,
                'contactMessage' => $this->contactMessage,
                'submittedAt' => $this->contact->submitted_at ? $this->contact->submitted_at->format('F j, Y, g:i a') : now()->format('F j, Y, g:i a'),
                'appName' => config('app.name'),
                'appUrl' => config('app.url'),
                'supportEmail' => config('mail.support_email', config('mail.from.address')),
                'supportPhone' => config('mail.support_phone', 'Not available'),
                'supportHours' => 'Monday - Friday, 9:00 AM - 6:00 PM (Your Timezone)',
                'year' => date('Y'),
                'teamName' => config('app.name') . ' Support Team',
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}