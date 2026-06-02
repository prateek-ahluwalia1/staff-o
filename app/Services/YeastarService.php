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
            throw new Exception("Yeastar [{$endpoint}] errcode {$json['errcode']}: {$json['errmsg']}");
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
}