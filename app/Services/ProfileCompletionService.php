<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Single source of truth for "is this account active, and if not, why".
 *
 * Before this existed the same rule was written out four times — in
 * SendProfileReminders, StaffController, AdminStaffController and
 * ContractorController — and the admin two had already drifted away from the
 * other two. Anything that needs the rule should call this instead.
 *
 *   evaluate()   reads only. Safe to call from an API the AI agent hits.
 *   syncStatus() evaluates, then writes is_active and fires the emails and
 *                push notification. This is what the cron and the controllers
 *                should call.
 */
class ProfileCompletionService
{
    public const BASE_WEIGHT     = 50;
    public const DOCUMENT_WEIGHT = 50;

    /** Points per document, STAFFOO's own staff only (user_id == 1). */
    public const DOCUMENT_POINTS = [
        'passport'              => 70,
        'citizen_ship'          => 70,
        'medicare'              => 25,
        'birth_certificate'     => 25,
        'security_license'      => 40,
        'driver_license_front'  => 70,
        'driver_license_back'   => 0,
        'working_with_children' => 0,
        'first_aid'             => 0,
        'cpr'                   => 0,
        'visa'                  => 0,
    ];

    /** Readable names, for anything shown to a person. */
    public const DOCUMENT_LABELS = [
        'passport'             => 'passport',
        'citizen_ship'         => 'citizenship certificate',
        'medicare'             => 'Medicare card',
        'birth_certificate'    => 'birth certificate',
        'security_license'     => 'security license',
        'driver_license_front' => 'driver license (front)',
        'driver_license_back'  => 'driver license (back)',
    ];

    /**
     * Work out where an account stands. Writes nothing.
     *
     * @return array{
     *   user_id:int, account_type:string, is_active:bool, should_be_active:bool,
     *   percentage:int, email_verified:bool, blockers:array, documents:array,
     *   document_points:int|null, personal_information:array
     * }
     */
    public function evaluate(User $user): array
    {
        $accountType = $this->accountType($user);
        $documents   = $user->documents ?? collect();

        $base = $this->scoreBase($user, $accountType);

        $documentPoints = null;
        $documentScore  = 0.0;
        $docsOk         = false;

        switch ($accountType) {
            case 'staffoo_staff':
                $documentPoints = $this->countDocumentPoints($documents);
                $documentScore  = min(($documentPoints / 100) * self::DOCUMENT_WEIGHT, self::DOCUMENT_WEIGHT);
                $docsOk         = $documentPoints >= 100;
                break;

            case 'contractor_staff':
                $securityLicense = $documents->firstWhere('document_type', 'security_license');
                $docsOk          = $securityLicense && !empty($securityLicense->document_expiry);
                $documentScore   = $this->scoreDocumentsByRatio($documents);
                break;

            default: // contractor, client
                $documentScore = $this->scoreDocumentsByRatio($documents, true);

                if ($accountType === 'contractor'
                    && in_array(strtolower((string) $user->state), ['victoria', 'queensland'], true)) {
                    $labourHire = $documents->firstWhere('document_type', 'labour_hire');
                    if (!$labourHire || empty($labourHire->document_no)) {
                        $documentScore *= 0.5;
                    }
                }
                $docsOk = true;
                break;
        }

        $percentage = in_array($user->user_type, ['contractor', 'staff'], true)
            ? (int) round($base['score'] + $documentScore)
            : (int) round($base['score'] + self::DOCUMENT_WEIGHT);

        $missingRatedStates = [];
        if ($accountType === 'contractor') {
            $missingRatedStates = $this->missingChargeRateStates($user);
            if ($missingRatedStates === null || $missingRatedStates !== []) {
                $percentage = min($percentage, 99);
            }
        }

        $shouldBeActive = $base['complete'] && $docsOk
            && ($accountType !== 'contractor' || ($missingRatedStates === [] ));

        return [
            'user_id'              => $user->id,
            'staffo_id'            => $user->staffo_id,
            'name'                 => $user->name,
            'email'                => $user->email,
            'account_type'         => $accountType,
            'is_active'            => (bool) $user->is_active,
            'should_be_active'     => $shouldBeActive,
            'percentage'           => min($percentage, 100),
            'email_verified'       => (bool) $user->is_email_approved,
            'document_points'      => $documentPoints,
            'documents'            => $this->describeDocuments($documents, $accountType),
            'personal_information' => $this->personalInformation($user),
            'forms'                => $base['forms'],
            'missing_charge_rates' => $missingRatedStates,
            'states_allowed'       => $this->statesAllowed($user),
        ];
    }

