<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Exception;

class YeastarService
{
    protected string $baseUrl;
    protected string $clientId;
    protected string $clientSecret;
    protected string $version;

    // Required by Yeastar Cloud API on EVERY request
    protected array $defaultHeaders = [
        'Content-Type' => 'application/json',
        'User-Agent'   => 'OpenAPI',   // ← MANDATORY or routes return 10001
    ];

    public function __construct()
    {
        $this->baseUrl      = config('yeastar.base_url');
        $this->clientId     = config('yeastar.client_id');
        $this->clientSecret = config('yeastar.client_secret');
        $this->version      = config('yeastar.api_version'); // v1.0
    }

    // ─── Auth ─────────────────────────────────────────────────────────

    public function getAccessToken(): string
    {
        return Cache::remember('yeastar_access_token', 1740, function () {
            return $this->fetchFreshToken();
        });
    }

    protected function fetchFreshToken(): string
    {
        $response = Http::withoutVerifying()
            ->withHeaders($this->defaultHeaders)   // ← User-Agent required here too
            ->post(
                "{$this->baseUrl}/openapi/{$this->version}/get_token",
                [
                    'username' => $this->clientId,      // Client ID from PBX portal
                    'password' => $this->clientSecret,  // Client Secret from PBX portal
                ]
            );

        $json = $response->json();

        Log::info('Yeastar fetchFreshToken response', $json);

        if (empty($json['access_token']) || ($json['errcode'] ?? -1) !== 0) {
            throw new Exception('Yeastar auth failed: ' . json_encode($json));
        }

        if (!empty($json['refresh_token'])) {
            Cache::put('yeastar_refresh_token', $json['refresh_token'], 85000);
        }

        return $json['access_token'];
    }

    // ─── Refresh Token ────────────────────────────────────────────────

    public function refreshAccessToken(): string
    {
        $refreshToken = Cache::get('yeastar_refresh_token');

        if (!$refreshToken) {
            Cache::forget('yeastar_access_token');
            return $this->fetchFreshToken();
        }

        $response = Http::withoutVerifying()
            ->withHeaders($this->defaultHeaders)
            ->post(
                "{$this->baseUrl}/openapi/{$this->version}/refresh_token",
                ['refresh_token' => $refreshToken]
            );

        $json = $response->json();

        if (empty($json['access_token']) || ($json['errcode'] ?? -1) !== 0) {
            Log::warning('Yeastar refresh failed, doing full re-login', $json);
            Cache::forget('yeastar_refresh_token');
            Cache::forget('yeastar_access_token');
            return $this->fetchFreshToken();
        }

        Cache::put('yeastar_access_token', $json['access_token'], 1740);

        if (!empty($json['refresh_token'])) {
            Cache::put('yeastar_refresh_token', $json['refresh_token'], 85000);
        }

        return $json['access_token'];
    }

    // ─── Core HTTP Helper ─────────────────────────────────────────────

    protected function api(string $method, string $endpoint, array $payload = []): array
    {
        $token    = $this->getAccessToken();
        $response = $this->makeRequest($method, $endpoint, $payload, $token);
        $json     = $response->json();

        // Token expired — Yeastar always returns HTTP 200 with errcode 10004
        if (($json['errcode'] ?? 0) === 10004) {
            Log::warning("Yeastar token expired on [{$endpoint}], refreshing...");
            Cache::forget('yeastar_access_token');
            $token    = $this->refreshAccessToken();
            $response = $this->makeRequest($method, $endpoint, $payload, $token);
            $json     = $response->json();
        }

        if (($json['errcode'] ?? 0) !== 0) {
            Log::error("Yeastar API error [{$endpoint}]", $json);
            throw new Exception("Yeastar [{$endpoint}] errcode {$json['errcode']}: " . ($json['errmsg'] ?? 'unknown'));
        }

        return $json;
    }

