<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class JobRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function build()
    {
        $site    = $this->data['site_name'] ?: ($this->data['address'] ?: 'new site');
        $flag    = empty($this->data['missing']) ? '' : '[INCOMPLETE] ';

        return $this->subject("{$flag}New job request — {$site}")
            ->view('emails.job-request')
            ->with(['data' => $this->data]);
    }
}
