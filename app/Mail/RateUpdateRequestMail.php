<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RateUpdateRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $contractorName;
    public $contractorEmail;
    public $rateTitle;
    public $state;
    public $reason;
    public $rateRows; // [ ['label' => 'Metro Mon-Fri Day', 'old' => 34, 'new' => 40, 'changed' => true], ... ]

    public function __construct($contractorName, $contractorEmail, $rateTitle, $state, $reason, $rateRows)
    {
        $this->contractorName  = $contractorName;
        $this->contractorEmail = $contractorEmail;
        $this->rateTitle       = $rateTitle;
        $this->state           = $state;
        $this->reason          = $reason;
        $this->rateRows        = $rateRows;
    }

    public function build()
    {
        return $this->subject("Rate Update Request — {$this->contractorName} ({$this->rateTitle})")
            ->view('emails.rate-update-request')
            ->with([
                'contractorName'  => $this->contractorName,
                'contractorEmail' => $this->contractorEmail,
                'rateTitle'       => $this->rateTitle,
                'state'           => $this->state,
                'reason'          => $this->reason,
                'rateRows'        => $this->rateRows,
            ]);
    }
}