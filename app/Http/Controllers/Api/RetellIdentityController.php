<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesRetellUser;
use App\Http\Controllers\Controller;
use App\Models\WhatsappChat;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Two new Retell custom functions for the identity-verification gate:
 *
 *   POST /api/retell/verify-identity-request  -> emails a 6-digit code
 *   POST /api/retell/verify-identity-confirm   -> checks the code the
 *                                                 caller types back
 *
 * Register both on the WhatsApp chat agent. The prompt should call
 * verify-identity-request the moment it needs to answer something detailed
 * (specific shifts, pay/payslip specifics) and the lookup says
 * requires_otp = true, then call verify-identity-confirm once the caller
 * replies with the code, before calling my_shifts / pay_status again.
 */
class RetellIdentityController extends Controller
{
    use ResolvesRetellUser;

    public function __construct(private OtpService $otp)
    {
    }

    public function requestOtp(Request $request)
    {
        $user = $this->resolveUserFromRequest($request);

        if (!$user) {
            return response()->json([
                'result' => 'I\'ll need the email or STAFO number on the account before I can send a verification code — what is it?',
                'data'   => ['sent' => false],
            ]);
        }

        if (empty($user->email)) {
            return response()->json([
                'result' => 'There\'s no email on file for that account, so I can\'t send a code. I\'ll pass this to the team.',
                'data'   => ['sent' => false],
            ]);
        }

        $phone  = $this->callerPhone($request);
        $result = $this->otp->send($user, $phone);

        if (!$result['sent']) {
            $message = match ($result['reason'] ?? null) {
                'rate_limited' => 'A code was already sent in the last minute — give it a moment and check your inbox.',
                default        => 'I couldn\'t get a code sent just now. I\'ll pass this to the team instead.',
            };

            return response()->json(['result' => $message, 'data' => $result]);
        }

        Log::info('[Agent] OTP requested', ['user_id' => $user->id]);

        return response()->json([
            'result' => 'For your security I\'ve emailed a 6-digit code to your registered email. What\'s the code?',
            'data'   => ['sent' => true, 'user_id' => $user->id],
        ]);
    }

    public function confirmOtp(Request $request)
    {
        $user = $this->resolveUserFromRequest($request);

        if (!$user) {
            return response()->json([
                'result' => 'I\'ve lost track of which account that code is for — can you give me the email again?',
                'data'   => ['verified' => false],
            ]);
        }

        $args  = $request->input('args', []) + $request->all();
        $code  = trim((string) ($args['code'] ?? ''));
        $phone = $this->callerPhone($request);

        if ($code === '') {
            return response()->json([
                'result' => 'What\'s the 6-digit code from the email?',
                'data'   => ['verified' => false],
            ]);
        }

        $result = $this->otp->verify($user, $phone, $code);

        if (!$result['verified']) {
            $message = match ($result['reason'] ?? null) {
                'expired'            => 'That code has expired. I\'ll send you a fresh one — just ask again.',
                'too_many_attempts'  => 'That code has had too many attempts. I\'ll send a fresh one — just ask again.',
                'none_sent'          => 'I don\'t have a code on file for you yet — let me send one first.',
                default              => 'That code doesn\'t match. Can you double check and send it again?',
            };

            return response()->json(['result' => $message, 'data' => $result]);
        }

        if ($phone !== '') {
            $chat = WhatsappChat::where('phone', $phone)->first();
            if ($chat) {
                $chat->update(['otp_verified_at' => now(), 'otp_verified_user_id' => $user->id]);
            }
        }

        Log::info('[Agent] OTP verified', ['user_id' => $user->id]);

        return response()->json([
            'result' => 'Verified — thanks. Go ahead and ask what you need.',
            'data'   => ['verified' => true],
        ]);
    }
}
