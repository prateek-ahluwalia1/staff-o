<?php

namespace App\Jobs;

use App\Mail\UnassignedJobsAlert;
use App\Mail\JobAcceptedGuardMail;
use App\Mail\JobAcceptedClientMail;
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

class SendJobNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * =========================================================================
     * ESCALATION STAGES (runs every minute via scheduler)
     * =========================================================================
     *
     * Stage 1 →  0 min : Notify guards within 15 km (App + SMS + Email)
     * Stage 2 →  5 min : ADD guards within 25 km   (15 km still active)
     * Stage 3 → 10 min : ADD guards within 35 km   (15+25 km still active)
     * Stage 4 → 15 min : ADD guards within 45 km + Resource Partners + City-Wide
     * Rebroadcast → 20, 35, 50, 65 min : City-Wide every 15 min
     * Escalation  → 80 min : Admin escalation (email + SMS + portal + highlight)
     *
     * KEY RULES:
     * - Earlier radius stages remain active while new ones are added
     * - Each stage waits 5 minutes before expanding
     * - If job is accepted at ANY point → assign, lock, confirm guard + client
     * =========================================================================
     */
    public function handle()
    {

        $jobs = JobRoster::with(['site'])
                    ->whereNull('assigned_to')
                    ->where('start', '>=', now())
                    ->get();

        if ($jobs->isEmpty()) {
            return;
        }

        foreach ($jobs as $job) {
            $this->processJob($job);
        }
    }

    // =========================================================================
    // CORE ESCALATION LOGIC
    // =========================================================================

    private function processJob(JobRoster $job)
    {
        $minutesSincePost = (int) now()->diffInMinutes($job->created_at);
        $siteCoords = Site::where('id', $job->site_id)->value('coordinates');

        Log::info("Job #{$job->id} - Site coordinates retrieved", [
        'job_id' => $job->id,
        'site_id' => $job->site_id,
        'site_coordinates' => $siteCoords,
        'minutes_since_post' => $minutesSincePost,
        'job_title' => $job->title ?? null,
        'job_status' => $job->status ?? null,
        'job_created_at' => $job->created_at ?? null,
        'log_time' => now()->toDateTimeString()

    ]);

    if (!$siteCoords) {
        Log::warning("Job #{$job->id}: No site coordinates – skipped.", [
            'job_id' => $job->id,
            'site_id' => $job->site_id,
            'minutes_since_post' => $minutesSincePost
        ]);
        return;
    }

        // -----------------------------------------------------------------
        // STAGE 2 — Minute 5: ADD 25 km guards (15 km already notified)
        // -----------------------------------------------------------------
        if ($minutesSincePost === 5) {
              $admins = User::where('user_type', 'admin')
                         ->where('is_active', 1)
                         ->get();


            $message = "A new security job is available within 25 km.";
            $title = "Unassign Job Alert";
            $type = 'unassign_job';
            $data = [
                'message' => $message,
                'title' => $title,
                'type' => $type,
            ];

            foreach ($admins as $admin) {
                broadcast(new DynamicUserNotification(
                    $admin->id, 
                    $message, 
                    $title, 
                    $data, 
                    $type
                ));
                
            }
            // Only notify guards in the 15–25 km ring (15 km already got notified)
            $guards = $this->getStaffooGuardsByRadius($siteCoords, 25);
            $this->notifyUsers($guards, $job, "New Job Available", "A new security job is available within 25 km of you.", 25);
            Log::info("Job #{$job->id} Stage 2: Notified {$guards->count()} guard(s) in 15–25 km ring.");
            return;
        }

        // -----------------------------------------------------------------
        // STAGE 3 — Minute 10: ADD 35 km guards (15+25 km already notified)
        // -----------------------------------------------------------------
        if ($minutesSincePost === 10) {

              $admins = User::where('user_type', 'admin')
                         ->where('is_active', 1)
                         ->get();


            $message = "A new security job is available within 35 km.";
            $title = "Unassign Job Alert";
            $type = 'unassign_job';
            $data = [
                'message' => $message,
                'title' => $title,
                'type' => $type,
            ];

            foreach ($admins as $admin) {
                broadcast(new DynamicUserNotification(
                    $admin->id, 
                    $message, 
                    $title, 
                    $data, 
                    $type
                ));
                
            }
            $guards = $this->getStaffooGuardsByRadius($siteCoords, 35);
            $this->notifyUsers($guards, $job, "New Job Available", "A new security job is available within 35 km of you.", 35);
            Log::info("Job #{$job->id} Stage 3: Notified {$guards->count()} guard(s) in 25–35 km ring.");
            return;
        }

        // -----------------------------------------------------------------
        // STAGE 4 — Minute 15: ADD 45 km + Resource Partners + City-Wide
        // -----------------------------------------------------------------
        if ($minutesSincePost === 15) {

              $admins = User::where('user_type', 'admin')
                         ->where('is_active', 1)
                         ->get();


            $message = "A new security job is available within 45 km.";
            $title = "Unassign Job Alert";
            $type = 'unassign_job';
            $data = [
                'message' => $message,
                'title' => $title,
                'type' => $type,
            ];

            foreach ($admins as $admin) {
                broadcast(new DynamicUserNotification(
                    $admin->id, 
                    $message, 
                    $title, 
                    $data, 
                    $type
                ));
                
            }
            // 35–45 km ring guards
            $guards = $this->getStaffooGuardsByRadius($siteCoords, 45);
            $this->notifyUsers($guards, $job, "Urgent Job Available", "An urgent security job is available within 45 km of you.", 45);

            // Resource partners (city-wide, no radius)
            $partners = $this->getResourcePartners();
            $this->notifyUsers($partners, $job, "Urgent Job Available", "An urgent security job in your city needs filling.", 45);

            // All remaining staffoo guards city-wide not yet notified (beyond 45 km)
            $cityGuards = $this->getStaffooGuardsBeyondRadius($siteCoords, 45);
            $this->notifyUsers($cityGuards, $job, "Urgent Job Available", "An urgent security job in your city needs filling.", 45);

            Log::info("Job #{$job->id} Stage 4: City-wide broadcast sent.");
            return;
        }

        // -----------------------------------------------------------------
        // AUTO REBROADCAST — Every 15 min after stage 4 (min 30, 45, 60, 75)
        // City-Wide: Staffoo Guards + Resource Partners
        // -----------------------------------------------------------------
        if ($minutesSincePost > 15 && $minutesSincePost <= 75) {
            $minutesSinceStage4 = $minutesSincePost - 15;

            if ($minutesSinceStage4 % 15 === 0) {
                $this->rebroadcastCityWide($job);
                Log::info("Job #{$job->id}: Auto rebroadcast at minute {$minutesSincePost}.");
            }
            return;
        }

        // -----------------------------------------------------------------
        // ADMIN ESCALATION — 60 min elapsed after rebroadcast started (min 80)
        // -----------------------------------------------------------------
        if ($minutesSincePost >= 80 && $minutesSincePost <= 82) {
            $window   = (int) (($minutesSincePost - 80) / 15);
            $cacheKey = "admin_escalation_job_{$job->id}_w{$window}";

            if (!cache()->has($cacheKey)) {
                cache()->put($cacheKey, true, now()->addMinutes(15));
                $this->triggerAdminEscalation($job);
            }
        }
    }

    // =========================================================================
    // USER QUERIES
    // =========================================================================

    /**
     * Staffoo guards within a specific radius.
     */
    private function getStaffooGuardsByRadius(string $siteCoords, int $radiusKm)
    {
        return User::where('user_id', 1)
            ->where('is_active', 1)
            ->where('user_type', 'staff')
            ->whereNotNull('current_coordinates')
            ->whereNotNull('notification_token')
            ->select('id', 'name', 'email', 'phone', 'coordinates', 'current_coordinates', 'notification_token')
            ->get()
            ->filter(fn($g) => $this->isWithinRadius($siteCoords, $g->current_coordinates, $radiusKm));
    }

    /**
     * Staffoo guards beyond a radius (for city-wide remainder).
     */
    private function getStaffooGuardsBeyondRadius(string $siteCoords, int $radiusKm)
    {
        return User::where('user_id', 1)
            ->where('is_active', 1)
            ->where('user_type', 'staff')
            ->whereNotNull('current_coordinates')
            ->whereNotNull('notification_token')
            ->select('id', 'name', 'email', 'phone', 'coordinates', 'current_coordinates', 'notification_token')
            ->get()
            ->filter(fn($g) => $this->getDistance($siteCoords, $g->current_coordinates) > $radiusKm);
    }

    /**
     * All Staffoo guards city-wide.
     */
    private function getAllStaffooGuards()
    {
        return User::where('user_id', 1)
            ->where('is_active', 1)
            ->where('user_type', 'staff')
            ->whereNotNull('notification_token')
            ->select('id', 'name', 'email', 'phone', 'notification_token')
            ->get();
    }

    /**
     * Resource partners (city-wide, no radius).
     */
    private function getResourcePartners()
    {
        return User::whereNotIn('id', [1])
            ->where('user_type', 'contractor')
            ->where('is_active', 1)
            ->whereNotNull('notification_token')
            ->select('id', 'name', 'email', 'phone', 'notification_token')
            ->get();
    }

    // =========================================================================
    // NOTIFICATION SENDERS
    // =========================================================================

    /**
     * Notify a collection of users via App + SMS + Email.
     */
    private function notifyUsers($users, JobRoster $job, $title, $message, $radius)
    {
        if ($users->isEmpty()) {
            return;
        }

        foreach ($users as $user) {
            // 1. App push notification
            $this->sendAppNotification($user, $job, $title, $message, $radius);

            // 2. SMS
            // $this->sendSms($user, $message, $job);

            // 3. Email
            $this->sendEmail($user, $title, $message, $job);
        }
    }

    /**
     * Rebroadcast city-wide: All Staffoo guards + Resource Partners.
     */
    private function rebroadcastCityWide(JobRoster $job): void
    {
        $guards   = $this->getAllStaffooGuards();
        $partners = $this->getResourcePartners();

        $allUsers = $guards->merge($partners)->unique('id');

        $this->notifyUsers(
            $allUsers,
            $job,
            'Urgent: Job Still Unfilled',
            "A security job in your city is still open and needs a guard urgently. Job #{$job->id}",
            45
        );

        Log::info("Job #{$job->id}: Rebroadcast to {$allUsers->count()} city-wide recipient(s).");
    }

    // =========================================================================
    // ADMIN ESCALATION
    // =========================================================================

    private function triggerAdminEscalation(JobRoster $job): void
    {
        $adminEmail = 'shahbazkhan062@gmail.com';
        // $adminPhone = config('app.admin_phone', '');
        $admin      = User::find(1);

        // 1. Email alert
        Mail::to($adminEmail)->queue(new UnassignedJobsAlert(collect([$job])));

        Log::warning("Job #{$job->id}: Admin escalation triggered — email, portal, highlighted.");
    }

    // =========================================================================
    // CHANNEL HELPERS
    // =========================================================================

    /**
     * App push notification via your existing helper.
     */
    private function sendAppNotification(User $user, $job, string $title, string $message, $radius)
    {
        if (empty($user->notification_token)) {
            return;
        }

        if (!function_exists('send_push_notification')) {
            Log::error('send_push_notification helper not found.');
            return;
        }

        send_push_notification([
            'notification_token' => $user->notification_token,
            'title'              => $title,
            'message'            => $message,
            'page'               => 'asap-job-list',
            'data'               => [
                'distance' => round($radius, 2),
                'radius' => $radius,
                'job_ids' => $job->id,
                'roster' => $job
            ]
        ]);
    }

    /**
     * Send email notification to a user.
     */
    private function sendEmail(User $user, $title, $message, JobRoster $job)
    {
        if (empty($user->email)) {
            return;
        }

        Mail::to($user->email)->queue(new \App\Mail\JobNotificationMail($job, $title, $message));
        Log::warning("Job #{$job->id}: user email, portal, highlighted.");

    }

    // =========================================================================
    // DISTANCE HELPERS
    // =========================================================================

    private function isWithinRadius(string $siteCoords, string $guardCoords, int $radiusKm): bool
    {
        return $this->getDistance($siteCoords, $guardCoords) <= $radiusKm;
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

    /**
     * Supports "lat,lng" format: 31.471850950351154,74.37757132966358
     */
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
        $R    = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}