<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Jobs\SendJobNotificationJob;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('app:check-missing-inductions')->dailyAt('10:00');
        $schedule->command('documents:check-expiry')->dailyAt('11:00');
        $schedule->command('app:send-job-notifications')
        ->everyMinute()
        ->withoutOverlapping(60)
        ->runInBackground()
        ->onOneServer();
        $schedule->command('job:auto-signout')
            ->everyMinute()
            ->withoutOverlapping();
        $schedule->command('timesheet:send-weekly')
            ->weekly()
            ->mondays()
            ->at('08:00');
        $schedule->command('jobs:send-payment-reminders')->everyFifteenMinutes();
         // $schedule->command('app:sync-public-holidays')->twiceYearly(1, 1);




    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
