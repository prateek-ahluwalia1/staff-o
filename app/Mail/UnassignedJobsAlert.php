<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class UnassignedJobsAlert extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Collection $jobs) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[URGENT] Unassigned Jobs Alert - ' . now()->format('d M Y H:i'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.unassigned-jobs-alert',
            with: ['jobs' => $this->jobs],
        );
    }
}