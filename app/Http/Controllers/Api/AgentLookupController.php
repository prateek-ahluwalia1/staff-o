<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobRoster;
use App\Models\User;
use App\Services\ProfileCompletionService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Live account lookups for the Retell voice and chat agents.
 *
 * Every method returns {"result": "<what the agent says>", "data": {...}}.
 * Retell reads `result` straight out, so these sentences are written to be
 * spoken. `data` is there for logging and for the agent to reason over.
 *
 * Read-only except resendVerification. Nothing here changes is_active —
 * recalculating a status mid-call would fire activation emails at people who
 * only rang to ask a question.
 */
class AgentLookupController extends Controller
{
    public function __construct(private ProfileCompletionService $profiles)
    {
    }

    // =====================================================================
    // 1. account_status — "why isn't my account active?"
    // =====================================================================

    public function accountStatus(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return $this->notFound($request);
        }

        $evaluation = $this->profiles->evaluate($user);
        $blockers   = $this->profiles->blockers($user, $evaluation);

        $type = [
            'staffoo_staff'    => 'STAFFOO guard',
            'contractor_staff' => 'contractor staff member',
            'contractor'       => 'contractor',
            'client'           => 'client',
        ][$evaluation['account_type']] ?? 'user';

        if ($evaluation['is_active']) {
            $result = "Good news — {$user->name}'s account is active. "
                    . "It's a {$type} account and there's nothing outstanding on it.";
        } elseif ($blockers === []) {
            // Active-worthy but the flag has not caught up: the cron sets it.
            $result = "Everything on {$user->name}'s account is complete — all the requirements are met. "
                    . "The status just hasn't flipped over yet. It updates automatically, usually within a couple of hours. "
                    . "If it's still showing inactive tomorrow, I'll get someone to look at it.";
        } else {
            $first  = $blockers[0];
            $result = "I've got {$user->name}'s account here, it's a {$type} account and it's not active yet. "
                    . $first['say'];

            if (count($blockers) > 1) {
                $result .= ' Once that\'s sorted there '
                        . (count($blockers) === 2 ? 'is one more thing' : 'are ' . (count($blockers) - 1) . ' more things')
                        . ' to do, but start with that one.';
            } else {
                $result .= ' That\'s the only thing holding it — once it\'s in, the account activates by itself.';
            }
        }

        Log::info('[Agent] account_status', [
            'user_id'  => $user->id,
            'active'   => $evaluation['is_active'],
            'blockers' => array_column($blockers, 'code'),
        ]);

