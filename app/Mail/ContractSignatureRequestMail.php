<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContractSignatureRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $contractorName;
    public $state;
    public $contractNumber;
    public $signingLink;

    public function __construct($contractorName, $state, $contractNumber, $signingLink)
    {
        $this->contractorName = $contractorName;
        $this->state          = $state;
        $this->contractNumber = $contractNumber;
        $this->signingLink    = $signingLink;
    }

    public function build()
    {
        return $this->subject("Action Required: Sign Your Subcontractor Agreement ({$this->state})")
            ->view('emails.contract-signature-request')
            ->with([
                'contractorName' => $this->contractorName,
                'state'          => $this->state,
                'contractNumber' => $this->contractNumber,
                'signingLink'    => $this->signingLink,
            ]);
    }
}