    /**
     * Evaluate, then persist the status change and fire the usual side effects.
     * This is the only method that writes.
     */
    public function syncStatus(User $user): array
    {
        $result   = $this->evaluate($user);
        $newState = $result['should_be_active'] ? 1 : 0;
        $old      = (int) $user->is_active;

        if ($old !== $newState) {
            dispatch(new \App\Jobs\SendAccountStatusEmailJob(
                $user,
                $newState === 1 ? 'active' : 'inactive'
            ));

            $user->is_active = $newState;
            $user->profile_completion_percentage = $result['percentage'];
            $user->save();

            if ($newState === 1 && function_exists('send_push_notification')) {
                send_push_notification([
                    'notification_token' => $user->notification_token,
                    'message'            => 'Congratulations! Your account is now active.',
                    'title'              => 'Account Activated',
                    'page'               => 'account-verified',
                ]);
            }
        } elseif ((int) $user->profile_completion_percentage !== $result['percentage']) {
            $user->profile_completion_percentage = $result['percentage'];
            $user->save();
        }

        $result['is_active'] = (bool) $newState;

        return $result;
    }

    /**
     * The one thing holding the account, in the order a person should fix them.
     * Returns [] when nothing is wrong.
     *
     * Each entry: ['code' => ..., 'say' => 'a sentence the agent can read out']
     */
    public function blockers(User $user, ?array $evaluation = null): array
    {
        $e        = $evaluation ?? $this->evaluate($user);
        $blockers = [];

        if (!$e['email_verified']) {
            $blockers[] = [
                'code' => 'email_not_verified',
                'say'  => "Your email address hasn't been verified yet, so nothing else can go through. "
                        . "Check your inbox and your junk folder for a message from no-reply@staffoo.com.au.",
            ];
            return $blockers; // nothing else matters until this is done
        }

        if ($e['account_type'] === 'staffoo_staff') {
            $missingPersonal = array_keys(array_filter($e['personal_information'], fn ($v) => $v === false));
            if ($missingPersonal !== []) {
                $blockers[] = [
                    'code'    => 'personal_information_incomplete',
                    'missing' => $missingPersonal,
                    'say'     => 'Your personal information section still needs ' . $this->readableList($missingPersonal) . '.',
                ];
            }

            $points = (int) $e['document_points'];
            if ($points < 100) {
                $blockers[] = [
                    'code'   => 'document_points_short',
                    'points' => $points,
                    'short'  => 100 - $points,
                    'say'    => $this->pointsSentence($points, $e['documents']),
                ];
            }

            $missingForms = array_keys(array_filter($e['forms'], fn ($v) => $v === false));
            if ($missingForms !== []) {
                $labels = [
                    'onboarding_form' => 'onboarding form',
                    'tfn_form'        => 'TFN form',
                    'super_form'      => 'Superannuation form',
                ];
                $names = array_map(fn ($f) => $labels[$f] ?? $f, $missingForms);
                $blockers[] = [
                    'code'    => 'forms_missing',
                    'missing' => $missingForms,
                    'say'     => 'You still need to submit the ' . $this->readableList($names) . '.',
                ];
            }
        }

        if ($e['account_type'] === 'contractor_staff') {
            $license = collect($e['documents'])->firstWhere('key', 'security_license');
            if (!$license) {
                $blockers[] = [
                    'code' => 'security_license_missing',
                    'say'  => 'Your security license hasn\'t been uploaded yet. That\'s the only thing your account needs.',
                ];
            } elseif (empty($license['expiry'])) {
                $blockers[] = [
                    'code' => 'security_license_no_expiry',
                    'say'  => 'Your security license is uploaded but it has no expiry date on it, and without that date it doesn\'t count. '
                            . 'Open the document in the app and add the expiry.',
                ];
            }
        }

        if ($e['account_type'] === 'contractor') {
            if ($e['states_allowed'] === []) {
                $blockers[] = [
                    'code' => 'no_states_selected',
                    'say'  => 'There are no working states selected on your account. Until you pick at least one, the account can\'t activate.',
                ];
            } elseif ($e['missing_charge_rates'] !== []) {
                $states = array_map('ucfirst', $e['missing_charge_rates']);
                $blockers[] = [
                    'code'    => 'charge_rate_missing',
                    'missing' => $e['missing_charge_rates'],
                    'say'     => 'You\'ve got no charge rate saved for ' . $this->readableList($states) . '. '
                               . 'Even one state without a rate holds the whole account at ninety-nine percent.',
                ];
            }

            if (in_array(strtolower((string) $user->state), ['victoria', 'queensland'], true)) {
                $labourHire = collect($e['documents'])->firstWhere('key', 'labour_hire');
                if ($labourHire && empty($labourHire['number'])) {
                    $blockers[] = [
                        'code' => 'labour_hire_number_missing',
                        'say'  => 'Your labour hire document is there but the licence number field is blank. '
                                . 'In Victoria and Queensland that number has to be typed in as well.',
                    ];
                }
            }
        }

        $expired = collect($e['documents'])->where('counts', false)->where('reason', 'expired')->pluck('label')->all();
        if ($expired !== []) {
            $blockers[] = [
                'code'      => 'documents_expired',
                'documents' => $expired,
                'say'       => 'Your ' . $this->readableList($expired) . ' has expired, so it isn\'t counting. Upload a current one.',
            ];
        }

        return $blockers;
    }

