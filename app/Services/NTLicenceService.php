<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use DOMDocument;
use DOMXPath;

class NTLicenceService
{
    private const BASE_URL = 'https://licensingnt.nt.gov.au/PublicRegister/PublicRegister/LicenceSearch.aspx';

    public function searchByLicenceNumber(string $licenceNumber): array
    {
        // Step 1: GET page to grab dynamic tokens
        $getResponse = Http::withHeaders([
            'User-Agent'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept'          => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language' => 'en-AU,en;q=0.9',
        ])->get(self::BASE_URL);

        if (!$getResponse->successful()) {
            throw new \Exception('Failed to load page: ' . $getResponse->status());
        }

        // Step 2: Extract tokens using DOMDocument
        $tokens = $this->extractTokens($getResponse->body());

        // Step 3: POST with licence number
        $postResponse = Http::withHeaders([
            'User-Agent'   => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept'       => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer'      => self::BASE_URL,
            'Content-Type' => 'application/x-www-form-urlencoded',
        ])->asForm()->post(self::BASE_URL, [
            '__CurrentFormGroupId'   => $tokens['__CurrentFormGroupId'],
            '__CurrentFormId'        => $tokens['__CurrentFormId'],
            '__EVENTTARGET'          => '',
            '__EVENTARGUMENT'        => '',
            '__VIEWSTATE'            => $tokens['__VIEWSTATE'],
            '__VIEWSTATEGENERATOR'   => $tokens['__VIEWSTATEGENERATOR'],
            '__SCROLLPOSITIONX'      => '0',
            '__SCROLLPOSITIONY'      => '186',
            '__RequestVerificationToken' => $tokens['__RequestVerificationToken'],

            'ctl00$searchpage$SearchCriteriaBox$ctl00$Licencenumber'         => $licenceNumber,
            'ctl00$searchpage$SearchCriteriaBox$ctl00$Licencescheme'         => '',
            'ctl00$searchpage$SearchCriteriaBox$ctl00$Businessnameearchtype' => '2',
            'ctl00$searchpage$SearchCriteriaBox$ctl00$Businessname'          => '',
            'ctl00$searchpage$SearchCriteriaBox$ctl00$LicenseeSearchType'    => '2',
            'ctl00$searchpage$SearchCriteriaBox$ctl00$Licenseename'          => '',
            'ctl00$searchpage$SearchCriteriaBox$ctl00$Active'                => 'on',
            'ctl00$searchpage$SearchCriteriaBox$ctl00$Suburb'                => '',
            'ctl00$searchpage$SearchCriteriaBox$ctl00$SearchButton'          => 'Search',
            'ctl00$searchpage$ResultBox$ResultGridSortExpression'            => '',
            'ctl00$searchpage$ResultBox$ResultGridSortDirection'             => '',
        ]);

        if (!$postResponse->successful()) {
            throw new \Exception('Search failed: ' . $postResponse->status());
        }

        return $this->parseResults($postResponse->body());
    }

    private function extractTokens(string $html): array
    {
        $dom = new DOMDocument();

        // Suppress warnings from messy HTML
        libxml_use_internal_errors(true);
        $dom->loadHTML($html);
        libxml_clear_errors();

        $xpath = new DOMXPath($dom);

        $getValue = function (string $name) use ($xpath): string {
            $node = $xpath->query("//input[@name='$name']")->item(0);
            return $node ? $node->getAttribute('value') : '';
        };

        return [
            '__CurrentFormGroupId'       => $getValue('__CurrentFormGroupId'),
            '__CurrentFormId'            => $getValue('__CurrentFormId'),
            '__VIEWSTATE'                => $getValue('__VIEWSTATE'),
            '__VIEWSTATEGENERATOR'       => $getValue('__VIEWSTATEGENERATOR'),
            '__RequestVerificationToken' => $getValue('__RequestVerificationToken'),
        ];
    }

    private function parseResults(string $html): array
    {
        $dom = new DOMDocument();

        libxml_use_internal_errors(true);
        $dom->loadHTML($html);
        libxml_clear_errors();

        $xpath   = new DOMXPath($dom);
        $results = [];

        // Target the results table rows (skip the header row)
        $rows = $xpath->query("//table[contains(@id,'ResultGrid')]//tr[position()>1]");

        foreach ($rows as $row) {
            $cells = $xpath->query('td', $row);
            $rowData = [];

            foreach ($cells as $cell) {
                $rowData[] = trim($cell->textContent);
            }

            if (!empty(array_filter($rowData))) {
                $results[] = $rowData;
            }
        }

        return $results;
    }
}