<?php

namespace App\Mail;

use App\Models\Job;
use App\Models\JobRoster;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class ResourcePartnerRemovedClient extends Mailable
{
    use Queueable, SerializesModels;

    public $job;
    public $client;
    public $resourcePartner;
    public $emailData;

    /**
     * Create a new message instance.
     */
    public function __construct(JobRoster $job, User $client, $resourcePartner)
    {
        $this->job = $job;
        $this->client = $client;
        $this->resourcePartner = $resourcePartner;
        
        $this->emailData = [
            'client_name' => $client->name,
            'job_id' => $job->id,
            'job_title' => $job->title ?? 'Job',
            'job_reference' => $job->reference ?? $job->id,
            'resource_partner_name' => $resourcePartner ? $resourcePartner->name : 'Resource Partner',
            'start_date' => $job->start ? Carbon::parse($job->start)->format('d/m/Y H:i') : 'Not specified',
            'end_date' => $job->end ? Carbon::parse($job->end)->format('d/m/Y H:i') : 'Not specified',
            'reason' => $job->reason ?? null,
            'removed_at' => Carbon::now()->format('d/m/Y H:i'),
            'company_logo' => asset('images/logo.png'),
            'company_name' => config('app.name', 'Staffoo')
        ];
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->from(config('mail.from.address'), config('mail.from.name'))
                    ->subject('Resource Partner Removed from Your Job #' . $this->emailData['job_reference'])
                    ->view('emails.resource_partner_removed')
                    ->with($this->emailData);
    }
}