    // ---------------------------------------------------------------- helpers

    public function accountType(User $user): string
    {
        if ($user->user_type === 'staff') {
            return ((int) $user->user_id === 1) ? 'staffoo_staff' : 'contractor_staff';
        }
        if ($user->user_type === 'contractor') {
            return 'contractor';
        }
        return 'client';
    }

    private function scoreBase(User $user, string $accountType): array
    {
        $fields = ['name', 'email', 'user_type'];
        $forms  = [];

        if ($accountType === 'staffoo_staff') {
            foreach (['tfn_form', 'super_form', 'onboarding_form'] as $f) {
                $forms[$f] = (bool) ($user->staff && !empty($user->staff->{$f}));
            }
        }

        $filled = 0;
        foreach ($fields as $f) {
            if (!empty($user->{$f})) {
                $filled++;
            }
        }
        $filled += count(array_filter($forms));

        $total = count($fields) + count($forms);
        $score = ($filled / max($total, 1)) * self::BASE_WEIGHT;

        return [
            'score'    => $score,
            'complete' => $score >= self::BASE_WEIGHT,
            'forms'    => $forms,
        ];
    }

    private function countDocumentPoints($documents): int
    {
        $points = 0;
        foreach ($documents as $document) {
            if ($this->documentCounts($document)) {
                $key = $this->documentKey($document);
                $points += self::DOCUMENT_POINTS[$key] ?? 0;
            }
        }
        return $points;
    }

    /** STAFFOO staff scoring keys off document_name, not document_type. */
    private function documentKey($document): string
    {
        return strtolower(str_replace(' ', '_', (string) $document->document_name));
    }

    private function documentCounts($document): bool
    {
        return !empty($document->file) && $this->expiryIsValid($document->document_expiry);
    }