    protected function makeRequest(string $method, string $endpoint, array $payload, string $token)
    {
        // ✅ Token goes in query string, NOT as Bearer header
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

    // ─── Send SMS OTP via Yeastar ─────────────────────────────────────

    public function sendSmsOtp(string $toPhone, string $otp): bool
    {
        $message = "Your STAFFOO phone verification OTP is: {$otp}.";

        return $this->sendSms($toPhone, $message);
    }

    // ─── Generic Send SMS (CORRECTED — uses real message_campaign/create) ───

    /**
     * Send a plain text SMS via the Omnichannel Messaging SMS channel.
     *
     * IMPORTANT: The real Yeastar P-Series Cloud Edition API does NOT have
     * "message/create_session" or "message/send_message" endpoints. SMS is
     * sent directly via a single call to "message_campaign/create", which
     * creates and immediately sends a one-off "campaign" to one or more
     * recipients through a configured Omnichannel SMS channel.
     *
     * Docs: https://help.yeastar.com/en/p-series-cloud-edition/developer-guide/add-a-message-campaign.html
     *
     * Required config (see config/yeastar.php):
     *   - yeastar.sms_omnichannel_id : the SMS channel's omnichannel_id
     *   - yeastar.sms_sender_id      : the sender ID tied to that channel
     *     (both found in PBX Admin > Omnichannel Messaging > Channels,
     *      see note below on where exactly to look)
     *
     * @param string $toPhone  E.164 format recommended, e.g. +61401001704
     * @param string $message
     * @return bool true on success, false on failure (never throws)
     */
    public function sendSms(string $toPhone, string $message): bool
    {
        try {
            // $omnichannelId = config('yeastar.sms_omnichannel_id');
            // $senderId      = config('yeastar.sms_sender_id');
            // $assignToType  = config('yeastar.sms_assign_to_type', 'extension');
            // $assignToId    = config('yeastar.sms_assign_to_id');

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
                'name'           => 'AutoSMS-' . now()->timestamp, // unique campaign name, required
                'channel_type'   => 'sms',
                'omnichannel_id' => (int) $omnichannelId,
                'sender'         => (int) $senderId,
                'recipient_type' => 'input',
                'number_list'    => [
                    ['number' => $normalizedPhone],
                ],
                'content_type'   => 'text',
                'content'        => $message,
                'send_type'      => 'immediately',  // valid values: immediately | schedule | draft
                'send_mode'      => 'new_session',
                'assign_to_type' => $assignToType,  // required when send_mode = new_session
                'assign_to_id'   => (int) $assignToId, // required when send_mode = new_session
            ]);

            Log::info('Yeastar SMS sent', [
                'phone'  => $normalizedPhone,
                'result' => $result,
            ]);

            return true;

        } catch (Exception $e) {
            Log::error('Yeastar SMS send failed: ' . $e->getMessage(), [
                'phone' => $toPhone,
            ]);
            return false;
        }
    }

    /**
     * Normalize a local Australian number (e.g. "0400 000 000") into
     * E.164 format (e.g. "+61400000000") as required by Yeastar's
     * "Number" field validation.
     *
     * Adjust the default country code if you operate outside Australia.
     */
    private function normalizeToE164(string $phone, string $defaultCountryCode = '61'): string
    {
        // Strip spaces, dashes, parentheses
        $clean = preg_replace('/[\s\-\(\)]/', '', $phone);

        // Already in E.164 format
        if (str_starts_with($clean, '+')) {
            return $clean;
        }

        // Local format starting with 0 (e.g. 0400000000) → strip leading 0, prepend country code
        if (str_starts_with($clean, '0')) {
            return '+' . $defaultCountryCode . substr($clean, 1);
        }

        // No leading 0 and no +, assume country code is missing — prepend it
        return '+' . $defaultCountryCode . $clean;
    }

    /**
     * Send SMS to multiple recipients in ONE campaign call — more efficient
     * than calling sendSms() in a loop if you're notifying many guards at
     * once with the same message (Yeastar supports a number_list array).
     *
     * @param array  $phoneNumbers  e.g. ['+61401001704', '+61401001705']
     * @param string $message
     */
    public function sendBulkSms(array $phoneNumbers, string $message): bool
    {
        try {
            // $omnichannelId = config('yeastar.sms_omnichannel_id');
            // $senderId      = config('yeastar.sms_sender_id');
            // $assignToType  = config('yeastar.sms_assign_to_type', 'extension');
            // $assignToId    = config('yeastar.sms_assign_to_id');

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
}