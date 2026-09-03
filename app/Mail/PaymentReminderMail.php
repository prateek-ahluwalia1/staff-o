<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $recipientName;
    public $jobs; // [ ['site' => ..., 'start' => ..., 'end' => ..., 'amount' => ..., 'client_name' => ...], ... ]
    public $isAdmin;

    public function __construct($recipientName, $jobs, $isAdmin = false)
    {
        $this->recipientName = $recipientName;
        $this->jobs          = $jobs;
        $this->isAdmin       = $isAdmin;
    }

    public function build()
    {
        $count = count($this->jobs);
        $subject = $this->isAdmin
            ? "Payment Reminder Digest — {$count} Job" . ($count === 1 ? '' : 's') . " Pending"
            : "Payment Reminder — {$count} Job" . ($count === 1 ? '' : 's') . " Awaiting Payment";

        return $this->subject($subject)
            ->view('emails.payment-reminder')
            ->with([
                'recipientName' => $this->recipientName,
                'jobs'          => $this->jobs,
                'isAdmin'       => $this->isAdmin,
            ]);
    }
}