    private function expiryIsValid($expiry): bool
    {
        if (empty($expiry)) {
            return false;
        }
        if ($expiry === 'current, pending renewal') {
            return true;
        }
        try {
            return Carbon::parse($expiry)->isFuture();
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function scoreDocumentsByRatio($documents, bool $allowPendingRenewal = false): float
    {
        $total = $documents->count();
        if ($total === 0) {
            return 0.0;
        }

        $valid = $documents->filter(function ($doc) use ($allowPendingRenewal) {
            if (empty($doc->document_no)) {
                return false;
            }
            if ($allowPendingRenewal && $doc->document_expiry === 'current, pending renewal') {
                return true;
            }
            return $this->expiryIsValid($doc->document_expiry);
        })->count();

        return ($valid / $total) * self::DOCUMENT_WEIGHT;
    }

    private function describeDocuments($documents, string $accountType): array
    {
        return $documents->map(function ($doc) use ($accountType) {
            $key    = $this->documentKey($doc);
            $counts = $this->documentCounts($doc);

            $reason = null;
            if (!$counts) {
                if (empty($doc->file)) {
                    $reason = 'no_file';
                } elseif (empty($doc->document_expiry)) {
                    $reason = 'no_expiry';
                } else {
                    $reason = 'expired';
                }
            }

            return [
                'key'    => $key,
                'type'   => $doc->document_type,
                'label'  => self::DOCUMENT_LABELS[$key] ?? ucwords(str_replace('_', ' ', $key)),
                'points' => $accountType === 'staffoo_staff' ? (self::DOCUMENT_POINTS[$key] ?? 0) : null,
                'expiry' => $doc->document_expiry,
                'number' => $doc->document_no,
                'counts' => $counts,
                'reason' => $reason,
            ];
        })->values()->all();
    }

    /**
     * The personal information section, as the DB actually stores it.
     *
     * NOTE: none of these currently affect the activation score — the scoring
     * only looks at name, email and user_type. If personal information is meant
     * to block activation, that rule is not in the code yet.
     */
    private function personalInformation(User $user): array
    {
        return [
            'name'          => !empty($user->name),
            'phone'         => !empty($user->phone) || !empty($user->staff?->phone),
            'address'       => !empty($user->address),
            'city'          => !empty($user->city),
            'state'         => !empty($user->state),
            'date_of_birth' => !empty($user->staff?->date_of_birth),
        ];
    }

    private function statesAllowed(User $user): array
    {
        $states = $user->states_allowed;
        if (is_string($states)) {
            $states = json_decode($states, true) ?: [];
        }
        return array_map('strtolower', $states ?? []);
    }

    /** @return array<string> states with no charge rate saved */
    private function missingChargeRateStates(User $user): array
    {
        $allowed = $this->statesAllowed($user);
        if ($allowed === []) {
            return [];
        }

        $rated = DB::table('contractor_chargerates')
            ->where('user_id', $user->id)
            ->pluck('state')
            ->map(fn ($s) => strtolower($s))
            ->unique()
            ->all();

        return array_values(array_diff($allowed, $rated));
    }

    /** The points maths, said the way a person would say it. */
    private function pointsSentence(int $points, array $documents): string
    {
        // array_values matters: array_filter keeps the original keys, so if the
        // only scoring document sat at index 3 the list below starts at 3 and
        // $parts[0] does not exist.
        $counting = array_values(array_filter(
            $documents,
            fn ($d) => !empty($d['counts']) && ($d['points'] ?? 0) > 0
        ));

        if ($counting === []) {
            return 'None of your documents are counting towards the hundred points yet. '
                 . 'A passport or a driver license front is worth seventy on its own.';
        }

        $parts = array_values(array_map(
            fn ($d) => ($d['label'] ?? 'that document') . ' at ' . ($d['points'] ?? 0),
            $counting
        ));
        $short = 100 - $points;

        $sentence = count($parts) === 1
            ? 'You\'ve only got the ' . $parts[0] . ' counting, so you\'re on ' . $points . '. '
            : 'You\'ve got ' . $this->readableList($parts) . ', which is ' . $points . '. ';

        $sentence .= 'You\'re ' . $short . ' short of the hundred.';

        // Suggest the smallest document that closes the gap first — telling
        // someone to find a citizenship certificate when a birth certificate
        // would do is not helpful.
        $suggestions = [];
        foreach (self::DOCUMENT_POINTS as $key => $value) {
            if ($value >= $short && $value > 0 && !collect($documents)->where('key', $key)->where('counts', true)->count()) {
                $suggestions[$key] = $value;
            }
        }
        asort($suggestions);

        $labels = array_map(
            fn ($key) => self::DOCUMENT_LABELS[$key] ?? $key,
            array_slice(array_keys($suggestions), 0, 3)
        );

        if ($labels !== []) {
            $sentence .= ' Adding your ' . $this->readableList($labels, 'or') . ' would take you over.';
        }

        return $sentence;
    }

    private function readableList(array $items, string $conjunction = 'and'): string
    {
        $items = array_values(array_map(fn ($i) => str_replace('_', ' ', (string) $i), $items));

        if (count($items) === 0) {
            return '';
        }
        if (count($items) === 1) {
            return $items[0];
        }

        $last = array_pop($items);
        return implode(', ', $items) . ' ' . $conjunction . ' ' . $last;
    }
}
