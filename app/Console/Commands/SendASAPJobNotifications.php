<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SendASAPJobNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:asap-job';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send ASAP job notifications to contractors every 15 minutes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->hasUnassignedJobsToday()) {
            $this->info('No unassigned jobs found for today. Notifications not sent.');
            return;
        }
        
        $this->sendFirstCycleNotifications();
        
        $this->info('First cycle completed. Will send second cycle in 15 minutes...');
        
        sleep(900);
        
        if ($this->hasUnassignedJobsToday()) {
            $this->sendSecondCycleNotifications();
            $this->info('Both notification cycles completed successfully.');
        } else {
            $this->info('No unassigned jobs found for second cycle. Second cycle skipped.');
        }
    }

    /**
     * Check if there are any unassigned jobs for today
     */
    private function hasUnassignedJobsToday()
    {
        $startOfDay = Carbon::today()->startOfDay();
        $endOfDay = Carbon::today()->endOfDay();
        
        $jobs = DB::table('job_rosters')->with([('site')])
            ->whereNull('assigned_to')
            ->whereBetween('start', [$startOfDay, $endOfDay])
            ->get();
        
        return $jobs->count() > 0;
    }

    private function sendFirstCycleNotifications()
    {
        $guards = User::where('user_id', 1)
            ->where('is_active', 1)
            ->where('user_type', 'staff')
            ->select('id', 'name')
            ->get();

        $this->sendNotifications($guards, 'First Cycle');
    }

    /**
     * Send notifications to all other active contractors
     */
    private function sendSecondCycleNotifications()
    {
        $guards = User::whereNotIn('user_id', [1])
            ->where('user_type', 'contractor')
            ->where('is_active', 1)
            ->get();

        $this->sendNotifications($guards, 'Second Cycle');
    }

    /**
     * Send push notifications to users
     */
    private function sendNotifications($guards, $cycle)
    {
        $sentCount = 0;
        
        foreach ($guards as $grd) {
            $guard = User::where('id', $grd->id)
                ->where('is_active', 1)
                ->select('id', 'notification_token')
                ->first();
                
            if ($guard && $guard->notification_token) {
                send_push_notification([
                    'notification_token' => $guard->notification_token,
                    'message'            => "ASAP job has been published. Please check your app.",
                    'title'              => 'ASAP Job',
                    'page'               => 'asap-job-list'
                ]);
                $sentCount++;
            }
        }
        
        $this->info("{$cycle}: Sent notifications to {$sentCount} users.");
    }
}