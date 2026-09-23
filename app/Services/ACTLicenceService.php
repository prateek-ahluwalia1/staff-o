<?php

namespace App\Services;

use DOMDocument;
use DOMXPath;
use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;

class ACTLicenceService
{
    private const BASE_URL   = 'https://services.accesscanberra.act.gov.au';
    private const PAGE_URL   = '/s/public-registers/occupational-register';
    private const AURA_URL   = '/s/sfsites/aura';
    private const REGISTER_ID = 'security-employee';

    public function searchByLicenceId(string $licenceId): array
    {
        $jar    = new CookieJar();
        $client = new Client([
            'cookies'         => $jar,
            'base_uri'        => self::BASE_URL,
            'verify'          => false,
            'allow_redirects' => true,
            'headers'         => [
                'User-Agent'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept'          => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language' => 'en-AU,en;q=0.9',
            ],
        ]);

        // Step 1: GET page to establish session + extract Aura context & token
        $pageResponse = $client->get(self::PAGE_URL, [
            'query' => [
                'registerid' => self::REGISTER_ID,
                'licenceID'  => $licenceId,
            ],
        ]);

        $html    = (string) $pageResponse->getBody();
        $context = $this->extractAuraContext($html);
        $token   = $this->extractAuraToken($html);

        if (!$context || !$token) {
            throw new \Exception('Could not extract Aura context/token from page.');
        }

        // Step 2: Call Aura API (OmniStudio Integration Procedure)
        // ⚠️  Replace the descriptor/params below with what you see in your Network tab
        $action = [
            'id'                => '1;a',
            'descriptor'        => 'apex://OmniscriptBaseCmpController/ACTION$invokeIntegrationProcedure',
            'callingDescriptor' => 'UNKNOWN',
            'params'            => [
                'input'       => [
                    'registerId' => self::REGISTER_ID,
                    'licenceId'  => $licenceId,
                ],
                'sClassName'  => 'OmniscriptBaseCmpController',   // check network tab
                'sMethodName' => 'invokeIntegrationProcedure',     // check network tab
                'cacheable'   => false,
                'isContinuation' => false,
            ],
        ];

        $auraResponse = $client->post(self::AURA_URL . '?r=4&ui-communities-components-aura-components-forceCommunity-richText.RichText.getSalesforceURL=1', [
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Accept'       => 'application/json',
                'Referer'      => self::BASE_URL . self::PAGE_URL . '?registerid=' . self::REGISTER_ID . '&licenceID=' . $licenceId,
                'Origin'       => self::BASE_URL,
                'X-Sfdc-Page-Scope-Id' => uniqid(),
                'X-Sfdc-Request-Id'    => uniqid() . '000',
            ],
            'form_params' => [
                'message'      => json_encode(['actions' => [$action]]),
                'aura.context' => $context,
                'aura.token'   => $token,
            ],
        ]);

        $json = json_decode((string) $auraResponse->getBody(), true);

        return $this->parseAuraResponse($json);
    }

    private function extractAuraContext(string $html): ?string
    {
        // The context is embedded in the inline JS — extract it
        if (preg_match('/"context"\s*:\s*(\{[^;]+\})\s*,\s*"componentUids"/', $html, $m)) {
            return $m[1];
        }

        // Fallback: build minimal context from what the page tells us
        if (preg_match('/"fwuid"\s*:\s*"([^"]+)"/', $html, $fw)
            && preg_match('/"loaded"\s*:\s*(\{[^}]+\})/', $html, $ld)) {
            return json_encode([
                'mode'    => 'PROD',
                'app'     => 'siteforce:communityApp',
                'fwuid'   => $fw[1],
                'loaded'  => json_decode($ld[1], true),
                'dns'     => 'c',
                'ls'      => 1,
            ]);
        }

        return null;
    }

    private function extractAuraToken(string $html): ?string
    {
        // Token is usually set after the cookie is read or directly in the JS
        // Check cookies first (Salesforce sets it as a cookie then reads it in JS)
        if (preg_match('/"token"\s*:\s*"([^"]+)"/', $html, $m)) {
            return $m[1];
        }

        // It may be in a cookie named based on "eikoocnekot" config
        return 'undefined'; // Salesforce guest sites sometimes accept this
    }

    private function parseAuraResponse(array $json): array
    {
        $result = [];

        if (empty($json['actions'])) {
            throw new \Exception('No actions in Aura response: ' . json_encode($json));
        }

        foreach ($json['actions'] as $action) {
            if (($action['state'] ?? '') === 'SUCCESS') {
                $result = $action['returnValue'] ?? [];
                break;
            }

            if (($action['state'] ?? '') === 'ERROR') {
                throw new \Exception('Aura error: ' . json_encode($action['error'] ?? []));
            }
        }

        return $result;
    }
}