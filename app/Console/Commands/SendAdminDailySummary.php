<?php

namespace App\Console\Commands;

use App\Models\JobRoster;
use App\Models\User;
use App\Services\WhatsappNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * php artisan whatsapp:send-admin-daily-summary
 *
 * Once a day, WhatsApps the admin numbers configured under the
 * "admin.daily_summary" recipient group (managed from the superadmin
 * panel — see NotificationRecipient) with:
 *   - how many jobs were posted in the last 24 hours
 *   - how many accounts were created in the last 24 hours, broken down by
 *     staff / resource partner / client
 *
 * Gated by the "admin.daily_summary" row in notification_settings, so it
 * can be turned off from the panel without touching the schedule.
 */
class SendAdminDailySummary extends Command
{
    protected $signature = 'whatsapp:send-admin-daily-summary';
    protected $description = 'WhatsApp admin numbers a daily digest of job postings and new accounts';

    public function handle(WhatsappNotificationService $whatsapp)
    {
        $since = now()->subDay();

        $jobsPosted = JobRoster::where('created_at', '>=', $since)->count();

        $staffCreated       = User::where('user_type', 'staff')->where('created_at', '>=', $since)->count();
        $contractorsCreated = User::where('user_type', 'contractor')->where('created_at', '>=', $since)->count();
        $clientsCreated     = User::where('user_type', 'customer')->where('created_at', '>=', $since)->count();

        $whatsapp->notify('admin.daily_summary', [['group' => 'admin.daily_summary']], [
            'date'                 => now()->format('d M Y'),
            'jobs_posted'          => $jobsPosted,
            'accounts_created'     => $staffCreated + $contractorsCreated + $clientsCreated,
            'staff_created'        => $staffCreated,
            'contractors_created'  => $contractorsCreated,
            'clients_created'      => $clientsCreated,
        ]);

        Log::info('[AdminDailySummary] sent', [
            'jobs_posted' => $jobsPosted,
            'accounts_created' => $staffCreated + $contractorsCreated + $clientsCreated,
        ]);

        $this->info("Daily summary dispatched: {$jobsPosted} job(s), " . ($staffCreated + $contractorsCreated + $clientsCreated) . ' account(s).');

        return 0;
    }
}
