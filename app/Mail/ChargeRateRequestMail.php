<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ChargeRateRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $contractorName;
    public $contractorEmail;
    public $title;
    public $state;
    public $rateRows; // [ ['label' => 'Metro Mon-Fri Day', 'value' => 34], ... ]

    public function __construct($contractorName, $contractorEmail, $title, $state, $rateRows)
    {
        $this->contractorName  = $contractorName;
        $this->contractorEmail = $contractorEmail;
        $this->title           = $title;
        $this->state           = $state;
        $this->rateRows        = $rateRows;
    }

    public function build()
    {
        return $this->subject("New Charge Rate Request — {$this->contractorName}")
            ->view('emails.charge-rate-request')
            ->with([
                'contractorName'  => $this->contractorName,
                'contractorEmail' => $this->contractorEmail,
                'title'           => $this->title,
                'state'           => $this->state,
                'rateRows'        => $this->rateRows,
            ]);
    }
}