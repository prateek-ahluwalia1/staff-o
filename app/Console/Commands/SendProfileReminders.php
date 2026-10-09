<?php

namespace App\Console\Commands;

use App\Mail\ProfileCompletionReminder;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendProfileReminders extends Command
{
    protected $signature = 'profiles:send-reminders
                            {--gap=2 : Minimum days since last reminder}
                            {--min-age=2 : Minimum days since registration}
                            {--dry-run : Preview without sending}';

    protected $description = 'Send profile completion reminders to inactive users every 2 days';

    public function handle(): int
    {
        $gap = (int) $this->option('gap');
        $minAge = (int) $this->option('min-age');
        $dryRun = $this->option('dry-run');

        $cutoff = Carbon::now()->subDays($gap);
        $registeredBefore = Carbon::now()->subDays($minAge);

        $this->info("Sending reminders to inactive users (gap = {$gap} days, min age = {$minAge} days)...");

        $users = User::where('is_active', 0)
            ->whereIn('user_type', ['staff', 'contractor'])
            ->where('created_at', '<=', $registeredBefore)          // registered at least 2 days ago
            ->where(function ($q) use ($cutoff) {
                $q->whereNull('last_reminder_sent_at')              // never reminded
                  ->orWhere('last_reminder_sent_at', '<=', $cutoff); // OR last reminder > 2 days ago
            })
            ->get();

        $this->info("Found {$users->count()} user(s) to process.");

        $sent = 0;
        $skipped = 0;

        foreach ($users as $user) {
            $percentage = $this->calculatePercentage($user);

            // Skip users already 100% (waiting on activation only)
            if ($percentage >= 100) {
                $this->line("  → Skipping {$user->email} (already 100% complete)");
                $skipped++;
                continue;
            }

            $missingItems = $this->getMissingItems($user);

            if ($dryRun) {
                $this->line("  → [DRY RUN] Would email {$user->email} ({$user->user_type}) - {$percentage}%");
                $sent++;
                continue;
            }

            try {
                Mail::to($user->email)->send(
                    new ProfileCompletionReminder($user, $percentage, $missingItems)
                );

                $user->last_reminder_sent_at = now();
                $user->save();

                $this->info("  ✓ Reminder sent to {$user->email} ({$user->user_type}) - {$percentage}%");
                $sent++;

                Log::info('Profile reminder sent', [
                    'user_id'     => $user->id,
                    'email'       => $user->email,
                    'user_type'   => $user->user_type,
                    'percentage'  => $percentage,
                ]);
            } catch (\Exception $e) {
                $this->error("  ✗ Failed for {$user->email}: {$e->getMessage()}");
                Log::error('Profile reminder failed', [
                    'user_id' => $user->id,
                    'error'   => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info("Done. Sent: {$sent}, Skipped: {$skipped}");
        return Command::SUCCESS;
    }

    /**
     * Call your existing profile completion logic.
     * Best: extract to a Service (see section 6).
     */
    private function calculatePercentage(User $user): int
    {
        return $this->calculateProfileCompletion($user);
    }

    private function calculateProfileCompletion(User $user): int
    {
        $baseWeight = 50;
        $documentWeight = 50;

        $baseFields = ['name', 'email', 'user_type'];
        
        $staffFields = ['tfn_form', 'super_form', 'onboarding_form'];
        
        $allBaseFields = $baseFields;
        if ($user->user_type === 'staff' && $user->user_id == 1) {
            $allBaseFields = array_merge($baseFields, $staffFields);
        }
        
        $filledBase = 0;
        foreach ($allBaseFields as $field) {
            if (in_array($field, ['tfn_form', 'super_form', 'onboarding_form'])) {
                if ($user->staff && !empty($user->staff->{$field})) {
                    $filledBase++;
                }
            } else {
                if (!empty($user->{$field})) {
                    $filledBase++;
                }
            }
        }
        
        $baseScore = ($filledBase / count($allBaseFields)) * $baseWeight;

        // Document scoring
        $documents = $user->documents ?? collect();
        $totalDocuments = $documents->count();
        $filledDocuments = 0;
        $documentScore = 0;

        if ($user->user_type === 'staff') {
            if($user->user_id == 1){
                $documentPoints = [
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

                $totalDocPoints = 0;

                foreach ($documents as $document) {
                    $docName = strtolower(str_replace(' ', '_', $document->document_name));

                    $hasFile = !empty($document->file);
                    $hasValidExpiry = false;

                    if (!empty($document->document_expiry)) {
                        if ($document->document_expiry === 'current, pending renewal') {
                            $hasValidExpiry = true;
                        } else {
                            $expiryDate = \Carbon\Carbon::parse($document->document_expiry);
                            $hasValidExpiry = $expiryDate->isFuture();
                        }
                    }

                    if ($hasFile && $hasValidExpiry) {
                        $totalDocPoints += $documentPoints[$docName] ?? 0;
                    }
                }

                $documentScore = min(($totalDocPoints / 100) * $documentWeight, $documentWeight);

                $totalScore = $baseScore + $documentScore;
                $oldStatus = $user->is_active;
                $newStatus = ($baseScore >= $baseWeight && $totalDocPoints >= 100) ? 1 : 0;

                if ($newStatus == 1 && $oldStatus != 1) {
                    dispatch(new \App\Jobs\SendAccountStatusEmailJob($user, 'active'));
                } elseif ($newStatus == 0 && $oldStatus != 0) {
                    dispatch(new \App\Jobs\SendAccountStatusEmailJob($user, 'inactive'));
                }

                if ($user->is_active !== $newStatus) {
                    $user->is_active = $newStatus;
                    $user->save();

                    if ($newStatus == 1 && $oldStatus != 1) {
                        $notificationData = [
                            'notification_token' => $user->notification_token,
                            'message'            => "Congratulations! Your account is now active.",
                            'title'              => 'Account Activated',
                            'page'               => 'account-verified',
                        ];

                        if (function_exists('send_push_notification')) {
                            send_push_notification($notificationData);
                        }
                    }
                }
            }else{
                $securityLicenseDoc = $documents->firstWhere('document_type', 'security_license');
                // $firstAidDoc = $documents->firstWhere('document_type', 'first_aid');
                
                $hasSecurityLicenseWithExpiry = $securityLicenseDoc && !empty($securityLicenseDoc->document_expiry);
                // $hasFirstAidWithExpiry = $firstAidDoc && !empty($firstAidDoc->document_expiry);
                
                $oldStatus = $user->is_active;
                $newStatus = ($baseScore >= $baseWeight && $hasSecurityLicenseWithExpiry) ? 1 : 0;

                if ($newStatus == 1 && $oldStatus != 1) {
                    dispatch(new \App\Jobs\SendAccountStatusEmailJob($user, 'active'));
                } elseif ($newStatus == 0 && $oldStatus != 0) {
                    dispatch(new \App\Jobs\SendAccountStatusEmailJob($user, 'inactive'));
                }

                if ($user->is_active !== $newStatus) {
                    $user->is_active = $newStatus;
                    $user->save();
                    
                if ($totalDocuments > 0) {
                    $filledDocuments = $documents->filter(function ($doc) {
                        // 1. Ensure the document number is not empty
                        if (empty($doc->document_no)) {
                            return false;
                        }
                
                        // 2. Check if the expiry date exists and is in the future
                        if (!empty($doc->document_expiry)) {
                            $expiryDate = \Carbon\Carbon::parse($doc->document_expiry);
                            return $expiryDate->isFuture();
                        }
                
                        // Return false if there is no expiry date but your logic requires one
                        return false; 
                    })->count();
                
                    $documentScore = ($filledDocuments / $totalDocuments) * $documentWeight;
                }

                    if ($newStatus == 1 && $oldStatus != 1) {
                        $notificationData = [
                            'notification_token' => $user->notification_token,
                            'message'            => "Congratulations! Your account is now active.",
                            'title'              => 'Account Activated',
                            'page'               => 'account-verified',
                        ];

                        if (function_exists('send_push_notification')) {
                            send_push_notification($notificationData);
                        }
                    }
                }

            }
        } else {
            if ($totalDocuments > 0) {
                    $filledDocuments = $documents->filter(function ($doc) {
                        if (empty($doc->document_no)) {
                            return false;
                        }

                        if ($doc->document_expiry === 'current, pending renewal') {
                            return true;
                        } else {
                            $expiryDate = \Carbon\Carbon::parse($doc->document_expiry);
                            return $expiryDate->isFuture();
                        }

                    })->count();

                    $documentScore = ($filledDocuments / $totalDocuments) * $documentWeight;
                }

            if ($user->user_type === 'contractor' && in_array(strtolower($user->state), ['victoria', 'queensland'])) {
                $labourHireDoc = $documents->firstWhere('document_type', 'labour_hire');
                if (!$labourHireDoc || empty($labourHireDoc->document_no)) {
                    $documentScore = $documentScore * 0.5;
                }
            }
        }

        // Final percentage
        if (in_array($user->user_type, ['contractor', 'staff'])) {
            $percentage = (int) round($baseScore + $documentScore);
        } else {
            $percentage = (int) round($baseScore + 50);
        }

        if ($user->user_type === 'contractor') {
            $statesAllowed = $user->states_allowed;
    
            if (is_string($statesAllowed)) {
                $statesAllowed = json_decode($statesAllowed, true) ?: [];
            }
            $statesAllowed = array_map('strtolower', $statesAllowed ?? []);
    
            if (empty($statesAllowed)) {
                // No allowed states set at all -> treat as incomplete, force inactive
                $percentage = min($percentage, 99);
            } else {
                $ratedStates = DB::table('contractor_chargerates')
                    ->where('user_id', $user->id)
                    ->pluck('state')
                    ->map(fn($s) => strtolower($s))
                    ->unique()
                    ->toArray();
    
                $missingStates = array_diff($statesAllowed, $ratedStates);
    
                if (!empty($missingStates)) {
                    $percentage = min($percentage, 99);
                }
            }
        }

        return min($percentage, 100);
    }

    /**
     * Build a human-readable list of missing items.
     */
    private function getMissingItems(User $user): array
    {
        $missing = [];

        foreach (['name' => 'Full Name', 'email' => 'Email Address', 'user_type' => 'User Type'] as $f => $label) {
            if (empty($user->{$f})) {
                $missing[] = "Missing {$label}";
            }
        }

        if ($user->user_type === 'staff' && $user->user_id == 1) {
            foreach (['tfn_form' => 'TFN Form', 'super_form' => 'Super Form', 'onboarding_form' => 'Onboarding Form'] as $f => $label) {
                if (!$user->staff || empty($user->staff->{$f})) {
                    $missing[] = "Upload {$label}";
                }
            }
        }

        $documents = $user->documents ?? collect();
        if ($documents->isEmpty()) {
            $missing[] = 'Upload required documents';
        } else {
            foreach ($documents as $doc) {
                $invalid = empty($doc->document_no)
                    || (empty($doc->document_expiry))
                    || ($doc->document_expiry !== 'current, pending renewal'
                        && !\Carbon\Carbon::parse($doc->document_expiry)->isFuture());

                if ($invalid) {
                    $label = ucwords(str_replace('_', ' ', $doc->document_type ?? $doc->document_name));
                    $missing[] = "Update/Upload: {$label}";
                }
            }
        }

        if ($user->user_type === 'contractor') {
            $statesAllowed = $user->states_allowed;
            if (is_string($statesAllowed)) {
                $statesAllowed = json_decode($statesAllowed, true) ?: [];
            }
            $statesAllowed = array_map('strtolower', $statesAllowed ?? []);

            if (empty($statesAllowed)) {
                $missing[] = 'Select your allowed states';
            } else {
                $ratedStates = DB::table('contractor_chargerates')
                    ->where('user_id', $user->id)
                    ->pluck('state')
                    ->map(fn($s) => strtolower($s))
                    ->unique()
                    ->toArray();

                foreach (array_diff($statesAllowed, $ratedStates) as $state) {
                    $missing[] = 'Set charge rate for ' . ucfirst($state);
                }
            }
        }

        return $missing ?: ['Please review your profile for any incomplete sections'];
    }
}