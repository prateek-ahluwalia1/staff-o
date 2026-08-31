<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ChargeRateApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $contractorName;
    public $title;
    public $state;
    public $effectiveFrom;

    public function __construct($contractorName, $title, $state, $effectiveFrom)
    {
        $this->contractorName = $contractorName;
        $this->title          = $title;
        $this->state          = $state;
        $this->effectiveFrom  = $effectiveFrom;
    }

    public function build()
    {
        return $this->subject("Your Charge Rate Request Was Approved")
            ->view('emails.charge-rate-approved')
            ->with([
                'contractorName' => $this->contractorName,
                'title'          => $this->title,
                'state'          => $this->state,
                'effectiveFrom'  => $this->effectiveFrom,
            ]);
    }
}