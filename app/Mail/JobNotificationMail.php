<?php

namespace App\Mail;

use App\Models\JobRoster;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class JobNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public JobRoster $job,
        public string $title,
        public string $message
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->title);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.job-notification',
            with: [
                'job'     => $this->job,
                'title'   => $this->title,
                'message' => $this->message,
            ]
        );
    }
}