<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class YeastarService
{
    protected string $baseUrl;
    protected string $clientId;
    protected string $clientSecret;
    protected string $version;

    protected array $defaultHeaders = [
        'Content-Type' => 'application/json',
        'User-Agent'   => 'OpenAPI',
    ];

    public function __construct()
    {
        $this->baseUrl      = config('yeastar.base_url');
        $this->clientId     = config('yeastar.client_id');
        $this->clientSecret = config('yeastar.client_secret');
        $this->version      = config('yeastar.api_version', 'v1.0');
    }

    // ─── Database-Backed Token Management (Thread Safe) ──────────────

    public function getAccessToken(): string
    {
        // Use a DB transaction with lockForUpdate to prevent race conditions across requests
        return DB::transaction(function () {
            // Lock the config row while checking token validity
            $config = DB::table('configs')
                ->where('id', 1) // Adjust 'id' or query key based on your configs table structure
                ->lockForUpdate()
                ->first();

            // Check if token exists and has NOT expired (with a 2-minute safety margin)
            if ($config && !empty($config->yeastar_token) && !empty($config->yeastar_token_expires_at)) {
                $expiresAt = \Carbon\Carbon::parse($config->yeastar_token_expires_at);
                
                if (now()->addMinutes(2)->lt($expiresAt)) {
                    return $config->yeastar_token;
                }
            }

            // Token is missing or expired — fetch a fresh one
            $refreshToken = $config->yeastar_refresh_token ?? null;
            return $this->refreshOrFetchToken($refreshToken);
        });
    }

    protected function refreshOrFetchToken(?string $refreshToken = null): string
    {
        // Try refreshing if refresh_token exists
        if ($refreshToken) {
            try {
                $response = Http::withoutVerifying()
                    ->withHeaders($this->defaultHeaders)
                    ->post(
                        "{$this->baseUrl}/openapi/{$this->version}/refresh_token",
                        ['refresh_token' => $refreshToken]
                    );

                $json = $response->json();

                if (!empty($json['access_token']) && ($json['errcode'] ?? -1) === 0) {
                    $this->saveTokenToDb($json['access_token'], $json['refresh_token'] ?? $refreshToken);
                    return $json['access_token'];
                }
            } catch (Exception $e) {
                Log::warning('Yeastar refresh failed, falling back to fresh token: ' . $e->getMessage());
            }
        }

        // Fallback: Fetch completely new token via client_id & client_secret
        return $this->fetchFreshToken();
    }

    protected function fetchFreshToken(): string
    {
        $response = Http::withoutVerifying()
            ->withHeaders($this->defaultHeaders)
            ->post(
                "{$this->baseUrl}/openapi/{$this->version}/get_token",
                [
                    'username' => $this->clientId,
                    'password' => $this->clientSecret,
                ]
            );

        $json = $response->json();

        Log::info('Yeastar fetchFreshToken response', $json ?? []);

        if (empty($json['access_token']) || ($json['errcode'] ?? -1) !== 0) {
            throw new Exception('Yeastar auth failed: ' . json_encode($json));
        }

        $this->saveTokenToDb($json['access_token'], $json['refresh_token'] ?? null);

        return $json['access_token'];
    }

    protected function saveTokenToDb(string $accessToken, ?string $refreshToken = null): void
    {
        // Yeastar tokens last 30 minutes (1800 seconds). Set expiration to 28 mins for safety.
        DB::table('configs')->where('id', 1)->update([
            'yeastar_token'            => $accessToken,
            'yeastar_refresh_token'    => $refreshToken,
            'yeastar_token_expires_at' => now()->addMinutes(28),
            'updated_at'               => now(),
        ]);
    }

    // ─── Core HTTP Helper ─────────────────────────────────────────────

    protected function api(string $method, string $endpoint, array $payload = []): array
    {
        $token    = $this->getAccessToken();
        $response = $this->makeRequest($method, $endpoint, $payload, $token);
        $json     = $response->json();

        // Token expired error (10004) from Yeastar
        if (($json['errcode'] ?? 0) === 10004) {
            Log::warning("Yeastar token expired on [{$endpoint}], clearing DB token...");
            
            // Invalidate current DB token timestamp to force re-auth
            DB::table('configs')->where('id', 1)->update([
                'yeastar_token_expires_at' => now()->subMinute(),
            ]);

            $token    = $this->getAccessToken(); // Will automatically trigger refresh inside transaction
            $response = $this->makeRequest($method, $endpoint, $payload, $token);
            $json     = $response->json();
        }

        if (($json['errcode'] ?? 0) !== 0) {
            Log::error("Yeastar API error [{$endpoint}]", $json ?? []);
            throw new Exception("Yeastar [{$endpoint}] errcode {$json['errcode']}: " . ($json['errmsg'] ?? 'unknown'));
        }

        return $json;
    }

    protected function makeRequest(string $method, string $endpoint, array $payload, string $token)
    {
        $url = "{$this->baseUrl}/openapi/{$this->version}/{$endpoint}?access_token={$token}";

        return Http::withoutVerifying()
            ->withHeaders($this->defaultHeaders)
            ->{$method}($url, $payload);
    }

    // ─── Send SMS Methods ─────────────────────────────────────────────

    public function sendSms(string $toPhone, string $message): bool
    {
        try {
            $omnichannelId = config('yeastar.sms_omnichannel_id', 1);
            $senderId      = config('yeastar.sms_sender_id', 1);
            $assignToType  = config('yeastar.sms_assign_to_type', 'extension');
            $assignToId    = config('yeastar.sms_assign_to_id', 3);

            $normalizedPhone = $this->normalizeToE164($toPhone);

            $payload = [
                'name'           => 'AutoSMS-' . now()->timestamp . '-' . rand(100, 999),
                'channel_type'   => 'sms',
                'omnichannel_id' => (int) $omnichannelId,
                'sender'         => (int) $senderId,
                'recipient_type' => 'input',
                'number_list'    => [
                    ['number' => $normalizedPhone],
                ],
                'content_type'   => 'text',
                'content'        => $message,
                'send_type'      => 'immediately',
                'send_mode'      => 'auto', // Avoids session exhaustion
            ];

            if (!empty($assignToId)) {
                $payload['assign_to_type'] = $assignToType;
                $payload['assign_to_id']   = (int) $assignToId;
            }

            $result = $this->api('post', 'message_campaign/create', $payload);

            Log::info('Yeastar SMS sent', [
                'phone'  => $normalizedPhone,
                'result' => $result,
            ]);

            return true;

        } catch (Exception $e) {
            Log::error('Yeastar SMS send failed: ' . $e->getMessage());
            return false;
        }
    }

    private function normalizeToE164(string $phone, string $defaultCountryCode = '61'): string
    {
        $clean = preg_replace('/[\s\-\(\)]/', '', $phone);

        if (str_starts_with($clean, '+')) {
            return $clean;
        }

        if (str_starts_with($clean, '0')) {
            return '+' . $defaultCountryCode . substr($clean, 1);
        }

        return '+' . $defaultCountryCode . $clean;
    }
}