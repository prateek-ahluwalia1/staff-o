<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Shared "find the account from an email, STAFO id, or caller phone number"
 * logic, factored out of AgentLookupController so the new identity/account
 * controllers can use the exact same resolution rules without duplicating
 * (or drifting from) them.
 */
trait ResolvesRetellUser
{
    protected function resolveUserFromRequest(Request $request): ?User
    {
        $args = $request->input('args', []) + $request->all();

        $identifier = trim((string) ($args['email'] ?? $args['identifier'] ?? $args['staffo_id'] ?? ''));

        $query = User::query();

        if ($identifier !== '') {
            if (Str::contains($identifier, '@')) {
                $email = str_replace(' ', '+', $identifier);

                return $query->whereRaw('LOWER(email) = ?', [strtolower($email)])->first();
            }

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
            return $this->findByPhoneNumber($phone);
        }

        return null;
    }

    protected function findByPhoneNumber(string $phone): ?User
    {
        $digits = preg_replace('/\D/', '', $phone);
        $tail   = substr($digits, -9);

        if (strlen($tail) < 8) {
            return null;
        }

        return User::whereRaw("REPLACE(REPLACE(REPLACE(phone,' ',''),'-',''),'+','') LIKE ?", ['%' . $tail])->first();
    }

    /**
     * The WhatsApp number of the person currently chatting, the same way
     * WhatsappWebhookController derives it — from the channel metadata the
     * Retell call carries, or the explicit `phone` arg on a direct test call.
     */
    protected function callerPhone(Request $request): string
    {
        $args = $request->input('args', []) + $request->all();

        $phone = $args['phone']
            ?? $request->input('call.metadata.phone')
            ?? $request->input('metadata.phone')
            ?? $request->input('call.from_number')
            ?? '';

        return trim((string) $phone);
    }
}
