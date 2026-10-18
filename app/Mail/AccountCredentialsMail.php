<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AccountCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public string $accountType,
        public string $typeExplanation,
    ) {
    }

    public function build()
    {
        return $this->from('no-reply@staffoo.com.au', 'STAFFOO')
            ->subject('Your STAFFOO account has been created')
            ->view('emails.account-credentials');
    }
}
