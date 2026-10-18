<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChatAccountService;
use App\Services\WhatsappNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * POST /api/retell/create-account
 *
 * Lets someone create a STAFFOO account straight from the WhatsApp/chat
 * assistant: "I want to create an account" -> agent collects name, email,
 * phone and account type -> this generates a random password, creates the
 * account exactly as the website would, and emails the credentials.
 *
 * Register this as a custom function on the chat agent. The prompt should
 * collect all four fields and the one-line explanation per type (see
 * ChatAccountService::explain) BEFORE calling this, so the person knows
 * what they're choosing.
 */
class RetellAccountController extends Controller
{
    public function __construct(private ChatAccountService $accounts)
    {
    }

    public function createAccount(Request $request)
    {
        $args = $request->input('args', []) + $request->all();

        $name        = trim((string) ($args['name'] ?? ''));
        $email       = trim((string) ($args['email'] ?? ''));
        $phone       = trim((string) ($args['phone'] ?? '')) ?: null;
        $accountType = strtolower(trim((string) ($args['account_type'] ?? '')));
        $companyName = trim((string) ($args['company_name'] ?? '')) ?: null;

        $missing = [];
        if ($name === '') $missing[] = 'name';
        if ($email === '') $missing[] = 'email';
        if ($accountType === '') $missing[] = 'account type (client, contractor or staff)';

        if ($missing !== []) {
            return response()->json([
                'result' => 'I still need ' . implode(' and ', $missing) . ' before I can create the account.',
                'data'   => ['success' => false, 'missing' => $missing],
            ]);
        }

        try {
            $result = $this->accounts->create($name, $email, $phone, $accountType, ['company_name' => $companyName]);
        } catch (Throwable $e) {
            Log::error('[Agent] create-account failed', ['error' => $e->getMessage()]);

            return response()->json([
                'result' => 'Something went wrong on our side creating that account. I\'ll pass your details to the team.',
                'data'   => ['success' => false],
            ]);
        }

        if (!$result['success']) {
            return response()->json(['result' => $result['message'], 'data' => ['success' => false]]);
        }

        if ($phone) {
            WhatsappNotificationService::fire('account.created', [$phone], [
                'name'         => $name,
                'email'        => $email,
                'account_type' => $accountType,
            ]);
        }

        return response()->json([
            'result' => $result['message'],
            'data'   => ['success' => true, 'user_id' => $result['user']->id ?? null],
        ]);
    }
}
