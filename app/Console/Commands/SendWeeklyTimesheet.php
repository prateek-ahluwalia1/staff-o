<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Log;

class SendWeeklyTimesheet extends Command
{
    protected $signature = 'timesheet:send-weekly';
    protected $description = 'Send weekly timesheet emails to contractors, staff, and admins';

    public function handle()
    {
        $this->info('Starting weekly timesheet email sending...');
        Log::info('Weekly timesheet email job started');
        
        try {
            $controller = new ReportController();
            $response = $controller->sendWeeklyTimesheetEmails();
            
            $result = $response->getData();
            
            if ($result->success) {
                $this->info('✅ Weekly timesheet emails sent successfully!');
                $this->info('📧 Sent to: ' . implode(', ', $result->data->sent));
                
                if (!empty($result->data->failed)) {
                    $this->warn('⚠️ Failed emails:');
                    foreach ($result->data->failed as $failed) {
                        $this->warn("   - {$failed->email}: {$failed->error}");
                    }
                }
                
                Log::info('Weekly timesheet emails completed successfully', [
                    'sent' => $result->data->sent,
                    'failed' => $result->data->failed ?? []
                ]);
            } else {
                $this->error('❌ Failed to send weekly timesheet emails: ' . $result->message);
                Log::error('Weekly timesheet email failed', ['message' => $result->message]);
            }
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            Log::error('Weekly timesheet email error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }
}