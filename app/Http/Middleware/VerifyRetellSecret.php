<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

/**
 * These endpoints hand out account details to whoever asks, so they are not
 * public. Retell sends a shared secret on every custom-function call; anything
 * without it gets 401 and is logged.
 *
 * Without this, anyone who finds the URL can type an email address and learn
 * whether that person has a STAFFOO account, what documents they hold and when
 * they last worked.
 */
class VerifyRetellSecret
{
    public function handle(Request $request, Closure $next)
    {
        $expected = config('services.retell.function_secret');

        if (empty($expected)) {
            Log::error('[Agent] RETELL_FUNCTION_SECRET is not set — refusing the request');
            return response()->json(['result' => 'That lookup is unavailable right now.'], 503);
        }

        $provided = $request->header('X-Retell-Secret')
            ?? $request->bearerToken()
            ?? '';

        if (!hash_equals($expected, (string) $provided)) {
            Log::warning('[Agent] rejected call with bad or missing secret', [
                'ip'   => $request->ip(),
                'path' => $request->path(),
            ]);

            return response()->json(['result' => 'That lookup is unavailable right now.'], 401);
        }

        // A valid secret still should not allow bulk enumeration of accounts.
        $key = 'agent-lookup:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 120)) {
            Log::warning('[Agent] rate limited', ['ip' => $request->ip()]);
            return response()->json(['result' => 'That lookup is unavailable right now.'], 429);
        }
        RateLimiter::hit($key, 60);

        return $next($request);
    }
}