        return response()->json([
            'result' => $result,
            'data'   => [
                'found'            => true,
                'name'             => $user->name,
                'staffo_id'        => $user->staffo_id,
                'account_type'     => $evaluation['account_type'],
                'is_active'        => $evaluation['is_active'],
                'should_be_active' => $evaluation['should_be_active'],
                'percentage'       => $evaluation['percentage'],
                'email_verified'   => $evaluation['email_verified'],
                'document_points'  => $evaluation['document_points'],
                'blockers'         => $blockers,
                'documents'        => $evaluation['documents'],
            ],
        ]);
    }

    // =====================================================================
    // 2. why_no_jobs — "I'm not getting any shifts"
    // =====================================================================

    public function whyNoJobs(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return $this->notFound($request);
        }

        $type     = $this->profiles->accountType($user);
        $problems = [];
        $data     = ['account_type' => $type];

        if (!$user->is_active) {
            $blockers = $this->profiles->blockers($user);
            $say      = $blockers[0]['say'] ?? 'There\'s something outstanding on the profile.';

            return response()->json([
                'result' => "That's the reason — the account isn't active yet, and an inactive account receives no jobs at all. "
                          . $say,
                'data'   => $data + ['is_active' => false, 'blockers' => $blockers],
            ]);
        }

        if ($type === 'staffoo_staff') {
            $data['location_on']        = !empty($user->current_coordinates);
            $data['notifications_on']   = !empty($user->notification_token);
            $data['state']              = $user->state;
            $data['operating_state']    = in_array(strtolower((string) $user->state), ['victoria', 'vic', 'new south wales', 'nsw'], true);

            if (!$data['location_on']) {
                $problems[] = 'Your location isn\'t coming through to us, and jobs are sent out based on how close you are to the site. '
                            . 'Open your phone settings, find the STAFFOO app, turn location on, then open the app once so it updates.';
            }

            if (!$data['notifications_on']) {
                $problems[] = 'Notifications are blocked for the app, so job alerts can\'t reach you even when you\'re eligible. '
                            . 'Phone settings, apps, STAFFOO, notifications, allow.';
            }

            if (!$data['operating_state']) {
                $problems[] = 'Your account is in ' . ($user->state ?: 'a state') . ', and STAFFOO\'s own shifts are only running '
                            . 'in Victoria and New South Wales at the moment. We are expanding — I\'ll put you on the list so you hear first.';
            }

            $week = $this->weeklyHours($user);
            $data = array_merge($data, $week);

            if ($week['hours_remaining'] <= 0) {
                $problems[] = 'You\'ve already got ' . round($week['hours_this_week'], 1) . ' hours booked this week, '
                            . 'and your cap is ' . $week['weekly_cap'] . '. You can still be notified, but the system won\'t let you accept '
                            . 'anything more until the week rolls over on Monday.';
            } elseif ($week['hours_remaining'] < 4) {
                $problems[] = 'You\'ve got ' . round($week['hours_remaining'], 1) . ' hours left on your weekly cap of ' . $week['weekly_cap'] . '. '
                            . 'Since the minimum shift is four hours, nothing will fit until Monday.';
            }

            $today = $this->todayLoad($user);
            $data  = array_merge($data, $today);

            if ($today['jobs_today'] >= 2) {
                $problems[] = 'You\'ve already got two shifts booked today, which is the daily maximum.';
            } elseif ($today['hours_today'] >= 12) {
                $problems[] = 'You\'re on ' . round($today['hours_today'], 1) . ' hours today, and twelve is the daily cap.';
            }
        }

        if ($type === 'contractor') {
            $data['notifications_on'] = !empty($user->notification_token);
            $data['states_allowed']   = $this->profiles->evaluate($user)['states_allowed'];
            $data['staff_count']      = User::where('user_id', $user->id)->where('user_type', 'staff')->count();

            if (!$data['notifications_on']) {
                $problems[] = 'Notifications are blocked for the app, so jobs can\'t reach you even though you\'re approved.';
            }

            if ($data['states_allowed'] === []) {
                $problems[] = 'There are no states on your account, so there\'s nothing for jobs to match against.';
            } else {
                $states    = implode(', ', array_map('ucfirst', $data['states_allowed']));
                $problems[] = 'You\'re approved for ' . $states . ', and you only get jobs posted in those. '
                            . 'There\'s no distance limit — if the work you want is in another state, you can add it yourself '
                            . 'by uploading that state\'s compliance documents and setting a charge rate.';
            }

            if ($data['staff_count'] === 0) {
                $problems[] = 'You haven\'t added any staff yet. When you take a job you have to assign one of your own people to it, '
                            . 'so it\'s worth loading your team in first — there\'s a bulk CSV upload under Staff Management.';
            }
        }

        if ($problems === []) {
            $result = 'I can\'t see anything blocking you — the account is active, location and notifications are both on, '
                    . 'and you\'re under your limits. Jobs go to the closest guards first and widen out from there, so it\'s worth '
                    . 'checking the Cover Job tab yourself rather than waiting for an alert.';
        } else {
            $result = count($problems) === 1
                ? $problems[0]
                : 'There are a couple of things. First, ' . $problems[0] . ' Then: ' . implode(' Also, ', array_slice($problems, 1));
        }

        Log::info('[Agent] why_no_jobs', ['user_id' => $user->id, 'problems' => count($problems)]);

        return response()->json(['result' => $result, 'data' => $data + ['problems' => $problems]]);
    }

    // =====================================================================
    // 3. my_shifts — "what have I got on?"
    // =====================================================================

    public function myShifts(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return $this->notFound($request);
        }

        $upcoming = JobRoster::where('assigned_to', $user->id)
            ->where('job_status', '!=', 'cancelled')
            ->where('start', '>=', Carbon::now())
            ->orderBy('start')
            ->limit(5)
            ->get();

        $recent = JobRoster::where('assigned_to', $user->id)
            ->where('job_status', '!=', 'cancelled')
            ->where('start', '<', Carbon::now())
            ->orderByDesc('start')
            ->limit(3)
            ->get();

        if ($upcoming->isEmpty() && $recent->isEmpty()) {
            return response()->json([
                'result' => 'I can\'t see any shifts on your account, upcoming or past.',
                'data'   => ['upcoming' => [], 'recent' => []],
            ]);
        }

        if ($upcoming->isEmpty()) {
            $last   = $recent->first();
            $result = 'Nothing coming up at the moment. Your last shift was '
                    . Carbon::parse($last->start)->format('l j F') . '.';
        } else {
            $next   = $upcoming->first();
            $result = 'Your next shift is ' . Carbon::parse($next->start)->format('l j F')
                    . ', ' . Carbon::parse($next->start)->format('g:ia')
                    . ' to ' . Carbon::parse($next->end)->format('g:ia') . '.';

            if ($upcoming->count() > 1) {
                $result .= ' You\'ve got ' . $upcoming->count() . ' booked in total.';
            }
        }

        return response()->json([
            'result' => $result,
            'data'   => [
                'upcoming' => $this->describeShifts($upcoming),
                'recent'   => $this->describeShifts($recent),
            ],
        ]);
    }

    // =====================================================================
    // 4. pay_status — "where's my money?"
    //
    // Deliberately conservative. It never states an amount and never says
    // money has been paid — it reports what the roster shows and hands the
    // rest to a human.
    // =====================================================================

    public function payStatus(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return $this->notFound($request);
        }

        $type = $this->profiles->accountType($user);

        if ($type === 'contractor') {
            return response()->json([
                'result' => 'Contractors are on a fortnightly cycle and you get an invoice for each period. '
                          . 'If one looks wrong or hasn\'t landed, tell me which period and I\'ll get the team onto it.',
                'data'   => ['account_type' => 'contractor', 'cycle' => 'fortnightly'],
            ]);
        }

        $completed = JobRoster::where('assigned_to', $user->id)
            ->where('job_status', 'completed')
            ->orderByDesc('end')
            ->limit(5)
            ->get();

        $payslip = DB::table('guard_payslips')
            ->where('guard_id', $user->id)
            ->orderByDesc('end_date')
            ->first();

        $data = [
            'account_type'    => $type,
            'completed_count' => $completed->count(),
            'last_completed'  => $completed->first() ? Carbon::parse($completed->first()->end)->toDateString() : null,
            'last_payslip'    => $payslip->end_date ?? null,
        ];

        if ($completed->isEmpty()) {
            return response()->json([
                'result' => 'I can\'t see any completed shifts on the account yet. Payment follows a completed shift, '
                          . 'so there wouldn\'t be anything due. Have I got the right account?',
                'data'   => $data,
            ]);
        }

        $last   = Carbon::parse($completed->first()->end);
        $result = 'Your most recent completed shift was ' . $last->format('l j F') . '. '
                . 'Guards are paid once a job is completed rather than on a set pay day, and your payslip shows in your account.';

        if ($payslip) {
            $result .= ' The latest payslip on file runs to ' . Carbon::parse($payslip->end_date)->format('j F') . '.';
        }

        $result .= ' I can\'t see payment records from here though, so if something hasn\'t come through I\'ll get it looked at properly — '
                 . 'which shift is it?';

        return response()->json(['result' => $result, 'data' => $data]);
    }

    // =====================================================================
    // 5. resend_verification — the only write
    // =====================================================================

    public function resendVerification(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            return $this->notFound($request);
        }

        if ($user->is_email_approved) {
            return response()->json([
                'result' => 'That email is already verified, so there\'s nothing to resend. '
                          . 'Whatever is holding the account is something else — let me check.',
                'data'   => ['already_verified' => true],
            ]);
        }

        $key = 'verify-resend:' . $user->id;
        if (cache()->has($key)) {
            return response()->json([
                'result' => 'One has already gone out in the last few minutes. Give it a moment and check your junk folder — '
                          . 'it comes from no-reply@staffoo.com.au.',
                'data'   => ['rate_limited' => true],
            ]);
        }

        try {
            // Reuse whatever your registration flow sends. Replace this line with
            // the mailable you already have if the name differs.
            Mail::to($user->email)->send(new \App\Mail\VerifyEmail($user));
            cache()->put($key, true, now()->addMinutes(5));

            Log::info('[Agent] verification resent', ['user_id' => $user->id]);

            return response()->json([
                'result' => 'Sent. It\'s on its way to ' . $this->maskEmail($user->email)
                          . ' — check your junk folder too, it comes from no-reply@staffoo.com.au.',
                'data'   => ['sent' => true],
            ]);
        } catch (\Throwable $e) {
            Log::error('[Agent] verification resend failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);

            return response()->json([
                'result' => 'I couldn\'t get that to send just now. I\'ll pass it to the team to send manually — '
                          . 'someone will come back to you, typically within the hour.',
                'data'   => ['sent' => false],
            ]);
        }
    }

    // ---------------------------------------------------------------- helpers

    /**
     * Find the account from an email, a STAFO id, or the caller's phone number.
     * Retell passes the caller number as from_number on voice calls.
     */
    private function resolveUser(Request $request): ?User
    {
        $args = $request->input('args', []) + $request->all();

        $identifier = trim((string) ($args['email'] ?? $args['identifier'] ?? $args['staffo_id'] ?? ''));

        $query = User::with(['staff', 'documents']);

        if ($identifier !== '') {
            if (Str::contains($identifier, '@')) {
                return $query->whereRaw('LOWER(email) = ?', [strtolower($identifier)])->first();
            }

            // STAFO123, stafo 123, or just 123
            $normalised = strtoupper(preg_replace('/[^A-Z0-9]/i', '', $identifier));
            if (!Str::startsWith($normalised, 'STAFO')) {
                $normalised = 'STAFO' . ltrim($normalised, '0');
            }

            $user = $query->where('staffo_id', $normalised)->first();
            if ($user) {
                return $user;
            }
        }

        $phone = $args['phone'] ?? $args['from_number'] ?? $request->input('call.from_number');
        if ($phone) {
            return $this->findByPhone($query, $phone);
        }

        return null;
    }

    private function findByPhone($query, string $phone): ?User
    {
        $digits = preg_replace('/\D/', '', $phone);
        $tail   = substr($digits, -9); // 9 significant digits of an AU mobile

        if (strlen($tail) < 8) {
            return null;
        }

        return (clone $query)
            ->whereRaw("REPLACE(REPLACE(REPLACE(phone,' ',''),'-',''),'+','') LIKE ?", ['%' . $tail])
            ->first();
    }

    private function notFound(Request $request)
    {
        $args       = $request->input('args', []) + $request->all();
        $identifier = $args['email'] ?? $args['staffo_id'] ?? $args['identifier'] ?? null;

        Log::info('[Agent] lookup miss', ['identifier' => $identifier]);

        return response()->json([
            'result' => $identifier
                ? 'I can\'t find an account under that. It might be registered under a different email, or there\'s a typo. '
                . 'Can you read it back to me slowly?'
                : 'I\'ll need the email address you registered with to look that up — what is it?',
            'data'   => ['found' => false],
        ]);
    }

    private function weeklyHours(User $user): array
    {
        $visaType = $user->staff->staff_document_type ?? null;
        $cap      = $visaType === 'student_visa' ? 24 : 38;

        $hours = (float) DB::table('job_rosters')
            ->where('assigned_to', $user->id)
            ->where('job_status', '!=', 'cancelled')
            ->whereBetween('start', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->sum('hours');

        return [
            'visa_type'       => $visaType,
            'weekly_cap'      => $cap,
            'hours_this_week' => $hours,
            'hours_remaining' => $cap - $hours,
        ];
    }

    private function todayLoad(User $user): array
    {
        $jobs = JobRoster::where('assigned_to', $user->id)
            ->whereDate('start', Carbon::today())
            ->where('job_status', '!=', 'cancelled')
            ->get();

        $hours = 0.0;
        foreach ($jobs as $job) {
            try {
                $hours += Carbon::parse($job->start)->diffInHours(Carbon::parse($job->end));
            } catch (\Throwable $e) {
                // ignore an unparseable row rather than fail the whole lookup
            }
        }

        return ['jobs_today' => $jobs->count(), 'hours_today' => $hours];
    }

    private function describeShifts($shifts): array
    {
        return $shifts->map(fn ($s) => [
            'id'     => $s->id,
            'start'  => $s->start,
            'end'    => $s->end,
            'hours'  => $s->hours,
            'status' => $s->job_status,
        ])->values()->all();
    }

    private function maskEmail(string $email): string
    {
        [$local, $domain] = array_pad(explode('@', $email, 2), 2, '');
        $visible = Str::substr($local, 0, 2);

        return $visible . str_repeat('*', max(strlen($local) - 2, 1)) . '@' . $domain;
    }
}
