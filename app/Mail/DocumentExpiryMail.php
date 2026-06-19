<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentExpiryMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $details;

    public function __construct($details)
    {
        $this->details = $details;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⚠️ Document Expiry Alert - ' . $this->details['staff_name'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.document-expiry',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}