<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ChargeRateRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $contractorName;
    public $title;
    public $state;
    public $reviewNote;

    public function __construct($contractorName, $title, $state, $reviewNote)
    {
        $this->contractorName = $contractorName;
        $this->title          = $title;
        $this->state          = $state;
        $this->reviewNote     = $reviewNote;
    }

    public function build()
    {
        return $this->subject("Your Charge Rate Request Was Not Approved")
            ->view('emails.charge-rate-rejected')
            ->with([
                'contractorName' => $this->contractorName,
                'title'          => $this->title,
                'state'          => $this->state,
                'reviewNote'     => $this->reviewNote,
            ]);
    }
}