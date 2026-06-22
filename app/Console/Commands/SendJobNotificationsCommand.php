<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\SendJobNotificationJob;

class SendJobNotificationsCommand extends Command
{
    protected $signature = 'app:send-job-notifications';
    protected $description = 'Dispatches the job notifications queue';

    public function handle()
    {
        // Dispatch your job cleanly here
        SendJobNotificationJob::dispatch();
    }
}