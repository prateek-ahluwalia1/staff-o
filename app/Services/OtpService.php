<?php

namespace App\Services;

use App\Mail\OtpCodeMail;
use App\Models\ChatOtpVerification;
use App\Models\NotificationSetting;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Email-OTP gate for "detailed" chat answers (specific shifts, pay/payslip
 * specifics). General questions (how activation works, why jobs aren't
 * coming through) are answered without this — only account-specific detail
 * is gated, and the code always goes to the REGISTERED EMAIL, never over
 * WhatsApp, so a compromised or spoofed phone number can't pull detail out
 * of the assistant on its own.
 *
 * Controlled by the "security.otp_gate" row in notification_settings —
 * superadmin can turn this off instantly if it ever misbehaves in
 * production, without a deploy.
 */
class OtpService
{
    public const PURPOSE_CHAT_DETAIL = 'chat_detail';

    public function gateEnabled(): bool
    {
        return NotificationSetting::isEnabled('security.otp_gate');
    }

    /**
     * Send a 6-digit code to the user's registered email. Rate-limited to
     * one per 60 seconds per user so a WhatsApp conversation can't be used
     * to spam someone's inbox.
     */
    public function send(User $user, string $phone, string $purpose = self::PURPOSE_CHAT_DETAIL): array
    {
        $recent = ChatOtpVerification::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->where('created_at', '>=', now()->subSeconds(60))
            ->exists();

        if ($recent) {
            return ['sent' => false, 'reason' => 'rate_limited'];
        }

        $code = (string) random_int(100000, 999999);

        ChatOtpVerification::create([
            'user_id'    => $user->id,
            'phone'      => $phone,
            'code_hash'  => Hash::make($code),
            'purpose'    => $purpose,
            'attempts'   => 0,
            'expires_at' => now()->addMinutes(10),
        ]);

        try {
            Mail::to($user->email)->send(new OtpCodeMail($user->name, $code));
        } catch (\Throwable $e) {
            Log::error('[OTP] failed to email code', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return ['sent' => false, 'reason' => 'email_failed'];
        }

        Log::info('[OTP] code sent', ['user_id' => $user->id, 'purpose' => $purpose]);

        return ['sent' => true];
    }

    /**
     * Verify a code the user typed back into WhatsApp. Max 5 attempts per
     * code before it's dead and a fresh one is required.
     */
    public function verify(User $user, string $phone, string $code, string $purpose = self::PURPOSE_CHAT_DETAIL): array
    {
        $record = ChatOtpVerification::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->orderByDesc('id')
            ->first();

        if (!$record) {
            return ['verified' => false, 'reason' => 'none_sent'];
        }

        if ($record->isExpired()) {
            return ['verified' => false, 'reason' => 'expired'];
        }

        if ($record->attempts >= 5) {
            return ['verified' => false, 'reason' => 'too_many_attempts'];
        }

        if (!Hash::check(trim($code), $record->code_hash)) {
            $record->increment('attempts');
            return ['verified' => false, 'reason' => 'incorrect'];
        }

        $record->update(['consumed_at' => now()]);

        return ['verified' => true];
    }
}
