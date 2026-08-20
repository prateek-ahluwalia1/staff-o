<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class StaffOnboardingMail extends Mailable
{
    public function build()
    {
        return $this->subject('Onboarding Instructions')
            ->view('emails.staff_onboarding');
    }
}