<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CancellationReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $clientName,
        public readonly string $receiptNumber,
        public readonly float  $totalCharged,
        public readonly float  $cancellationFee,
        public readonly float  $refundAmount,
        public readonly array  $cancellationDetails,
        public readonly string $paymentIntentId,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Job Cancellation Receipt {$this->receiptNumber}");
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.cancellation-receipt',
            with: [
                'clientName'           => $this->clientName,
                'receiptNumber'        => $this->receiptNumber,
                'totalCharged'         => $this->totalCharged,
                'cancellationFee'      => $this->cancellationFee,
                'refundAmount'         => $this->refundAmount,
                'cancellationDetails'  => $this->cancellationDetails,
                'paymentIntentId'      => $this->paymentIntentId,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
