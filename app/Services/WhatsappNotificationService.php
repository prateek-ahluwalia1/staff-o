<?php

namespace App\Services;

use App\Models\NotificationRecipient;
use App\Models\NotificationSetting;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * The ONE place every automated WhatsApp message in the app goes through.
 *
 * Every feature — account activation, job posting, job accept/assign,
 * sign-in/out, payment due/completed, the daily admin digest — calls the
 * same `notify()` method with an event key and a list of recipients. That
 * gives us, for free:
 *
 *   - a single on/off switch per event, controlled from the superadmin
 *     panel via `notification_settings` (NotificationSetting::isEnabled())
 *   - a single place that formats messages, so wording changes happen once
 *   - a single place that swallows and logs failures, so a WhatsApp outage
 *     (or a bad number) can NEVER break the job/payment/signin flow that
 *     triggered it — every call site wraps this in "fire and forget"
 *
 * Usage:
 *
 *   app(WhatsappNotificationService::class)->notify('job.signin', [$client, $contractor], [
 *       'guard_name' => $guard->name,
 *       'site'       => $site->site_name,
 *   ]);
 *
 * Recipients can be:
 *   - a User model (uses ->phone)
 *   - a raw phone string
 *   - ['group' => 'admin.daily_summary'] to pull admin-managed numbers
 *
 * Nothing here throws. If Twilio/config is broken, it logs and returns —
 * callers never need a try/catch of their own, but since this already
 * guarantees "never throws", call sites can still add one just to be extra
 * safe about anything unexpected before this class runs (e.g. building the
 * $data array).
 */
class WhatsappNotificationService
{
    public function __construct(private ?TwilioService $twilio = null)
    {
    }

    /**
     * @param string $event      one of the keys seeded in notification_settings
     * @param array  $recipients User|string|['group' => string] entries
     * @param array  $data       template variables, see buildMessage()
     */
    public function notify(string $event, array $recipients, array $data = []): void
    {
        try {
            if (!NotificationSetting::isEnabled($event)) {
                Log::info("[WhatsApp] {$event} skipped — disabled in notification settings.");
                return;
            }

            $message = $this->buildMessage($event, $data);
            if ($message === null) {
                Log::warning("[WhatsApp] {$event} has no message template — skipped.", ['data' => $data]);
                return;
            }

            $phones = $this->resolvePhones($recipients);

            if ($phones === []) {
                Log::info("[WhatsApp] {$event} had no valid recipients.", ['recipients' => $recipients]);
                return;
            }

            foreach ($phones as $phone) {
                $this->send($event, $phone, $message);
            }
        } catch (Throwable $e) {
            // This service exists specifically so a notification problem can
            // never take down the job/payment/account flow that called it.
            Log::error("[WhatsApp] notify() failed for event {$event}: " . $e->getMessage());
        }
    }

    /**
     * Convenience static so call sites don't need to inject the service.
     */
    public static function fire(string $event, array $recipients, array $data = []): void
    {
        app(self::class)->notify($event, $recipients, $data);
    }

    // ------------------------------------------------------------------ send

    private function send(string $event, string $phone, string $message): void
    {
        try {
            $twilio = $this->twilio ?? app(TwilioService::class);
            $twilio->sendWhatsapp($phone, $message);
            Log::info("[WhatsApp] {$event} sent", ['phone' => $this->maskPhone($phone)]);
        } catch (Throwable $e) {
            Log::error("[WhatsApp] {$event} failed to send", [
                'phone' => $this->maskPhone($phone),
                'error' => $e->getMessage(),
            ]);
        }
    }

    // --------------------------------------------------------------- phones

    private function resolvePhones(array $recipients): array
    {
        $phones = [];

        foreach ($recipients as $recipient) {
            if ($recipient instanceof User) {
                if (!empty($recipient->phone)) {
                    $phones[] = $recipient->phone;
                }
                continue;
            }

            if (is_array($recipient) && isset($recipient['group'])) {
                $phones = array_merge($phones, NotificationRecipient::phonesFor($recipient['group']));
                continue;
            }

            if (is_string($recipient) && trim($recipient) !== '') {
                $phones[] = trim($recipient);
            }
        }

        return array_values(array_unique(array_filter($phones)));
    }

