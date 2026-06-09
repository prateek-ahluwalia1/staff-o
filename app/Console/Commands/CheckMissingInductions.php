<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Notifications\InductionRequiredNotification;

class CheckMissingInductions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-missing-inductions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check guards with missing inductions (certificate_path null and marks = 0) and send notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Start log
        Log::info('=== Check Missing Inductions Command Started ===');
        $this->info('Checking for guards with missing inductions...');

        try {
            // Get distinct guard_ids with missing inductions
            $missingInductionGuards = DB::table('guard_questionnaire_details')
                ->whereNull('certificate_path')
                ->where('marks', 0)
                ->distinct()
                ->pluck('guard_id');

            // Log the query result
            Log::info('Query executed: guard_questionnaire_details with NULL certificate_path and marks=0');
            Log::info('Found ' . $missingInductionGuards->count() . ' distinct guard(s)', [
                'guard_ids' => $missingInductionGuards->toArray(),
                'count' => $missingInductionGuards->count()
            ]);

            if ($missingInductionGuards->isEmpty()) {
                $this->info('No guards found with missing inductions.');
                Log::info('No guards with missing inductions found. Command completed.');
                return Command::SUCCESS;
            }

            $this->info('Found ' . $missingInductionGuards->count() . ' guard(s) with missing inductions.');
            $this->info('Guard IDs: ' . $missingInductionGuards->implode(', '));

            // Get detailed count per guard
            $missingDetails = DB::table('guard_questionnaire_details')
                ->select('guard_id', DB::raw('COUNT(*) as missing_count'))
                ->whereNull('certificate_path')
                ->where('marks', 0)
                ->whereIn('guard_id', $missingInductionGuards)
                ->groupBy('guard_id')
                ->get();

            Log::info('Missing details per guard:', $missingDetails->toArray());

            // Get guard details from users table
            $guards = User::whereIn('id', $missingInductionGuards)->get();

            if ($guards->isEmpty()) {
                $this->warn('Guards found in questionnaire but not in users table.');
                Log::warning('Guards found in questionnaire but not in users table', [
                    'questionnaire_guard_ids' => $missingInductionGuards->toArray()
                ]);
                return Command::SUCCESS;
            }

            Log::info('Retrieved ' . $guards->count() . ' guard(s) from users table');

            $notificationsSent = 0;
            $notificationsFailed = 0;
            $failedGuards = [];

            // Process each guard
            foreach ($guards as $guard) {
                $this->info("Processing Guard ID: {$guard->id}...");
                
                $missingData = $missingDetails->firstWhere('guard_id', $guard->id);
                $missingCount = $missingData ? $missingData->missing_count : 0;

                $notificationData = [
                    'notification_token' => $guard->notification_token,
                    'message'            => "Complete Your Induction. Please check your app.",
                    'title'              => 'Induction Missing',
                    'page'               => 'missing-induction',
                    'missing_count'      => $missingCount,
                    'guard_id'           => $guard->id,
                ];

                // Log notification data
                Log::info('Preparing notification for guard', [
                    'guard_id' => $guard->id,
                    'email' => $guard->email,
                    'has_notification_token' => !empty($guard->notification_token),
                    'missing_count' => $missingCount,
                    'notification_data' => $notificationData
                ]);

                // Send push notification
                if (function_exists('send_push_notification')) {
                    try {
                        $result = send_push_notification($notificationData);
                        
                        // Log the result
                        Log::info('Push notification sent', [
                            'guard_id' => $guard->id,
                            'result' => $result,
                            'notification_token' => $guard->notification_token
                        ]); 
                    } catch (\Exception $e) {
                        $notificationsFailed++;
                        $failedGuards[] = $guard->id;
                        $this->error("✗ Failed to send notification to Guard ID: {$guard->id} - " . $e->getMessage());
                        
                        Log::error('Failed to send push notification', [
                            'guard_id' => $guard->id,
                            'email' => $guard->email,
                            'error_message' => $e->getMessage(),
                            'error_trace' => $e->getTraceAsString()
                        ]);
                    }
                    
                } else {
                    $notificationsFailed++;
                    $failedGuards[] = $guard->id;
                    $this->error("✗ Function 'send_push_notification' does not exist.");
                    
                    Log::critical('send_push_notification function not defined', [
                        'guard_id' => $guard->id,
                        'file' => __FILE__,
                        'line' => __LINE__
                    ]);
                    
                    // Log to database
                    $this->logToDatabase([
                        'guard_id' => $guard->id,
                        'email' => $guard->email,
                        'missing_count' => $missingCount,
                        'status' => 'failed',
                        'error_message' => 'send_push_notification function does not exist',
                        'sent_at' => now()
                    ]);
                }
            }
        } catch (\Exception $e) {
            $this->error('Command failed: ' . $e->getMessage());
            Log::critical('CheckMissingInductions command failed', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

}