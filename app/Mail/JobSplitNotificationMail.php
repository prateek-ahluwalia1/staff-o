<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class JobSplitNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $clientName;
    public $siteAddress;
    public $partsCount;
    public $shiftRows; // [ ['start'=>..,'end'=>..,'hours'=>..,'guard_name'=>..], ... ]

    public function __construct($clientName, $siteAddress, $partsCount, $shiftRows)
    {
        $this->clientName  = $clientName;
        $this->siteAddress = $siteAddress;
        $this->partsCount  = $partsCount;
        $this->shiftRows   = $shiftRows;
    }

    public function build()
    {
        return $this->subject("Your Job Has Been Split Into {$this->partsCount} Parts")
            ->view('emails.job-split-notification')
            ->with([
                'clientName'  => $this->clientName,
                'siteAddress' => $this->siteAddress,
                'partsCount'  => $this->partsCount,
                'shiftRows'   => $this->shiftRows,
            ]);
    }
}