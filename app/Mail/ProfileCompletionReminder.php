<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProfileCompletionReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public int $completionPercentage,
        public array $missingItems = []
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Action Required: Complete Your Profile - ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.profile-completion-reminder',
            with: [
                'user' => $this->user,
                'percentage' => $this->completionPercentage,
                'missingItems' => $this->missingItems,
                'userType' => $this->user->user_type,
            ],
        );
    }
}