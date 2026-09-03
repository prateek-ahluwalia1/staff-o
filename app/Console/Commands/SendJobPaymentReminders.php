<?php

namespace App\Console\Commands;

use App\Mail\PaymentReminderMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendJobPaymentReminders extends Command
{
    /**
     * php artisan jobs:send-payment-reminders
     */
    protected $signature = 'jobs:send-payment-reminders';
    protected $description = 'Send payment reminder emails for accepted jobs with contractor_invoice=0 and payment_status=not_required';

    public function handle()
    {
        $jobs = DB::table('job_rosters')
            ->join('sites', 'sites.id', '=', 'job_rosters.site_id')
            ->whereNotNull('job_rosters.accepted_by')
            ->where('job_rosters.contractor_invoice', 0)
            ->where('job_rosters.payment_status', 'not_required')
            ->where('start', '>', now())
            ->select('job_rosters.*', 'sites.site_name', 'sites.address')
            ->get();

        if ($jobs->isEmpty()) {
            $this->info('No jobs need a payment reminder right now.');
            return 0;
        }

        // ── Group by client (created_by) so each client gets ONE email
        // listing all their pending jobs, not one email per job ──
        $jobsByClient = $jobs->groupBy('created_by');
        $processedRosterIds = [];
        $adminDigestJobs = [];

        foreach ($jobsByClient as $clientId => $clientJobs) {
            $client = DB::table('users')->where('id', $clientId)->first();

            if (!$client || empty($client->email)) {
                Log::warning('Skipping payment reminder — client not found or has no email', ['client_id' => $clientId]);
                continue;
            }

            $jobRows = $clientJobs->map(function ($job) {
                return [
                    'site'   => $job->site_name ?? $job->address ?? 'N/A',
                    'start'  => \Carbon\Carbon::parse($job->start)->format('d M Y, g:i A'),
                    'end'    => \Carbon\Carbon::parse($job->end)->format('d M Y, g:i A'),
                ];
            })->toArray();

            try {
                Mail::to($client->email)->send(new PaymentReminderMail(
                    $client->name ?? 'Client',
                    $jobRows,
                    false
                ));
                $this->info("Sent payment reminder to {$client->email} for " . count($jobRows) . ' job(s).');
            } catch (\Exception $e) {
                Log::error('Failed to send client payment reminder', [
                    'client_id' => $clientId,
                    'error' => $e->getMessage(),
                ]);
            }

            // Build the admin digest rows (includes client name, unlike the client's own email)
            foreach ($clientJobs as $job) {
                $adminDigestJobs[] = [
                    'site'        => $job->site_name ?? $job->address ?? 'N/A',
                    'start'       => \Carbon\Carbon::parse($job->start)->format('d M Y, g:i A'),
                    'end'         => \Carbon\Carbon::parse($job->end)->format('d M Y, g:i A'),
                    'client_name' => $client->name ?? 'N/A',
                ];
                $processedRosterIds[] = $job->id;
            }
        }

        // ── One consolidated digest to admin, covering every client ──
        $adminAddress = config('mail.staffoo_admin_address', 'admin@staffoo.com.au');
        if (!empty($adminDigestJobs)) {
            try {
                Mail::to($adminAddress)->send(new PaymentReminderMail(
                    'Admin',
                    $adminDigestJobs,
                    true
                ));
                $this->info("Sent admin digest covering " . count($adminDigestJobs) . ' job(s).');
            } catch (\Exception $e) {
                Log::error('Failed to send admin payment reminder digest', ['error' => $e->getMessage()]);
            }
        }

        $this->info('Payment reminder run complete: ' . count($processedRosterIds) . ' job(s) processed.');
        return 0;
    }
}