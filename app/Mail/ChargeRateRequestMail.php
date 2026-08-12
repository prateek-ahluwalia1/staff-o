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
    public $stateBlocks; // [ ['state' => 'vic', 'title' => '...', 'rateRows' => [...]], ... ]
    public $notes;

    public function __construct($contractorName, $contractorEmail, $stateBlocks, $notes = null)
    {
        $this->contractorName  = $contractorName;
        $this->contractorEmail = $contractorEmail;
        $this->stateBlocks     = $stateBlocks;
        $this->notes           = $notes;
    }

    public function build()
    {
        $stateList = collect($this->stateBlocks)->pluck('state')->map(fn($s) => strtoupper($s))->implode(', ');

        return $this->subject("New Charge Rate Request — {$this->contractorName} ({$stateList})")
            ->view('emails.charge-rate-request')
            ->with([
                'contractorName'  => $this->contractorName,
                'contractorEmail' => $this->contractorEmail,
                'stateBlocks'     => $this->stateBlocks,
                'notes'           => $this->notes,
            ]);
    }
}