    private function maskPhone(string $phone): string
    {
        return str_repeat('*', max(strlen($phone) - 4, 0)) . substr($phone, -4);
    }

    // ------------------------------------------------------------ templates

    /**
     * Every notification's wording lives here, in one place. Add a new
     * event by adding a case here plus a row in notification_settings —
     * nothing else needs to change.
     */
    private function buildMessage(string $event, array $data): ?string
    {
        $name = $data['name'] ?? '';

        return match ($event) {
            'account.activated' => trim(
                "Hi {$name}, your STAFFOO account is now active. "
                . $this->activationCapability($data['account_type'] ?? null)
            ),

            'account.created' => trim(
                "Hi {$name}, your STAFFOO account has been created. "
                . "We've emailed your login details and a temporary password to {$data['email']}. "
                . $this->activationCapability($data['account_type'] ?? null)
            ),

            'job.posted' => "Hi {$name}, a new job is available"
                . (!empty($data['site']) ? " at {$data['site']}" : '')
                . (!empty($data['start']) ? " starting {$data['start']}" : '')
                . ". Open the app to view and accept it.",

            'job.accepted_client' => "Hi {$name}, your job"
                . (!empty($data['site']) ? " at {$data['site']}" : '')
                . " has been accepted"
                . (!empty($data['guard_name']) ? " by {$data['guard_name']}" : '')
                . ". Please check your job status and complete payment in the app.",

            'job.accepted_contractor' => "Hi {$name}, you've accepted the job"
                . (!empty($data['site']) ? " at {$data['site']}" : '')
                . ". Please assign one of your guards to it now.",

            'job.guard_assigned' => "Hi {$name}, you've been assigned a new job"
                . (!empty($data['site']) ? " at {$data['site']}" : '')
                . (!empty($data['start']) && !empty($data['end']) ? " from {$data['start']} to {$data['end']}" : '')
                . ". Open the app for details.",

            'job.staff_confirm' => "Hi {$name}, you've accepted the job"
                . (!empty($data['site']) ? " at {$data['site']}" : '')
                . ". Please make sure you're available for the shift and check the app for timings.",

            'job.signin' => "Hi {$name}, " . ($data['guard_name'] ?? 'the guard')
                . " has signed in"
                . (!empty($data['site']) ? " at {$data['site']}" : '')
                . ".",

            'job.signout' => "Hi {$name}, " . ($data['guard_name'] ?? 'the guard')
                . " has signed out and completed the job"
                . (!empty($data['site']) ? " at {$data['site']}" : '')
                . ".",

            'job.chat_request' => "New job request taken via chat from "
                . ($data['client_name'] ?? 'a client') . " ({$data['client_email']})"
                . (!empty($data['site_name']) ? " for {$data['site_name']}" : '')
                . ". Check your email for the full details.",

            'payment.due' => "Hi {$name}, payment is still due for your job"
                . (!empty($data['site']) ? " at {$data['site']}" : '')
                . ". Please complete payment in the app or client portal to avoid delays.",

            'payment.completed' => "Payment of " . ($data['amount'] ?? 'the invoice amount')
                . " has been completed"
                . (!empty($data['site']) ? " for the job at {$data['site']}" : '')
                . (!empty($data['who']) ? " ({$data['who']})" : '')
                . ".",

            'admin.daily_summary' => "STAFFOO daily summary for " . ($data['date'] ?? 'today') . ": "
                . ($data['jobs_posted'] ?? 0) . " job(s) posted, "
                . ($data['accounts_created'] ?? 0) . " new account(s) created "
                . "(staff: " . ($data['staff_created'] ?? 0)
                . ", resource partners: " . ($data['contractors_created'] ?? 0)
                . ", clients: " . ($data['clients_created'] ?? 0) . ").",

            default => null,
        };
    }

    private function activationCapability(?string $accountType): string
    {
        return match ($accountType) {
            'customer', 'client' => 'You can now post a job whenever you need guards.',
            'contractor'         => 'You can now accept jobs and assign guards to them.',
            'staff', 'staffoo_staff', 'contractor_staff' => 'You can now accept jobs and get new job alerts.',
            default              => 'You can now start using your account.',
        };
    }
}
