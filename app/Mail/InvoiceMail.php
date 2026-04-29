<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $pdfBase64,   // ← changed from pdfBytes
        public readonly string $invoiceNumber,
        public readonly string $clientName,
        public readonly bool   $isAdmin = false,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->isAdmin
            ? "New Job Invoice {$this->invoiceNumber} – Admin Copy"
            : "Your Invoice {$this->invoiceNumber} – Staff Copy";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice',
            with: [
                'invoiceNumber' => $this->invoiceNumber,
                'clientName'    => $this->clientName,
                'isAdmin'       => $this->isAdmin,
            ],
        );
    }

    public function attachments(): array
    {
        return [
            \Illuminate\Mail\Mailables\Attachment::fromData(
                fn () => base64_decode($this->pdfBase64),  // ← decode here
                "Invoice-{$this->invoiceNumber}.pdf"
            )->withMime('application/pdf'),
        ];
    }
}