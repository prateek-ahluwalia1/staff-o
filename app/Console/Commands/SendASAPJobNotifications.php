<?php

namespace App\Console\Commands;

use App\Jobs\SendSecondCycleNotificationJob;
use App\Models\JobRoster;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SendASAPJobNotifications extends Command
{
    protected $signature = 'notifications:asap-job';
    protected $description = 'Send ASAP job notifications to contractors every 15 minutes';

    public function handle()
    {
        try {
            Log::info('=== SendASAPJobNotifications command started ===');

            $rosterData = $this->getUnassignedJobsWithRoster();

            if (!$rosterData['has_jobs']) {
                $this->info('No unassigned jobs found for today. Notifications not sent.');
                Log::info('No unassigned jobs found. Command terminated.');
                return;
            }

            Log::info('Unassigned jobs found', [
                'job_count'      => $rosterData['jobs']->count(),
                'roster_details' => $rosterData['roster']
            ]);

            // ---- FIRST CYCLE runs immediately ----
            $this->sendFirstCycleNotifications($rosterData['roster']);
            $this->info('First cycle completed. Second cycle queued for 15 minutes later.');
            Log::info('First cycle completed. Dispatching second cycle with 15 min delay.');

            // ---- SECOND CYCLE dispatched to queue with 15 min delay ----
            SendSecondCycleNotificationJob::dispatch()
                ->delay(now()->addMinutes(15));

            Log::info('Second cycle job dispatched successfully.');
            Log::info('=== SendASAPJobNotifications command finished ===');

        } catch (\Exception $e) {
            Log::error('Critical error in handle method', [
                'error_message' => $e->getMessage(),
                'error_line'    => $e->getLine(),
                'error_file'    => $e->getFile()
            ]);
            $this->error('An error occurred: ' . $e->getMessage());
        }
    }

    private function getUnassignedJobsWithRoster()
    {
        try {
            $startOfDay = Carbon::today()->startOfDay();
            $endOfDay   = Carbon::today()->endOfDay();

            $jobs = JobRoster::with('site')
                ->whereNull('assigned_to')
                ->whereBetween('start', [$startOfDay, $endOfDay])
                ->get();

            $roster = JobRoster::with('site')
                ->whereNull('assigned_to')
                ->whereBetween('start', [$startOfDay, $endOfDay])
                ->get()
                ->toArray();

            return [
                'has_jobs' => $jobs->count() > 0,
                'jobs'     => $jobs,
                'roster'   => $roster
            ];

        } catch (\Exception $e) {
            Log::error('Error in getUnassignedJobsWithRoster', ['error' => $e->getMessage()]);
            return [
                'has_jobs' => false,
                'jobs'     => collect(),
                'roster'   => []
            ];
        }
    }

    private function sendFirstCycleNotifications($roster)
    {
        try {
            Log::info('=== First Cycle Started ===');

            // ← Fetch ALL active staff — no global exclusion
            // Each job filters its own notified users individually
            $guards = User::where('user_id', 1)
            ->where('is_active', 1)
            ->where('user_type', 'staff')
            ->whereNotNull('coordinates')
            ->whereNotNull('notification_token')
            // ->whereHas('guardQuestionnaireDetails', function ($query) {
            //     $query->whereNotNull('certificate_path');
            // })
            // ->whereDoesntHave('guardQuestionnaireDetails', function ($query) {
            //     $query->whereNull('certificate_path');
            // })
            ->select('id', 'name', 'coordinates', 'notification_token')
            ->get();

            Log::info('First cycle guards fetched', [
                'total_guards' => $guards->count(),
                'user_type'    => 'staff',
            ]);

            $this->sendNotificationsForMultipleJobs($guards, 'First Cycle', $roster, 'staff');

        } catch (\Exception $e) {
            Log::error('Error in sendFirstCycleNotifications', ['error' => $e->getMessage()]);
        }
    }

    private function sendSecondCycleNotifications($roster)
    {
        try {
            Log::info('=== Second Cycle Started ===');

            // ← Fetch ALL active contractors — no global exclusion
            // Each job filters its own notified users individually
            $guards = User::whereNotIn('id', [1])
                ->where('user_type', 'contractor')
                ->where('is_active', 1)
                ->whereNotNull('coordinates')
                ->whereNotNull('notification_token')
                ->select('id', 'name', 'notification_token', 'coordinates')
                ->get();

            Log::info('Second cycle guards fetched', [
                'total_guards' => $guards->count(),
                'user_type'    => 'contractor',
            ]);

            $this->sendNotificationsForMultipleJobs($guards, 'Second Cycle', $roster, 'contractor');

        } catch (\Exception $e) {
            Log::error('Error in sendSecondCycleNotifications', ['error' => $e->getMessage()]);
        }
    }

    private function sendNotificationsForMultipleJobs($guards, $cycle, $roster, $userType = 'staff')
    {
        $totalSentCount     = 0;
        $totalJobsProcessed = 0;

        if (empty($roster) || !is_array($roster)) {
            Log::warning("{$cycle} - No roster data found");
            return 0;
        }

        Log::info("{$cycle} - Starting multi-job notification process", [
            'total_jobs_in_roster'   => count($roster),
            'total_guards_available' => $guards->count()
        ]);

        foreach ($roster as $jobIndex => $rosterItem) {
            if (!$rosterItem) continue;

            $rosterItemArray = is_object($rosterItem) ? (array) $rosterItem : $rosterItem;
            $jobId           = $rosterItemArray['id'] ?? null;
            $jobStartTime    = $rosterItemArray['start'] ?? null;
            $jobCoordinates  = $rosterItemArray['site']['coordinates'] ?? null;
            $radiusKm        = $rosterItemArray['radius'] ?? 5;
            $jobIds          = [$jobId];

            Log::info("{$cycle} - Processing Job " . ($jobIndex + 1), [
                'job_id'          => $jobId,
                'job_start_time'  => $jobStartTime,
                'job_coordinates' => $jobCoordinates
            ]);

            // ← Only exclude users already notified for THIS specific job
            $alreadyNotifiedUserIds = $this->extractNotifiedUserIdsFromRosterItem($rosterItem);

            Log::info("{$cycle} - Job #" . ($jobIndex + 1) . ": Already notified users for this job", [
                'job_id'               => $jobId,
                'already_notified_ids' => $alreadyNotifiedUserIds,
                'count'                => count($alreadyNotifiedUserIds)
            ]);

            // Filter guards — exclude only THIS job's already notified users
            $filteredGuards = $guards->filter(function ($guard) use ($alreadyNotifiedUserIds) {
                return !in_array($guard->id, $alreadyNotifiedUserIds);
            });

            Log::info("{$cycle} - Job #" . ($jobIndex + 1) . ": Filtered guards", [
                'job_id'          => $jobId,
                'total_guards'    => $guards->count(),
                'filtered_guards' => $filteredGuards->count(),
                'excluded_count'  => count($alreadyNotifiedUserIds)
            ]);

            $jobSentCount = $this->sendNotificationsForSingleJob(
                $filteredGuards,
                $cycle,
                $rosterItem,
                $jobIds,
                $radiusKm,
                $jobIndex + 1,
                $jobCoordinates,
                $userType
            );

            $totalSentCount += $jobSentCount;
            $totalJobsProcessed++;

            Log::info("{$cycle} - Job " . ($jobIndex + 1) . " completed", [
                'job_id'                          => $jobId,
                'notifications_sent_for_this_job' => $jobSentCount,
                'total_notifications_so_far'      => $totalSentCount
            ]);
        }

        Log::info("{$cycle} - All jobs completed", [
            'total_jobs_processed'     => $totalJobsProcessed,
            'total_notifications_sent' => $totalSentCount,
            'total_guards'             => $guards->count()
        ]);

        $this->info("{$cycle}: Sent {$totalSentCount} notifications across {$totalJobsProcessed} jobs.");

        return $totalSentCount;
    }

    private function sendNotificationsForSingleJob($guards, $cycle, $rosterItem, $jobIds, $radiusKm, $jobNumber, $jobCoordinates, $userType = 'staff')
    {
        $sentCount          = 0;
        $skippedCount       = 0;
        $noTokenCount       = 0;
        $newlyNotifiedUsers = [];

        if ($guards->isEmpty()) {
            Log::info("{$cycle} - Job #{$jobNumber}: No guards to process");
            return 0;
        }

        $rosterItemArray = is_object($rosterItem) ? (array) $rosterItem : $rosterItem;
        $jobId           = $rosterItemArray['id'] ?? null;

        Log::info("{$cycle} - Job #{$jobNumber}: Processing guards", [
            'job_id'          => $jobId,
            'total_guards'    => $guards->count(),
            'radius'          => $radiusKm,
            'job_coordinates' => $jobCoordinates
        ]);

        foreach ($guards as $grd) {
            try {
                $guard = User::where('id', $grd->id)
                    ->where('is_active', 1)
                    ->select('id', 'name', 'notification_token', 'coordinates')
                    ->first();

                if (!$guard) {
                    Log::warning("{$cycle} - Job #{$jobNumber}: Guard not found or inactive", ['guard_id' => $grd->id]);
                    $skippedCount++;
                    continue;
                }

                if (empty($guard->notification_token)) {
                    Log::info("{$cycle} - Job #{$jobNumber}: Guard has no notification token", [
                        'guard_id'   => $guard->id,
                        'guard_name' => $guard->name
                    ]);
                    $noTokenCount++;
                    $skippedCount++;
                    continue;
                }

                $distance = 0;
                if (!empty($guard->coordinates) && !empty($jobCoordinates)) {
                    $distance = $this->calculateDistanceFromCoordinates($guard->coordinates, $jobCoordinates);
                }

                Log::info("{$cycle} - Job #{$jobNumber}: Distance calculated", [
                    'guard_id'            => $guard->id,
                    'guard_coordinates'   => $guard->coordinates,
                    'job_coordinates'     => $jobCoordinates,
                    'calculated_distance' => round($distance, 2)
                ]);

                $notificationData = [
                    'notification_token' => $guard->notification_token,
                    'message'            => "ASAP job has been published. Please check your app.",
                    'title'              => 'ASAP Job',
                    'page'               => 'asap-job-list',
                    'data'               => [
                        'distance' => round($distance, 2),
                        'radius'   => $radiusKm,
                        'job_ids'  => $jobIds,
                        'roster'   => $rosterItem
                    ]
                ];

                if (function_exists('send_push_notification')) {
                    send_push_notification($notificationData);
                    $sentCount++;

                    // ---- Collect this guard for notified_users update ----
                    $newlyNotifiedUsers[] = [
                        'user_id'  => $guard->id,
                        'name'     => $guard->name,
                        'distance' => round($distance, 2) . ' km'
                    ];

                    Log::info("{$cycle} - Job #{$jobNumber}: Push notification sent successfully", [
                        'guard_id'                => $guard->id,
                        'guard_name'              => $guard->name,
                        'job_id'                  => $jobId,
                        'distance'                => round($distance, 2),
                        'sent_count_for_this_job' => $sentCount
                    ]);
                } else {
                    Log::error("{$cycle} - Job #{$jobNumber}: send_push_notification function not found");
                }

                usleep(100000);

            } catch (\Exception $e) {
                Log::error("{$cycle} - Job #{$jobNumber}: Failed to send push notification", [
                    'guard_id'      => $grd->id ?? 'unknown',
                    'error_message' => $e->getMessage(),
                    'error_line'    => $e->getLine()
                ]);
            }
        }

        // ---- Update notified_users in DB after all notifications sent ----
        if (!empty($newlyNotifiedUsers) && $jobId) {
            $this->updateNotifiedUsers($jobId, $newlyNotifiedUsers, $radiusKm, $userType, $cycle, $jobNumber);
        }

        Log::info("{$cycle} - Job #{$jobNumber}: Summary", [
            'job_id'             => $jobId,
            'notifications_sent' => $sentCount,
            'no_token'           => $noTokenCount,
            'skipped'            => $skippedCount
        ]);

        return $sentCount;
    }

    private function updateNotifiedUsers($jobId, $newlyNotifiedUsers, $radiusKm, $userType, $cycle, $jobNumber)
    {
        try {
            $job = DB::table('job_rosters')->where('id', $jobId)->first();

            if (!$job) {
                Log::warning("{$cycle} - Job #{$jobNumber}: Job not found for notified_users update", [
                    'job_id' => $jobId
                ]);
                return;
            }

            // Decode existing notified_users
            $existingNotifiedUsers = [];
            if (!empty($job->notified_users)) {
                $decoded = is_string($job->notified_users)
                    ? json_decode($job->notified_users, true)
                    : $job->notified_users;

                if (is_array($decoded)) {
                    $existingNotifiedUsers = $decoded;
                }
            }

            // Extract already existing user_ids and user_details
            $existingUserIds     = [];
            $existingUserDetails = [];

            foreach ($existingNotifiedUsers as $entry) {
                if (isset($entry['user_ids']) && is_array($entry['user_ids'])) {
                    $existingUserIds = array_merge($existingUserIds, $entry['user_ids']);
                }
                if (isset($entry['user_details']) && is_array($entry['user_details'])) {
                    $existingUserDetails = array_merge($existingUserDetails, $entry['user_details']);
                }
            }

            // Merge new users — avoid duplicates
            foreach ($newlyNotifiedUsers as $newUser) {
                if (!in_array($newUser['user_id'], $existingUserIds)) {
                    $existingUserIds[]     = $newUser['user_id'];
                    $existingUserDetails[] = $newUser;
                }
            }

            // Build updated notified_users structure
            $updatedNotifiedUsers = [
                [
                    'user_ids' => array_values(array_unique($existingUserIds)),
                ]
            ];

            // Save back to DB
            DB::table('job_rosters')
                ->where('id', $jobId)
                ->update([
                    'notified_users' => json_encode($updatedNotifiedUsers)
                ]);

            Log::info("{$cycle} - Job #{$jobNumber}: notified_users updated successfully", [
                'job_id'             => $jobId,
                'total_notified_now' => count($existingUserIds),
                'newly_added'        => count($newlyNotifiedUsers),
                'updated_structure'  => $updatedNotifiedUsers
            ]);

        } catch (\Exception $e) {
            Log::error("{$cycle} - Job #{$jobNumber}: Failed to update notified_users", [
                'job_id'        => $jobId,
                'error_message' => $e->getMessage(),
                'error_line'    => $e->getLine()
            ]);
        }
    }

    private function extractNotifiedUserIdsFromRosterItem($rosterItem)
    {
        $alreadyNotifiedUserIds = [];

        if (!$rosterItem) return $alreadyNotifiedUserIds;

        try {
            $item = is_object($rosterItem) ? (array) $rosterItem : $rosterItem;

            if (isset($item['notified_users']) && !empty($item['notified_users'])) {
                $notifyUser = $item['notified_users'];
                if (is_string($notifyUser)) {
                    $notifyUser = json_decode($notifyUser, true);
                }
                if (is_array($notifyUser)) {
                    foreach ($notifyUser as $notification) {
                        if (isset($notification['user_ids']) && is_array($notification['user_ids'])) {
                            $alreadyNotifiedUserIds = array_merge($alreadyNotifiedUserIds, $notification['user_ids']);
                        }
                    }
                }
            }

            $alreadyNotifiedUserIds = array_unique($alreadyNotifiedUserIds);

        } catch (\Exception $e) {
            Log::error('Error extracting notified user IDs', ['error' => $e->getMessage()]);
        }

        return $alreadyNotifiedUserIds;
    }

    private function prepareNotifyUserData($rosterItem)
    {
        if (!$rosterItem) return [];

        try {
            $item = is_object($rosterItem) ? (array) $rosterItem : $rosterItem;

            if (isset($item['notified_users']) && !empty($item['notified_users'])) {
                $notifyUser = $item['notified_users'];
                if (is_string($notifyUser)) {
                    return json_decode($notifyUser, true);
                }
                return $notifyUser;
            }

        } catch (\Exception $e) {
            Log::error('Error preparing notify user data', ['error' => $e->getMessage()]);
        }

        return [];
    }

    private function calculateDistanceFromCoordinates($guardCoordinates, $jobCoordinates)
    {
        try {
            if (empty($guardCoordinates) || empty($jobCoordinates)) return 0;

            $guardParts = explode(',', $guardCoordinates);
            $jobParts   = explode(',', $jobCoordinates);

            if (count($guardParts) < 2 || count($jobParts) < 2) return 0;

            $lat1 = floatval(trim($guardParts[0]));
            $lon1 = floatval(trim($guardParts[1]));
            $lat2 = floatval(trim($jobParts[0]));
            $lon2 = floatval(trim($jobParts[1]));

            return $this->calculateDistance($lat1, $lon1, $lat2, $lon2);

        } catch (\Exception $e) {
            Log::error('Error calculating distance', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $theta = $lon1 - $lon2;
        $dist  = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +
                 cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
        $dist  = acos($dist);
        $dist  = rad2deg($dist);
        $miles = $dist * 60 * 1.1515;
        return round($miles * 1.609344, 2);
    }
}