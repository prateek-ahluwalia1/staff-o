<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AutoSignOut extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'job:auto-signout 
                            {--minutes=30 : Number of minutes after shift end to auto signout}
                            {--dry-run : Run without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically sign out employees who have not signed out after their shift ended';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting auto sign-out process...');
        $this->newLine();

        $minutes = (int) $this->option('minutes');
        $dryRun = $this->option('dry-run');
        $currentTime = time();
        
        // Calculate cut-off time (current time + 24 hours to include all ended shifts)
        $cutOffTime = $currentTime + (60 * 60 * 24);
        
        // Get all active shifts that have ended
        $notSignoutShifts = DB::table('job_roster_activities')
            ->join('job_rosters', 'job_roster_activities.job_roster_id', '=', 'job_rosters.id')
            ->where('job_roster_activities.status', 1)
            ->where('job_rosters.end', '<=', date('Y-m-d H:i:s', $cutOffTime))
            ->select(
                'job_roster_activities.id as activity_id',
                'job_roster_activities.job_roster_id',
                'job_rosters.end as shift_end_time'
            )
            ->get();

        $totalFound = $notSignoutShifts->count();
        $this->info("Found {$totalFound} active shifts that have ended.");
        $this->newLine();

        if ($totalFound === 0) {
            $this->info('No shifts to process.');
            return 0;
        }

        $processed = 0;
        $autoSignedOut = 0;
        $errors = 0;

        foreach ($notSignoutShifts as $shift) {
            try {
                $jobEndTime = strtotime($shift->shift_end_time);
                $currentTime = time();
                $diffInMinutes = round(($currentTime - $jobEndTime) / 60, 2);

                // Check if shift ended more than X minutes ago
                if ($diffInMinutes > $minutes) {
                    $processed++;
                    
                    $this->info("Processing shift ID: {$shift->activity_id} (Job roster: {$shift->job_roster_id}) - Ended {$diffInMinutes} minutes ago");
                    
                    if (!$dryRun) {
                        // Update job_roster_activities
                        DB::table('job_roster_activities')
                            ->where('id', $shift->activity_id)
                            ->update([
                                'signout_time' => date('Y-m-d H:i:s'),
                                'auto_signout' => 1,
                                'status' => 0
                            ]);

                        // Update job_rosters
                        DB::table('job_rosters')
                            ->where('id', $shift->job_roster_id)
                            ->update([
                                'job_status' => 'completed',
                                'signin_status' => 0
                            ]);

                        $autoSignedOut++;
                        $this->info("✓ Auto signed out shift ID: {$shift->activity_id}");
                    } else {
                        $this->info("[DRY RUN] Would sign out shift ID: {$shift->activity_id}");
                    }
                    
                    $this->newLine();
                }
            } catch (\Exception $e) {
                $errors++;
                Log::error("Auto sign-out failed for shift {$shift->activity_id}: " . $e->getMessage());
                $this->error("✗ Error processing shift ID: {$shift->activity_id} - {$e->getMessage()}");
                $this->newLine();
            }
        }

        // Summary
        $this->line('=== Summary ===');
        $this->line("Total shifts checked: {$totalFound}");
        $this->line("Processed: {$processed}");
        
        if ($dryRun) {
            $this->line("Auto signed out (simulated): {$processed}");
            $this->warn('This was a DRY RUN - no changes were made to the database.');
        } else {
            $this->line("Auto signed out: {$autoSignedOut}");
        }
        
        $this->line("Errors: {$errors}");
        $this->newLine();

        if ($errors > 0) {
            Log::warning("Auto sign-out completed with {$errors} errors.");
            return 1;
        }

        $this->info('Auto sign-out process completed successfully!');
        return 0;
    }
}