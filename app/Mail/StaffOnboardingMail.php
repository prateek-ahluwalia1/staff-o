<?php

use Illuminate\Mail\Mailable;

class StaffOnboardingMail extends Mailable
{
    public function build()
    {
        return $this->subject('Welcome to Staffoo – Onboarding Instructions')
            ->view('emails.staff_onboarding');
    }
}