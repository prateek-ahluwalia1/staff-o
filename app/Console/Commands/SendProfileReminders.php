<?php

namespace App\Console\Commands;

use App\Mail\ProfileCompletionReminder;
use App\Models\User;
use App\Services\ProfileCompletionService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Unchanged in behaviour — same query, same gap rules, same mailable.
 *
 * What changed: the 220-line calculateProfileCompletion() and getMissingItems()
 * that used to live in this file are gone. Both now come from
 * ProfileCompletionService, which the AI agent's lookup endpoint also uses, so
 * the reminder email and the agent can never tell a guard two different stories.
 */
class SendProfileReminders extends Command
{
    protected $signature = 'profiles:send-reminders
                            {--gap=2 : Minimum days since last reminder}
                            {--min-age=2 : Minimum days since registration}
                            {--dry-run : Preview without sending}';

    protected $description = 'Send profile completion reminders to inactive users every 2 days';

    public function handle(ProfileCompletionService $profiles): int
    {
        $gap    = (int) $this->option('gap');
        $minAge = (int) $this->option('min-age');
        $dryRun = (bool) $this->option('dry-run');

        $cutoff           = Carbon::now()->subDays($gap);
        $registeredBefore = Carbon::now()->subDays($minAge);

        $this->info("Sending reminders to inactive users (gap = {$gap} days, min age = {$minAge} days)...");

        $users = User::with(['staff', 'documents'])
            ->where('is_active', 0)
            ->whereIn('user_type', ['staff', 'contractor'])
            ->where('created_at', '<=', $registeredBefore)
            ->where(function ($q) use ($cutoff) {
                $q->whereNull('last_reminder_sent_at')
                  ->orWhere('last_reminder_sent_at', '<=', $cutoff);
            })
            ->get();

        $this->info("Found {$users->count()} user(s) to process.");

        $sent = $skipped = $activated = 0;

        foreach ($users as $user) {
            // syncStatus writes is_active and fires the activation email if the
            // user has quietly finished everything since the last run. This is
            // the behaviour the old inline code had, kept deliberately.
            $evaluation = $profiles->syncStatus($user);

            if ($evaluation['is_active']) {
                $this->line("  → {$user->email} is now active, no reminder needed");
                $activated++;
                continue;
            }

            if ($evaluation['percentage'] >= 100) {
                $this->line("  → Skipping {$user->email} (already 100% complete)");
                $skipped++;
                continue;
            }

            $blockers     = $profiles->blockers($user, $evaluation);
            $missingItems = array_column($blockers, 'say');

            if ($missingItems === []) {
                $missingItems = ['Please review your profile for any incomplete sections'];
            }

            if ($dryRun) {
                $this->line("  → [DRY RUN] {$user->email} ({$evaluation['account_type']}) — {$evaluation['percentage']}% — "
                    . implode(' | ', array_column($blockers, 'code')));
                $sent++;
                continue;
            }

            try {
                Mail::to($user->email)->send(
                    new ProfileCompletionReminder($user, $evaluation['percentage'], $missingItems)
                );

                $user->last_reminder_sent_at = now();
                $user->save();

                $this->info("  ✓ {$user->email} ({$evaluation['account_type']}) — {$evaluation['percentage']}%");
                $sent++;

                Log::info('Profile reminder sent', [
                    'user_id'    => $user->id,
                    'email'      => $user->email,
                    'user_type'  => $user->user_type,
                    'percentage' => $evaluation['percentage'],
                    'blockers'   => array_column($blockers, 'code'),
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
        $this->info("Done. Sent: {$sent}, Skipped: {$skipped}, Activated: {$activated}");

        return Command::SUCCESS;
    }
}
