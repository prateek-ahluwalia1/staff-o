<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $name, public string $code)
    {
    }

    public function build()
    {
        return $this->from('no-reply@staffoo.com.au', 'STAFFOO')
            ->subject('Your STAFFOO verification code')
            ->view('emails.otp-code');
    }
}
