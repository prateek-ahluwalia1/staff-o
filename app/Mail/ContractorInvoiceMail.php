<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContractorInvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public $clientName;
    public $pdfBytes;
    public $invoiceNumber;
    public $paymentLink;
    public $contractorName;

    public function __construct($clientName, $pdfBytes, $invoiceNumber, $paymentLink, $contractorName)
    {
        $this->clientName     = $clientName;
        $this->pdfBytes       = $pdfBytes;
        $this->invoiceNumber  = $invoiceNumber;
        $this->paymentLink    = $paymentLink;
        $this->contractorName = $contractorName;
    }

    public function build()
    {
        return $this->subject("Invoice {$this->invoiceNumber} from {$this->contractorName}")
            ->view('emails.contractor-invoice')
            ->with([
                'clientName'     => $this->clientName,
                'invoiceNumber'  => $this->invoiceNumber,
                'paymentLink'    => $this->paymentLink,
                'contractorName' => $this->contractorName,
            ])
            ->attachData($this->pdfBytes, "invoice-{$this->invoiceNumber}.pdf", [
                'mime' => 'application/pdf',
            ]);
    }
}