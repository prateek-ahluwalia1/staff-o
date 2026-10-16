<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserTypeChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $userName;
    public string $oldType;
    public string $newType;
    public array  $profileSteps;
    public string $loginUrl;

    public function __construct(
        string $userName,
        string $oldType,
        string $newType,
        array  $profileSteps,
        string $loginUrl
    ) {
        $this->userName     = $userName;
        $this->oldType      = $oldType;
        $this->newType      = $newType;
        $this->profileSteps = $profileSteps;
        $this->loginUrl     = $loginUrl;
    }

    public function build()
    {
        return $this
            ->subject('Your account type has been updated to ' . ucfirst($this->newType))
            ->view('emails.user-type-changed');
    }
}