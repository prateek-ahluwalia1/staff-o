<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContractSignedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $recipientName;
    public $contractorName;
    public $state;
    public $contractNumber;
    public $signedPdfBytes;

    public function __construct($recipientName, $contractorName, $state, $contractNumber, $signedPdfBytes)
    {
        $this->recipientName  = $recipientName;
        $this->contractorName = $contractorName;
        $this->state          = $state;
        $this->contractNumber = $contractNumber;
        $this->signedPdfBytes = $signedPdfBytes;
    }

    public function build()
    {
        return $this->subject("Signed Subcontractor Agreement — {$this->contractNumber}")
            ->view('emails.contract-signed')
            ->with([
                'recipientName'  => $this->recipientName,
                'contractorName' => $this->contractorName,
                'state'          => $this->state,
                'contractNumber' => $this->contractNumber,
            ])
            ->attachData($this->signedPdfBytes, "contract-{$this->contractNumber}-signed.pdf", [
                'mime' => 'application/pdf',
            ]);
    }
}