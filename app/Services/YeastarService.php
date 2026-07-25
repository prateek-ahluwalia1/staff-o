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
        return DB::transaction(function () {
            $config = DB::table('configs')
                ->where('id', 1)
                ->lockForUpdate()
                ->first();

            if ($config && !empty($config->yeastar_token) && !empty($config->yeastar_token_expires_at)) {
                $expiresAt = \Carbon\Carbon::parse($config->yeastar_token_expires_at);
                
                if (now()->addMinutes(2)->lt($expiresAt)) {
                    return $config->yeastar_token;
                }
            }

            $refreshToken = $config->yeastar_refresh_token ?? null;
            return $this->refreshOrFetchToken($refreshToken);
        });
    }

    protected function refreshOrFetchToken(?string $refreshToken = null): string
    {
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

        if (($json['errcode'] ?? 0) === 10004) {
            Log::warning("Yeastar token expired on [{$endpoint}], clearing DB token...");
            
            DB::table('configs')->where('id', 1)->update([
                'yeastar_token_expires_at' => now()->subMinute(),
            ]);

            $token    = $this->getAccessToken();
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

    // ─── Call Methods ─────────────────────────────────────────────────

    public function clickToCall(string $caller, string $callee, int $autoanswer = 1): array
    {
        return $this->api('post', 'call/dial', [
            'caller'     => $caller,
            'callee'     => $callee,
            'autoanswer' => $autoanswer,
        ]);
    }

    public function getActiveCalls(): array
    {
        return $this->api('post', 'call/query_active_call', []);
    }

    public function hangupCall(string $callId): array
    {
        return $this->api('post', 'call/hangup', ['call_id' => $callId]);
    }

    public function transferCall(string $callId, string $transferTo): array
    {
        return $this->api('post', 'call/transfer', [
            'call_id'     => $callId,
            'transfer_to' => $transferTo,
        ]);
    }

    public function holdCall(string $callId): array
    {
        return $this->api('post', 'call/hold', ['call_id' => $callId]);
    }

    public function unholdCall(string $callId): array
    {
        return $this->api('post', 'call/unhold', ['call_id' => $callId]);
    }

    public function getExtensionStatus(string $extension): array
    {
        return $this->api('post', 'extension/query', ['extension' => $extension]);
    }

    public function getCallRecords(array $filters = []): array
    {
        return $this->api('post', 'cdr/get_cdr', array_merge([
            'page'      => 1,
            'page_size' => 20,
        ], $filters));
    }

    public function getPbxInfo(): array
    {
        return $this->api('post', 'pbx/get_system_info', []);
    }

    // ─── Send SMS Methods (Restored Original Payload) ─────────────────

    public function sendSmsOtp(string $toPhone, string $otp): bool
    {
        $message = "Your STAFFOO verification OTP is: {$otp}.";
        return $this->sendSms($toPhone, $message);
    }

    public function sendSms(string $toPhone, string $message): bool
    {
        try {
            $omnichannelId = 1;
            $senderId      = 1;
            $assignToType  = 'extension';
            $assignToId    = 3;

            if (empty($omnichannelId) || empty($senderId)) {
                throw new Exception('Yeastar sms_omnichannel_id or sms_sender_id not configured');
            }

            if (empty($assignToId)) {
                throw new Exception('Yeastar sms_assign_to_id not configured (required when send_mode=new_session)');
            }

            $normalizedPhone = $this->normalizeToE164($toPhone);

            $result = $this->api('post', 'message_campaign/create', [
                'name'           => 'AutoSMS-' . now()->timestamp,
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
                'send_mode'      => 'new_session',
                'assign_to_type' => $assignToType,
                'assign_to_id'   => (int) $assignToId,
            ]);

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

    public function sendBulkSms(array $phoneNumbers, string $message): bool
    {
        try {
            $omnichannelId = 1;
            $senderId      = 1;
            $assignToType  = 'extension';
            $assignToId    = 3;

            if (empty($omnichannelId) || empty($senderId)) {
                throw new Exception('Yeastar sms_omnichannel_id or sms_sender_id not configured');
            }

            if (empty($assignToId)) {
                throw new Exception('Yeastar sms_assign_to_id not configured (required when send_mode=new_session)');
            }

            if (empty($phoneNumbers)) {
                return false;
            }

            $numberList = array_map(
                fn($num) => ['number' => $this->normalizeToE164($num)],
                $phoneNumbers
            );

            $result = $this->api('post', 'message_campaign/create', [
                'name'           => 'AutoSMS-Bulk-' . now()->timestamp,
                'channel_type'   => 'sms',
                'omnichannel_id' => (int) $omnichannelId,
                'sender'         => (int) $senderId,
                'recipient_type' => 'input',
                'number_list'    => $numberList,
                'content_type'   => 'text',
                'content'        => $message,
                'send_type'      => 'immediately',
                'send_mode'      => 'new_session',
                'assign_to_type' => $assignToType,
                'assign_to_id'   => (int) $assignToId,
            ]);

            Log::info('Yeastar Bulk SMS sent', [
                'count'  => count($phoneNumbers),
                'result' => $result,
            ]);

            return true;

        } catch (Exception $e) {
            Log::error('Yeastar Bulk SMS send failed: ' . $e->getMessage(), [
                'count' => count($phoneNumbers),
            ]);
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