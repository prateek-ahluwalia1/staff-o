<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
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
        $config = DB::table('configs')->first();

        if (!empty($config->vsure_token) && !empty($config->vsure_token_expires_at)) {
            if (now()->lt($config->vsure_token_expires_at)) {
                Log::info('VSure: Using token from DB', ['expires_at' => $config->vsure_token_expires_at]);
                return $config->vsure_token;
            }
            Log::info('VSure: Token expired, requesting new one');
        }

        Log::info('VSure: Requesting new access token');

        $response = Http::withHeaders([
            'Accept'       => 'application/json',
            'Content-Type' => 'application/json'
        ])->post($this->authUrl . '/oauth/token', [
            'client_id'     => config('services.vsure.client_id'),
            'client_secret' => config('services.vsure.client_secret'),
            'audience'      => config('services.vsure.audience'),
            'grant_type'    => 'client_credentials',
            'scope'         => config('services.vsure.scope'),
        ]);

        if (!$response->successful()) {
            Log::error('VSure Token Error', [
                'status' => $response->status(),
                'body'   => $response->body()
            ]);
            return null;
        }

        $token     = $response->json()['access_token'] ?? null;
        $expiresIn = $response->json()['expires_in']   ?? 86400;

        if ($token) {
            $expiresAt = now()->addSeconds($expiresIn - 300);

                DB::table('configs')->updateOrInsert(
                ['id' => 1],
                [
                    'vsure_token'            => $token,
                    'vsure_token_expires_at' => $expiresAt,
                    'updated_at'             => now(),
                ]
            );

            Log::info('VSure: Token saved to DB', [
                'expires_in' => $expiresIn,
                'expires_at' => $expiresAt
            ]);
        }

        return $token;
    }

    public function clearToken()
    {
        DB::table('configs')->where('id', 1)->update([
            'vsure_token'            => null,
            'vsure_token_expires_at' => null,
            'updated_at'             => now(),
        ]);
        Log::info('VSure: Token cleared from DB');
    }

    public function createVisaCheck($data)
    {
        $token = $this->getAccessToken();
        if (!$token) {
            return ['error' => 'Token not generated'];
        }

        //for testing return token here

        $response = Http::withToken($token)
        ->withHeaders([
            'Version' => '2024-03-05',
            'Content-Type' => 'application/json'
        ])
        ->post($this->apiUrl . '/visa-checks', $data);
        
        if ($response->successful()) {
            $responseData = $response->json();
            
            $id = $responseData['data']['id'] ?? null;
            
            if ($id) {
                return $this->pollVisaResult($id);
            }

            return $responseData;
        }
    }

    public function getVisaResult($id)
    {
        $token = $this->getAccessToken();
        if (!$token) return ['error' => 'Token not generated'];

        $response = Http::withToken($token)
            ->withHeaders(['Version' => '2024-03-05'])
            ->get($this->apiUrl . "/visa-checks/{$id}");

        if ($response->status() === 401) {
            Log::warning('VSure: 401 received, clearing token and retrying');
            $this->clearToken();
            $token    = $this->getAccessToken();
            $response = Http::withToken($token)
                ->withHeaders(['Version' => '2024-03-05'])
                ->get($this->apiUrl . "/visa-checks/{$id}");
        }

        return [
            'status' => $response->status(),
            'body'   => $response->body(),
            'json'   => $response->json()
        ];
    }

    public function pollVisaResult($id, $maxAttempts = 5, $intervalSeconds = 4)
    {
        $response = null;

        for ($i = 0; $i < $maxAttempts; $i++) {
            $response = $this->getVisaResult($id);
            $status = $response['json']['data']['status'] ?? null;

            Log::info("VSure Poll Attempt {$i}", [
                'id' => $id,
                'status' => $status
            ]);

            if (in_array($status, ['completed', 'failed'])) {
                return $response;
            }

            sleep($intervalSeconds);
        }

        return $response;
    }
}