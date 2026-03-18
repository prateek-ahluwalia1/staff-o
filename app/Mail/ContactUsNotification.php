<?php
// app/Mail/ContactUsNotification.php

namespace App\Mail;

use App\Models\ContactUs;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactUsNotification extends Mailable
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
            subject: '🔔 New Contact Form Submission - ' . $this->contact->inquiry_type,
            tags: ['contact-form', 'admin-notification'],
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
            view: 'emails.contact-us-notification',
            with: [
                'name' => $this->contact->name,
                'email' => $this->contact->email,
                'phone' => $this->contact->phone,
                'company' => $this->contact->company,
                'inquiryType' => $this->contact->inquiry_type,
                'subject' => $this->contact->subject,
                'contactMessage' => $this->contactMessage,
                'submittedAt' => $this->contact->submitted_at ? $this->contact->submitted_at->format('F j, Y, g:i a') : now()->format('F j, Y, g:i a'),
                'source' => $this->contact->source,
                'contactId' => $this->contact->id,
                'appName' => config('app.name'),
                'appUrl' => config('app.url'),
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