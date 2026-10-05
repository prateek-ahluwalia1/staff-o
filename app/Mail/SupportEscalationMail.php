<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SupportEscalationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function build()
    {
        $urgent = strtolower($this->data['urgency'] ?? '') === 'urgent' ? '[URGENT] ' : '';
        $issue  = $this->data['issue'] ?: 'Support request';

        return $this->subject("{$urgent}Support — {$issue}")
            ->view('emails.support-escalation')
            ->with(['data' => $this->data]);
    }
}
