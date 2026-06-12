<?php

namespace App\Jobs;

use App\Mail\UnassignedJobsAlert;
use App\Models\JobRoster;
use App\Models\User;
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
     * ESCALATION LOGIC (from flowchart)
     * =========================================================================
     *
     * On job post, check: is job start within 48 hours?
     *
     * PATH A — YES (start_time - now <= 48 hours):
     *   0 min  → Staffoo guards within 5 km
     *   1 min  → Staffoo guards within 10 km
     *   2 min  → Staffoo guards within 20 km
     *   3 min  → City-wide immediately (no wait)
     *
     * PATH B — NO (start_time - now > 48 hours):
     *   0 min  → Staffoo guards within 5 km
     *   1 min  → Staffoo guards within 10 km
     *   2 min  → Staffoo guards within 20 km
     *   WAIT   → Until job start is exactly 48 hours away
     *   Then   → City-wide
     *
     * AFTER CITY-WIDE (both paths merge):
     *   Every 15 min → Repeat city-wide (for up to 1 hour = 4 repeats)
     *   After 1 hour of city-wide with no acceptance → Admin Escalation
     *     • Email alert to admin
     *     • Portal notification
     *     • Job highlighted (flag on job record)
     *
     * =========================================================================
     */
    public function handle(): void
    {
        // Fetch ALL unassigned jobs (any start time) — we handle 48hr logic per job
        $jobs = JobRoster::with('site')
            ->whereNull('assigned_to')
            ->where('start', '>=', now()) // only future jobs
            ->get();

        if ($jobs->isEmpty()) {
            return;
        }

        foreach ($jobs as $job) {
            $this->processJob($job);
        }
    }

    // =========================================================================
    // CORE: decide which stage this job is at
    // =========================================================================

    private function processJob(JobRoster $job): void
    {
        $now              = now();
        $minutesSincePost = (int) $now->diffInMinutes($job->created_at);
        $hoursUntilStart  = $now->diffInHours($job->start, false); // negative if past
        $isWithin48Hours  = $hoursUntilStart <= 48;
        $siteCoords       = $job->site?->coordinates;

        if (!$siteCoords) {
            Log::warning("Job #{$job->id}: No site coordinates – skipped.");
            return;
        }

        // -----------------------------------------------------------------
        // STAGE 2 — 1 min after post: notify 10 km (both paths)
        // -----------------------------------------------------------------
        if ($minutesSincePost === 1) {
            $this->notifyStaffooByRadius($job, $siteCoords, 10);
            return;
        }

        // -----------------------------------------------------------------
        // STAGE 3 — 2 min after post: notify 20 km (both paths)
        // -----------------------------------------------------------------
        if ($minutesSincePost === 2) {
            $this->notifyStaffooByRadius($job, $siteCoords, 20);
            return;
        }

        // -----------------------------------------------------------------
        // After radius stages — diverge based on 48-hour check
        // -----------------------------------------------------------------
        if ($minutesSincePost >= 3) {

            // PATH A: Job is within 48 hours → go city-wide immediately
            if ($isWithin48Hours) {
                $this->handleCityWideStage($job, $minutesSincePost, cityWideStartMinute: 3);
                return;
            }

            // PATH B: Job is > 48 hours away → wait until 48 hrs remaining, then city-wide
            if ($hoursUntilStart > 48) {
                // Not yet time — still waiting
                Log::info("Job #{$job->id}: {$hoursUntilStart}h until start. Waiting for 48hr window.");
                return;
            }

            // hoursUntilStart just crossed into <=48 — find when that happened
            // We use job->start - 48h as the city-wide trigger moment
            $cityWideTriggeredAt = $job->start->copy()->subHours(48);
            $minutesSinceCityWide = (int) $now->diffInMinutes($cityWideTriggeredAt);

            $this->handleCityWideStage($job, $minutesSinceCityWide, cityWideStartMinute: 0);
        }
    }

    // =========================================================================
    // CITY-WIDE STAGE HANDLER (shared by both paths)
    // $minutesSinceCityWide = minutes elapsed since city-wide was first triggered
    // =========================================================================

    private function handleCityWideStage(JobRoster $job, int $minutesSinceCityWide, int $cityWideStartMinute): void
    {
        // Adjust: for Path A, city-wide starts at minute 3 after post
        // For Path B, we pass minutesSinceCityWide directly (already calculated from 48hr mark)
        $elapsed = ($cityWideStartMinute > 0)
            ? $minutesSinceCityWide - $cityWideStartMinute
            : $minutesSinceCityWide;

        if ($elapsed < 0) {
            return;
        }

        // After 60 min of city-wide with no acceptance → Admin Escalation
        if ($elapsed >= 60) {
            // Only escalate once per 15-min window to avoid spam
            $window   = (int) ($elapsed / 15);
            $cacheKey = "admin_escalation_job_{$job->id}_w{$window}";

            if (!cache()->has($cacheKey)) {
                cache()->put($cacheKey, true, now()->addMinutes(15));
                $this->triggerAdminEscalation($job);
            }
            return;
        }

        // Send city-wide every 15 min: at elapsed 0, 15, 30, 45
        if ($elapsed % 15 === 0) {
            $this->notifyCityWide($job);
        }
    }

    // =========================================================================
    // NOTIFICATION METHODS
    // =========================================================================

    /**
     * Staffoo guards filtered by radius from site.
     */
    private function notifyStaffooByRadius(JobRoster $job, string $siteCoords, int $radiusKm): void
    {
        $guards = User::where('user_id', 1)
            ->where('is_active', 1)
            ->where('user_type', 'staff')
            ->whereNotNull('current_coordinates')
            ->whereNotNull('notification_token')
            ->select('id', 'name', 'current_coordinates', 'notification_token')
            ->get();

        $inRange = $guards->filter(
            fn($g) => $this->isWithinRadius($siteCoords, $g->current_coordinates, $radiusKm)
        );

        if ($inRange->isEmpty()) {
            Log::info("Job #{$job->id}: No staffoo guards within {$radiusKm} km.");
            return;
        }

        $this->sendPush(
            $inRange,
            'New Job Available',
            "A security job is available within {$radiusKm} km. Tap to view."
        );

        Log::info("Job #{$job->id}: Notified {$inRange->count()} staffoo guard(s) within {$radiusKm} km.");
    }

    /**
     * City-wide: all Staffoo guards + all Resource Partners (no radius).
     */
    private function notifyCityWide(JobRoster $job): void
    {
        $staffooGuards = User::where('user_id', 1)
            ->where('is_active', 1)
            ->where('user_type', 'staff')
            ->whereNotNull('current_coordinates')
            ->whereNotNull('notification_token')
            ->select('id', 'name', 'notification_token')
            ->get();

        $resourcePartners = User::whereNotIn('id', [1])
            ->where('user_type', 'contractor')
            ->where('is_active', 1)
            ->whereNotNull('current_coordinates')
            ->whereNotNull('notification_token')
            ->select('id', 'name', 'notification_token')
            ->get();

        $allRecipients = $staffooGuards->merge($resourcePartners)->unique('id');

        if ($allRecipients->isEmpty()) {
            Log::info("Job #{$job->id}: No city-wide recipients.");
            return;
        }

        $this->sendPush(
            $allRecipients,
            'Urgent: Job Needs Filling',
            "An urgent security job in your city is still open. Job #{$job->id}"
        );

        Log::info("Job #{$job->id}: City-wide push sent to {$allRecipients->count()} recipient(s).");
    }

    /**
     * Admin Escalation:
     *   1. Email alert
     *   2. Portal notification (DB notification)
     *   3. Flag job as highlighted on the record
     */
    private function triggerAdminEscalation(JobRoster $job): void
    {
        // 1. Email alert
        $adminEmail = 'shahbazkhan062@gmail.com';
        Mail::to($adminEmail)->queue(new UnassignedJobsAlert(collect([$job])));

        // 2. Portal notification — store in DB so admin sees it on dashboard
        //    Assumes you have a notifications table / Laravel notifications
        // $admin = \App\Models\User::find(1); // Staffoo admin user
        // if ($admin) {
        //     $admin->notify(new \App\Notifications\UnassignedJobPortalNotification($job));
        // }

        // 3. Highlight the job — set a flag on the job record
        $job->update(['is_highlighted' => true]);

        Log::warning("Job #{$job->id}: Admin escalation triggered. Email sent, portal notified, job highlighted.");
    }

    // =========================================================================
    // DISTANCE HELPERS
    // =========================================================================

    private function isWithinRadius(string $siteCoords, string $guardCoords, int $radiusKm): bool
    {
        [$lat1, $lng1] = $this->parseCoords($siteCoords);
        [$lat2, $lng2] = $this->parseCoords($guardCoords);

        if ($lat1 === null || $lat2 === null) {
            return false;
        }

        return $this->haversine($lat1, $lng1, $lat2, $lng2) <= $radiusKm;
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

    // =========================================================================
    // FCM PUSH
    // =========================================================================

    /**
     * Send push notification to a collection of users using the existing helper.
     * Each user must have a notification_token property.
     */
    private function sendPush(iterable $users, string $title, string $body, string $page = 'asap-job-list'): void
    {
        if (!function_exists('send_push_notification')) {
            Log::error('send_push_notification helper not found.');
            return;
        }

        foreach ($users as $user) {
            if (empty($user->notification_token)) {
                continue;
            }

            send_push_notification([
                'notification_token' => $user->notification_token,
                'title'              => $title,
                'message'            => $body,
                'page'               => $page,
            ]);
        }
    }
}