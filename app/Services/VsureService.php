<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VsureService
{
    protected $authUrl;
    protected $apiUrl;

    public function __construct()
    {
        $this->authUrl = config('services.vsure.auth_url');
        $this->apiUrl = config('services.vsure.api_url');
    }

    public function getAccessToken()
    {
        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'Content-Type' => 'application/json'
        ])->post($this->authUrl . '/oauth/token', [
            'client_id' => config('services.vsure.client_id'),
            'client_secret' => config('services.vsure.client_secret'),
            'audience' => config('services.vsure.audience'),
            'grant_type' => 'client_credentials',
            'scope' => config('services.vsure.scope'),  // Note: 'scope' not 'scopes'
        ]);

        if (!$response->successful()) {
            Log::error('VSure Token Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return null;
        }

        return $response->json()['access_token'] ?? null;
    }

    public function createVisaCheck($data)
    {
        $token = $this->getAccessToken();
        if (!$token) {
            return ['error' => 'Token not generated'];
        }

        $response = Http::withToken($token)
            ->withHeaders([
                'Version' => '2024-03-05',
                'Content-Type' => 'application/json'
            ])
            ->post($this->apiUrl . '/visa-checks', $data);  // Note: /visa-checks not /v2/visa-checks

        return [
            'status' => $response->status(),
            'body' => $response->body(),
            'json' => $response->json()
        ];
    }

    public function appgetVisaResult($id)
    {
        $token = $this->getAccessToken();
        if (!$token) {
            return ['error' => 'Token not generated'];
        }

        $response = Http::withToken($token)
            ->withHeaders(['Version' => '2024-03-05'])
            ->get($this->apiUrl . "/visa-checks/$id");

        return [
            'status' => $response->status(),
            'body' => $response->body(),
            'json' => $response->json()
        ];
    }
}