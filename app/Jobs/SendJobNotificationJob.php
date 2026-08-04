<?php

namespace App\Jobs;

use App\Mail\UnassignedJobsAlert;
use App\Models\JobRoster;
use App\Models\User;
use App\Models\Site;
use App\Events\DynamicUserNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;

class SendJobNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $uniqueFor = 60;

    public function handle()
    {
        $lockKey = 'send_job_notifications_lock';
        $lock = Cache::lock($lockKey, 55);

        if (!$lock->get()) {
            Log::info('Another instance is already processing, skipping.');
            return;
        }

        try {
            $this->processUnassignedJobs();
        } finally {
            $lock->release();
        }
    }

    private function processUnassignedJobs()
    {
        $unassignedJobs = JobRoster::with(['site'])
            ->whereNull('assigned_to')
            ->whereNull('accepted_by')
            ->where('start', '>=', now())
            ->get();

        if ($unassignedJobs->isEmpty()) {
            Log::info('No unassigned jobs found.');
            return;
        }

        // Group by site
        $jobsBySite = $unassignedJobs->groupBy('site_id');

        foreach ($jobsBySite as $siteId => $jobs) {
            $this->processSiteJobs($jobs, $siteId);
        }
    }

    private function processSiteJobs($jobs, $siteId)
    {
        $lastJob = $jobs->sortByDesc('created_at')->first();
        $minutesSincePost = now()->diffInMinutes($lastJob->created_at);

        // CHANGED: fetch state alongside coordinates so we can check
        // state-based permissions for Staffoo (id 1) and resource partners.
        $site = Site::where('id', $siteId)->first(['coordinates', 'state']);
        $siteCoords = $site->coordinates ?? null;
        $siteState = $site->state ?? null;

        // IMPORTANT: Filter to only get jobs that need processing for the CURRENT stage
        $jobsToProcess = $this->getJobsNeedingNotificationForStage($jobs, $minutesSincePost);

        if ($jobsToProcess->isEmpty()) {
            Log::info("Site #{$siteId} - No new jobs need notification at minute {$minutesSincePost}", [
                'all_job_ids' => $jobs->pluck('id')->toArray(),
                'minutes_since_post' => $minutesSincePost
            ]);
            return;
        }

        Log::info("Site #{$siteId} - Processing " . $jobsToProcess->count() . " job(s) that need notification", [
            'site_id' => $siteId,
            'total_jobs_in_site' => $jobs->count(),
            'jobs_to_process' => $jobsToProcess->pluck('id')->toArray(),
            'all_job_ids' => $jobs->pluck('id')->toArray(),
            'minutes_since_post' => $minutesSincePost,
            'log_time' => now()->toDateTimeString(),
            'process_id' => getmypid()
        ]);

        if (!$siteCoords) {
            Log::warning("Site #{$siteId}: No site coordinates – skipped.");
            return;
        }

        $jobIds = $jobsToProcess->pluck('id')->toArray();
        $shiftCount = $jobsToProcess->count();
        $shouldConsolidate = $shiftCount > 1;

        // STAGE 2 — Minute 5
        if ($minutesSincePost >= 5 && $minutesSincePost < 6) {
            $admins = User::where('user_type', 'admin')->where('is_active', 1)->get();

            $message = $shouldConsolidate
                ? "{$shiftCount} security jobs are available on the same site within 25 km."
                : "A new security job is available within 25 km.";

            $title = $shouldConsolidate ? "Multiple Shifts Available" : "New Job Available";
            $type = 'unassign_job';

            foreach ($admins as $admin) {
                broadcast(new DynamicUserNotification(
                    $admin->id,
                    $message,
                    $title,
                    ['message' => $message, 'title' => $title, 'type' => $type, 'job_count' => $shiftCount, 'job_ids' => $jobIds, 'site_id' => $siteId, 'is_consolidated' => $shouldConsolidate],
                    $type
                ));
            }

            // CHANGED: pass $siteState so Staffoo's permission can be checked
            $guardsWithJobs = $this->getEligibleGuardsByRadius($siteCoords, 25, $jobsToProcess, $siteState);
            $this->notifyGuardsWithEligibleJobs($guardsWithJobs, $jobsToProcess, $title, $message, 25, $shouldConsolidate);

            // Resource partners are now filtered by their own states_allowed permission
            $partners = $this->getResourcePartners($siteId);
            $partnerData = [];
            foreach ($partners as $partner) {
                $partnerData[] = [
                    'guard' => $partner,
                    'eligible_job_ids' => $jobIds
                ];
            }
            $partnermessage = $shouldConsolidate
            ? "{$shiftCount} security jobs available nearby at the same site."
            : "New security job available nearby.";

            $this->notifyGuardsWithEligibleJobs($partnerData, $jobsToProcess, $title, $partnermessage, 25, $shouldConsolidate);

            // Mark ONLY the processed jobs as notified
            $this->markJobsAsNotifiedForStage($jobsToProcess, 'stage_2');
            Log::info("Site #{$siteId} Stage 2: Notified for " . $jobsToProcess->count() . " job(s).", [
                'job_ids' => $jobIds
            ]);
            return;
        }

        // STAGE 3 — Minute 10
        if ($minutesSincePost >= 10 && $minutesSincePost < 11) {
            $admins = User::where('user_type', 'admin')->where('is_active', 1)->get();

            $message = $shouldConsolidate
                ? "{$shiftCount} security jobs are available on the same site within 35 km."
                : "A new security job is available within 35 km.";

            $title = $shouldConsolidate ? "Multiple Shifts Available" : "New Job Available";
            $type = 'unassign_job';

            foreach ($admins as $admin) {
                broadcast(new DynamicUserNotification(
                    $admin->id,
                    $message,
                    $title,
                    ['message' => $message, 'title' => $title, 'type' => $type, 'job_count' => $shiftCount, 'job_ids' => $jobIds, 'site_id' => $siteId, 'is_consolidated' => $shouldConsolidate],
                    $type
                ));
            }

            $guardsWithJobs = $this->getEligibleGuardsByRadius($siteCoords, 35, $jobsToProcess, $siteState);
            $this->notifyGuardsWithEligibleJobs($guardsWithJobs, $jobsToProcess, $title, $message, 35, $shouldConsolidate);

            $partners = $this->getResourcePartners($siteId);
            $partnerData = [];
            foreach ($partners as $partner) {
                $partnerData[] = [
                    'guard' => $partner,
                    'eligible_job_ids' => $jobIds
                ];
            }
            $partnermessage = $shouldConsolidate
            ? "{$shiftCount} security jobs available nearby at the same site."
            : "New security job available nearby.";

            $this->notifyGuardsWithEligibleJobs($partnerData, $jobsToProcess, $title, $partnermessage, 35, $shouldConsolidate);

            $this->markJobsAsNotifiedForStage($jobsToProcess, 'stage_3');
            Log::info("Site #{$siteId} Stage 3: Notified for " . $jobsToProcess->count() . " job(s).", [
                'job_ids' => $jobIds
            ]);
            return;
        }

        // STAGE 4 — Minute 15
        if ($minutesSincePost >= 15 && $minutesSincePost < 16) {
            $admins = User::where('user_type', 'admin')->where('is_active', 1)->get();

            $message = $shouldConsolidate
                ? "{$shiftCount} security jobs are available on the same site within 45 km."
                : "A new security job is available within 45 km.";

            $title = $shouldConsolidate ? "Multiple Shifts Available" : "New Job Available";
            $type = 'unassign_job';

            foreach ($admins as $admin) {
                broadcast(new DynamicUserNotification(
                    $admin->id,
                    $message,
                    $title,
                    ['message' => $message, 'title' => $title, 'type' => $type, 'job_count' => $shiftCount, 'job_ids' => $jobIds, 'site_id' => $siteId, 'is_consolidated' => $shouldConsolidate],
                    $type
                ));
            }

            $guardsWithJobs = $this->getEligibleGuardsByRadius($siteCoords, 45, $jobsToProcess, $siteState);
            $this->notifyGuardsWithEligibleJobs($guardsWithJobs, $jobsToProcess, $title, $message, 45, $shouldConsolidate);

            // Resource partners are now filtered by their own states_allowed permission
            $partners = $this->getResourcePartners($siteId);
            $partnerData = [];
            foreach ($partners as $partner) {
                $partnerData[] = [
                    'guard' => $partner,
                    'eligible_job_ids' => $jobIds // Partners get all jobs
                ];
            }
            $this->notifyGuardsWithEligibleJobs($partnerData, $jobsToProcess, $title, $message, 45, $shouldConsolidate);

            $this->markJobsAsNotifiedForStage($jobsToProcess, 'stage_4');
            Log::info("Site #{$siteId} Stage 4: City-wide broadcast sent for " . $jobsToProcess->count() . " job(s).", [
                'job_ids' => $jobIds
            ]);
            return;
        }

        // Auto rebroadcast
        if ($minutesSincePost > 15 && $minutesSincePost <= 75) {
            $minutesSinceStage4 = $minutesSincePost - 15;
            if ($minutesSinceStage4 % 15 === 0) {
                $stageKey = "rebroadcast_{$minutesSincePost}";

                // Check if all jobs that need processing have already been notified for this rebroadcast
                $jobsNotNotified = $this->getJobsNotNotifiedForStage($jobsToProcess, $stageKey);

                if ($jobsNotNotified->isEmpty()) {
                    Log::info("Site #{$siteId}: All jobs already notified for rebroadcast at minute {$minutesSincePost}.");
                    return;
                }

                $this->rebroadcastCityWide($siteId, $jobsNotNotified);
                $this->markJobsAsNotifiedForStage($jobsNotNotified, $stageKey);
                Log::info("Site #{$siteId}: Auto rebroadcast at minute {$minutesSincePost} for " . $jobsNotNotified->count() . " job(s).");
            }
            return;
        }

        // Admin escalation
        if ($minutesSincePost >= 80 && $minutesSincePost <= 82) {
            $window = (int) (($minutesSincePost - 80) / 15);
            $cacheKey = "admin_escalation_site_{$siteId}_w{$window}";

            if (!Cache::has($cacheKey)) {
                Cache::put($cacheKey, true, now()->addMinutes(15));
                $this->triggerAdminEscalation($jobsToProcess);
                Log::info("Site #{$siteId}: Admin escalation triggered for window {$window}.");
            }
        }
    }

    /**
     * Get jobs that need notification for the current stage
     * This filters out jobs that have already been notified for this stage
     */
    private function getJobsNeedingNotificationForStage($allJobs, $minutesSincePost)
    {
        // Determine which stage we're at
        $stage = $this->getStageFromMinutes($minutesSincePost);

        if (!$stage) {
            // If no specific stage, return all jobs that haven't been notified yet
            return $this->getJobsWithoutAnyNotifications($allJobs);
        }

        $jobsNeedingNotification = collect();

        foreach ($allJobs as $job) {
            $cacheKey = "job_notification_{$job->id}_{$stage}";

            // If this job hasn't been notified for this stage, it needs notification
            if (!Cache::has($cacheKey)) {
                $jobsNeedingNotification->push($job);
                Log::info("Job #{$job->id} needs notification for stage: {$stage}");
            } else {
                Log::info("Job #{$job->id} already notified for stage: {$stage}, skipping.");
            }
        }

        return $jobsNeedingNotification;
    }

    /**
     * Get the stage based on minutes since post
     */
    private function getStageFromMinutes($minutesSincePost)
    {
        if ($minutesSincePost >= 5 && $minutesSincePost < 6) {
            return 'stage_2';
        }
        if ($minutesSincePost >= 10 && $minutesSincePost < 11) {
            return 'stage_3';
        }
        if ($minutesSincePost >= 15 && $minutesSincePost < 16) {
            return 'stage_4';
        }
        if ($minutesSincePost > 15 && $minutesSincePost <= 75) {
            $minutesSinceStage4 = $minutesSincePost - 15;
            if ($minutesSinceStage4 % 15 === 0) {
                return "rebroadcast_{$minutesSincePost}";
            }
        }
        return null;
    }

    /**
     * Get jobs that haven't been notified for a specific stage
     */
    private function getJobsNotNotifiedForStage($jobs, $stage)
    {
        $jobsNotNotified = collect();

        foreach ($jobs as $job) {
            $cacheKey = "job_notification_{$job->id}_{$stage}";
            if (!Cache::has($cacheKey)) {
                $jobsNotNotified->push($job);
            }
        }

        return $jobsNotNotified;
    }

    /**
     * Get jobs that have NO notifications at all (brand new)
     */
    private function getJobsWithoutAnyNotifications($jobs)
    {
        $jobsWithoutNotifications = collect();
        $stages = ['stage_2', 'stage_3', 'stage_4'];

        foreach ($jobs as $job) {
            $hasAnyNotification = false;
            foreach ($stages as $stage) {
                $cacheKey = "job_notification_{$job->id}_{$stage}";
                if (Cache::has($cacheKey)) {
                    $hasAnyNotification = true;
                    break;
                }
            }

            if (!$hasAnyNotification) {
                $jobsWithoutNotifications->push($job);
            }
        }

        return $jobsWithoutNotifications;
    }

    /**
     * Mark specific jobs as notified for a stage
     */
    private function markJobsAsNotifiedForStage($jobs, $stage)
    {
        foreach ($jobs as $job) {
            $cacheKey = "job_notification_{$job->id}_{$stage}";
            Cache::put($cacheKey, true, now()->addHours(2));

            // Also update database if field exists
            if (isset($job->notifications_sent)) {
                $notificationsSent = json_decode($job->notifications_sent ?? '[]', true);
                if (!in_array($stage, $notificationsSent)) {
                    $notificationsSent[] = $stage;
                    $job->notifications_sent = json_encode($notificationsSent);
                    $job->save();
                }
            }
        }
        Log::info("Marked " . count($jobs) . " job(s) as notified for stage: {$stage}", [
            'job_ids' => $jobs->pluck('id')->toArray()
        ]);
    }

    // =========================================================================
    // STATE PERMISSION HELPERS  (NEW)
    // =========================================================================

    /**
     * Maps a canonical state key to all the spellings/abbreviations that
     * might show up in the `sites.state` or `users.states_allowed` columns.
     */
    private function getStateAliases(): array
    {
        return [
            // Australia
            'victoria'                      => ['victoria', 'vic'],
            'new south wales'                => ['new south wales', 'nsw'],
            'queensland'                     => ['queensland', 'qld'],
            'south australia'                => ['south australia', 'sa'],
            'western australia'              => ['western australia', 'wa'],
            'tasmania'                       => ['tasmania', 'tas'],
            'australian capital territory'   => ['australian capital territory', 'act'],
            'northern territory'             => ['northern territory', 'nt'],

            // Pakistan
            'punjab'                         => ['punjab'],
        ];
    }

    /**
     * Normalize any state spelling/abbreviation down to one canonical key
     * so "VIC", "vic" and "Victoria" all compare equal.
     */
    private function canonicalizeState(?string $state): ?string
    {
        if (!$state) {
            return null;
        }

        $state = strtolower(trim($state));

        foreach ($this->getStateAliases() as $canonical => $aliases) {
            if (in_array($state, $aliases, true)) {
                return $canonical;
            }
        }

        // Unknown / unmapped state - use the lowercased value as-is so an
        // exact (but unmapped) match still works.
        return $state;
    }

    /**
     * Check whether a user (resource partner OR Staffoo / id 1) is allowed
     * to receive notifications for jobs at a site in the given state, based
     * on that user's `states_allowed` column.
     */
    private function userHasStatePermission(?User $user, ?string $siteState): bool
    {
        if (!$user || !$siteState) {
            return false;
        }

        $allowed = $user->states_allowed;

        // Support both a JSON/array cast column and a raw JSON string column.
        if (is_string($allowed)) {
            $allowed = json_decode($allowed, true) ?? [];
        }

        if (!is_array($allowed) || empty($allowed)) {
            return false;
        }

        $siteCanonical = $this->canonicalizeState($siteState);

        foreach ($allowed as $allowedState) {
            if ($this->canonicalizeState($allowedState) === $siteCanonical) {
                return true;
            }
        }

        return false;
    }

    // =========================================================================
    // GUARD ELIGIBILITY CHECKS
    // =========================================================================

    private function isGuardEligibleForJob($guardId, $job)
    {
        $jobDate = date('Y-m-d', strtotime($job->start));
        $jobDuration = $this->calculateShiftDuration($job->start, $job->end);

        $assignedJobs = JobRoster::where('assigned_to', $guardId)
            ->whereDate('start', $jobDate)
            ->where('job_status', '!=', 'cancelled')
            ->get();

        if ($assignedJobs->count() >= 2) {
            Log::info("Guard #{$guardId} blocked for job #{$job->id} on {$jobDate}: Already has {$assignedJobs->count()} jobs on this day (max 2)");
            return false;
        }

        $totalHoursToday = 0;
        foreach ($assignedJobs as $assignedJob) {
            try {
                $start = \Carbon\Carbon::parse($assignedJob->start);
                $end = \Carbon\Carbon::parse($assignedJob->end);
                $totalHoursToday += $start->diffInHours($end);
            } catch (\Exception $e) {
                Log::warning("Error calculating hours for job #{$assignedJob->id}: " . $e->getMessage());
            }
        }

        if ($totalHoursToday >= 12) {
            Log::info("Guard #{$guardId} blocked for job #{$job->id} on {$jobDate}: Already worked {$totalHoursToday} hours on this day (max 12)");
            return false;
        }

        if (($totalHoursToday + $jobDuration) > 12) {
            Log::info("Guard #{$guardId} blocked for job #{$job->id} on {$jobDate}: Current hours ({$totalHoursToday}) + this job ({$jobDuration}h) would exceed 12 hours");
            return false;
        }

        Log::info("Guard #{$guardId} is eligible for job #{$job->id} on {$jobDate}", [
            'jobs_that_day' => $assignedJobs->count(),
            'hours_that_day' => round($totalHoursToday, 1),
            'job_duration' => $jobDuration
        ]);

        return true;
    }

    /**
     * CHANGED: now accepts $siteState and refuses to return any Staffoo
     * guards unless contractor #1 (Staffoo) has permission for that state.
     */
    private function getEligibleGuardsByRadius(string $siteCoords, int $radiusKm, $jobs = null, ?string $siteState = null)
    {
        // Staffoo (contractor id 1) must have states_allowed permission
        // for this site's state before its own staff are notified at all.
        $staffoo = User::find(1);
        if (!$this->userHasStatePermission($staffoo, $siteState)) {
            Log::info("Staffoo (contractor #1) has no permission for state '{$siteState}', skipping Staffoo staff notifications.");
            return [];
        }

        $allGuards = User::where('user_id', 1)
            ->where('is_active', 1)
            ->where('user_type', 'staff')
            ->whereNotNull('current_coordinates')
            ->whereNotNull('notification_token')
            ->select('id', 'name', 'email', 'phone', 'coordinates', 'current_coordinates', 'notification_token')
            ->get()
            ->filter(fn($g) => $this->isWithinRadius($siteCoords, $g->current_coordinates, $radiusKm));

        if (!$jobs || $jobs->isEmpty()) {
            return [];
        }

        $guardsWithEligibleJobs = [];
        foreach ($allGuards as $guard) {
            $eligibleJobIds = [];
            foreach ($jobs as $job) {
                if ($this->isGuardEligibleForJob($guard->id, $job)) {
                    $eligibleJobIds[] = $job->id;
                }
            }
            if (!empty($eligibleJobIds)) {
                $guardsWithEligibleJobs[] = [
                    'guard' => $guard,
                    'eligible_job_ids' => $eligibleJobIds
                ];
            }
        }

        Log::info("Found " . count($guardsWithEligibleJobs) . " eligible guards within {$radiusKm}km radius.");
        return $guardsWithEligibleJobs;
    }

    /**
     * CHANGED: gated behind Staffoo (contractor id 1) having permission
     * for the site's state.
     */
    private function getAllEligibleStaffooGuards($siteId, $jobs = null)
    {
        $siteState = Site::where('id', $siteId)->value('state');

        $staffoo = User::find(1);
        if (!$this->userHasStatePermission($staffoo, $siteState)) {
            Log::info("Staffoo (contractor #1) has no permission for state '{$siteState}', skipping city-wide Staffoo staff notifications.");
            return [];
        }

        $allGuards = User::where('user_id', 1)
            ->where('is_active', 1)
            ->where('state', $siteState)
            ->where('user_type', 'staff')
            ->whereNotNull('notification_token')
            ->select('id', 'name', 'email', 'phone', 'notification_token')
            ->get();

        if (!$jobs || $jobs->isEmpty()) {
            return [];
        }

        $guardsWithEligibleJobs = [];
        foreach ($allGuards as $guard) {
            $eligibleJobIds = [];
            foreach ($jobs as $job) {
                if ($this->isGuardEligibleForJob($guard->id, $job)) {
                    $eligibleJobIds[] = $job->id;
                }
            }
            if (!empty($eligibleJobIds)) {
                $guardsWithEligibleJobs[] = [
                    'guard' => $guard,
                    'eligible_job_ids' => $eligibleJobIds
                ];
            }
        }

        Log::info("Found " . count($guardsWithEligibleJobs) . " eligible city-wide guards.");
        return $guardsWithEligibleJobs;
    }

    // =========================================================================
    // NOTIFICATION SENDERS
    // =========================================================================

    private function notifyGuardsWithEligibleJobs($guardsWithJobs, $allJobs, $title, $message, $radius, $isConsolidated = false)
    {
        if (empty($guardsWithJobs)) {
            Log::info("No eligible guards to notify.");
            return;
        }

        $notificationCount = 0;
        foreach ($guardsWithJobs as $guardData) {
            if (!isset($guardData['guard']) || !isset($guardData['eligible_job_ids'])) {
                Log::warning("Invalid guard data structure", ['guard_data' => $guardData]);
                continue;
            }

            $guard = $guardData['guard'];
            $eligibleJobIds = $guardData['eligible_job_ids'];

            if (!is_array($eligibleJobIds)) {
                Log::warning("eligible_job_ids is not an array for guard #{$guard->id}", [
                    'eligible_job_ids' => $eligibleJobIds
                ]);
                continue;
            }

            $eligibleJobs = $allJobs->filter(function($job) use ($eligibleJobIds) {
                return in_array($job->id, $eligibleJobIds);
            });

            if ($eligibleJobs->isEmpty()) {
                Log::info("No eligible jobs found for guard #{$guard->id}", [
                    'eligible_job_ids' => $eligibleJobIds,
                    'all_job_ids' => $allJobs->pluck('id')->toArray()
                ]);
                continue;
            }

            $this->sendAppNotification($guard, $eligibleJobs, $title, $message, $radius, $isConsolidated);

            // if (!empty($guard->phone)) {
            //     try {
            //         // $sms = send_sms($guard->phone, $message);

            //         Log::info("SMS sent successfully.", [
            //             'guard_id' => $guard->id,
            //             'phone'    => $guard->phone,
            //             'response' => $sms,
            //         ]);
            //     } catch (\Throwable $e) {
            //         Log::error("Failed to send SMS.", [
            //             'guard_id' => $guard->id,
            //             'phone'    => $guard->phone,
            //             'error'    => $e->getMessage(),
            //         ]);

            //     }
            // }

            $this->sendEmail($guard, $title, $message, $eligibleJobs, $isConsolidated);

            $notificationCount++;
            Log::info("Notified guard #{$guard->id} for " . $eligibleJobs->count() . " eligible job(s)", [
                'eligible_job_ids' => $eligibleJobIds,
                'job_count' => $eligibleJobs->count()
            ]);
        }

        Log::info("Total guards notified: {$notificationCount}");
    }

    private function rebroadcastCityWide($siteId, $jobs): void
    {
        $jobIds = $jobs->pluck('id')->toArray();

        $guardsWithJobs = $this->getAllEligibleStaffooGuards($siteId, $jobs);
        $partners = $this->getResourcePartners($siteId);

        $partnerData = [];
        foreach ($partners as $partner) {
            $partnerData[] = [
                'guard' => $partner,
                'eligible_job_ids' => $jobIds
            ];
        }

        $allGuardsWithJobs = array_merge($guardsWithJobs, $partnerData);

        $shiftCount = $jobs->count();
        $message = $shiftCount > 1
            ? "{$shiftCount} security jobs on the same site are still open and need staff urgently."
            : "A security job in your city is still open and needs a guard urgently.";

        $this->notifyGuardsWithEligibleJobs(
            $allGuardsWithJobs,
            $jobs,
            'Urgent: Job Still Unfilled',
            $message,
            45,
            $shiftCount > 1
        );

        Log::info("Site #{$siteId}: Rebroadcast completed. Total recipients: " . count($allGuardsWithJobs));
    }

    // =========================================================================
    // USER QUERIES
    // =========================================================================

    /**
     * CHANGED: resource partners are now filtered by their own
     * `states_allowed` permission list instead of a hard site-state match.
     */
    private function getResourcePartners($siteId)
    {
        $siteState = Site::where('id', $siteId)->value('state');

        $partners = User::whereNotIn('id', [1])
            ->where('user_type', 'contractor')
            ->where('is_active', 1)
            ->whereNotNull('notification_token')
            ->select('id', 'name', 'email', 'phone', 'notification_token', 'states_allowed')
            ->get()
            ->filter(fn($partner) => $this->userHasStatePermission($partner, $siteState))
            ->values();

        Log::info("Found {$partners->count()} resource partners with state permission.", [
            'site_state' => $siteState,
        ]);

        return $partners;
    }

    private function triggerAdminEscalation($jobs): void
    {
        $adminEmail = 'admin@staffoo.com.au';
        $admin = User::find(1);

        $jobCollection = $jobs instanceof \Illuminate\Support\Collection ? $jobs : collect([$jobs]);

        Mail::to($adminEmail)->queue(new UnassignedJobsAlert($jobCollection));

        Log::warning("Admin escalation triggered for " . $jobCollection->count() . " job(s).");
    }

    // =========================================================================
    // CHANNEL HELPERS
    // =========================================================================

    private function sendAppNotification(User $user, $jobs, string $title, string $message, $radius, $isConsolidated = false)
    {
        if (empty($user->notification_token)) {
            Log::info("Guard #{$user->id} has no notification token, skipping.");
            return;
        }

        if (!function_exists('send_push_notification')) {
            Log::error('send_push_notification helper not found.');
            return;
        }

        if ($jobs instanceof \Illuminate\Support\Collection) {
            $jobIds = $jobs->pluck('id')->toArray();
            $firstJob = $jobs->sortByDesc('created_at')->first();
            // $firstJob = $jobs->first();
        } else {
            $jobIds = [$jobs->id];
            $firstJob = $jobs;
        }

        $notificationData = [
            'distance' => round($radius, 2),
            'radius' => $radius,
            'job_ids' => $jobIds,
            'roster' => $firstJob,
            'is_consolidated' => $isConsolidated,
            'job_count' => count($jobIds),
        ];

        try {
            send_push_notification([
                'notification_token' => $user->notification_token,
                'title' => $title,
                'message' => $message,
                'page' => 'asap-job-list',
                'data' => $notificationData
            ]);
            Log::info("Push notification sent to guard #{$user->id}", [
                'job_count' => count($jobIds),
                'job_ids' => $jobIds
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send push notification to guard #{$user->id}: " . $e->getMessage());
        }
    }

    private function sendEmail(User $user, $title, $message, $jobs, $isConsolidated = false)
    {
        if (empty($user->email)) {
            return;
        }

        $job = $jobs instanceof \Illuminate\Support\Collection ? $jobs->sortByDesc('created_at')->first() : $jobs;

        try {
            Mail::to($user->email)->queue(new \App\Mail\JobNotificationMail($job, $title, $message));
            Log::info("Email queued for guard #{$user->id}");
        } catch (\Exception $e) {
            Log::error("Failed to queue email for guard #{$user->id}: " . $e->getMessage());
        }
    }

    private function calculateShiftDuration($start, $end)
    {
        try {
            $startTime = \Carbon\Carbon::parse($start);
            $endTime = \Carbon\Carbon::parse($end);
            return round($startTime->diffInHours($endTime), 1);
        } catch (\Exception $e) {
            return 0;
        }
    }

    // =========================================================================
    // DISTANCE HELPERS
    // =========================================================================

    private function isWithinRadius(string $siteCoords, string $guardCoords, int $radiusKm): bool
    {
        $distance = $this->getDistance($siteCoords, $guardCoords);
        $isWithin = $distance <= $radiusKm;

        if (!$isWithin) {
            Log::info("Guard coordinates outside radius: distance={$distance}km, radius={$radiusKm}km");
        }

        return $isWithin;
    }

    private function getDistance(string $coords1, string $coords2): float
    {
        [$lat1, $lng1] = $this->parseCoords($coords1);
        [$lat2, $lng2] = $this->parseCoords($coords2);

        if ($lat1 === null || $lat2 === null) {
            return PHP_INT_MAX;
        }

        return $this->haversine($lat1, $lng1, $lat2, $lng2);
    }

    private function parseCoords(string $coords): array
    {
        $parts = preg_split('/[\s,]+/', trim($coords));

        return [
            isset($parts[0]) ? (float) $parts[0] : null,
            isset($parts[1]) ? (float) $parts[1] : null,
        ];
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}