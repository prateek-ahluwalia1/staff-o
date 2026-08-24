<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PlatformFeeInvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $contractorName;
    public string $pdfBytes;
    public string $invoiceNumber;
    public float $netPayout;

    /**
     * @param string $contractorName  Resource partner / company name
     * @param string $pdfBytes        Raw PDF bytes from PlatformFeeInvoiceService::generatePdf()
     * @param string $invoiceNumber   e.g. 'STF-FEE-1082'
     * @param float  $netPayout       Net amount transferred, for the email body
     */
    public function __construct(string $contractorName, string $pdfBytes, string $invoiceNumber, float $netPayout)
    {
        $this->contractorName = $contractorName;
        $this->pdfBytes       = $pdfBytes;
        $this->invoiceNumber  = $invoiceNumber;
        $this->netPayout      = $netPayout;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Payout Released — Invoice #{$this->invoiceNumber} — Staffoo",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.platform-fee-invoice',
            with: [
                'contractorName' => $this->contractorName,
                'invoiceNumber'  => $this->invoiceNumber,
                'netPayout'      => number_format($this->netPayout, 2),
            ],
        );
    }

    public function attachments(): array
    {
        return [
            \Illuminate\Mail\Mailables\Attachment::fromData(
                fn () => $this->pdfBytes,
                "Staffoo-Fee-Invoice-{$this->invoiceNumber}.pdf"
            )->withMime('application/pdf'),
        ];
    }
}