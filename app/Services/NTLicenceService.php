<?php

namespace App\Services;

use DOMDocument;
use DOMXPath;
use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;

class NTLicenceService
{
    private const BASE_URL  = 'https://licensingnt.nt.gov.au/PublicRegister/PublicRegister/LicenceSearch.aspx';
    private const HOST_URL  = 'https://licensingnt.nt.gov.au';

    public function searchByLicenceNumber(string $licenceNumber): array
    {
        $jar    = new CookieJar();
        $client = new Client([
            'cookies'         => $jar,
            'verify'          => false,
            'allow_redirects' => true,
            'headers'         => [
                'User-Agent'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept'          => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language' => 'en-AU,en;q=0.9',
            ],
        ]);

        // Step 1: GET search page
        $getResponse = $client->get(self::BASE_URL);
        $html        = (string) $getResponse->getBody();
        $tokens      = $this->extractTokens($html);

        // Step 2: POST search
        $postResponse = $client->post(self::BASE_URL, [
            'headers'     => ['Referer' => self::BASE_URL],
            'form_params' => [
                '__CurrentFormGroupId'       => $tokens['__CurrentFormGroupId'],
                '__CurrentFormId'            => $tokens['__CurrentFormId'],
                '__EVENTTARGET'              => '',
                '__EVENTARGUMENT'            => '',
                '__VIEWSTATE'                => $tokens['__VIEWSTATE'],
                '__VIEWSTATEGENERATOR'       => $tokens['__VIEWSTATEGENERATOR'],
                '__SCROLLPOSITIONX'          => '0',
                '__SCROLLPOSITIONY'          => '186',
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
            ],
        ]);

        $searchHtml = (string) $postResponse->getBody();

        // Step 3: Parse results + extract detail link
        $result = $this->parseSearchResults($searchHtml);

        if (empty($result)) {
            return [];
        }

        // Step 4: Trigger __doPostBack to get detail page
        if (!empty($result['postback_target'])) {

            // Re-extract tokens from the search results page (VIEWSTATE changed)
            $tokens2 = $this->extractTokens($searchHtml);

            $detailResponse = $client->post(self::BASE_URL, [
                'headers'     => ['Referer' => self::BASE_URL],
                'form_params' => [
                    '__CurrentFormGroupId'       => $tokens2['__CurrentFormGroupId'],
                    '__CurrentFormId'            => $tokens2['__CurrentFormId'],
                    '__EVENTTARGET'              => $result['postback_target'],  // <-- key part
                    '__EVENTARGUMENT'            => '',
                    '__VIEWSTATE'                => $tokens2['__VIEWSTATE'],
                    '__VIEWSTATEGENERATOR'       => $tokens2['__VIEWSTATEGENERATOR'],
                    '__SCROLLPOSITIONX'          => '0',
                    '__SCROLLPOSITIONY'          => '186',
                    '__RequestVerificationToken' => $tokens2['__RequestVerificationToken'],

                    // Keep the same search fields
                    'ctl00$searchpage$SearchCriteriaBox$ctl00$Licencenumber'         => $licenceNumber,
                    'ctl00$searchpage$SearchCriteriaBox$ctl00$Licencescheme'         => '',
                    'ctl00$searchpage$SearchCriteriaBox$ctl00$Businessnameearchtype' => '2',
                    'ctl00$searchpage$SearchCriteriaBox$ctl00$Businessname'          => '',
                    'ctl00$searchpage$SearchCriteriaBox$ctl00$LicenseeSearchType'    => '2',
                    'ctl00$searchpage$SearchCriteriaBox$ctl00$Licenseename'          => '',
                    'ctl00$searchpage$SearchCriteriaBox$ctl00$Active'                => 'on',
                    'ctl00$searchpage$SearchCriteriaBox$ctl00$Suburb'                => '',
                    'ctl00$searchpage$ResultBox$ResultGridSortExpression'            => '',
                    'ctl00$searchpage$ResultBox$ResultGridSortDirection'             => '',
                ],
            ]);

            $result['details'] = $this->parseDetailPage((string) $detailResponse->getBody());
        }

        unset($result['postback_target']);

        return $result;
    }

    private function parseSearchResults(string $html): array
    {
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($html);
        libxml_clear_errors();

        $xpath = new DOMXPath($dom);
        $rows  = $xpath->query("//table[contains(@id,'ResultGrid')]//tr[position()>1]");

        $results = [];

        foreach ($rows as $row) {
            $cells   = $xpath->query('td', $row);
            $rowData = [];

            foreach ($cells as $cell) {
                $rowData[] = trim($cell->textContent);
            }

            if (empty(array_filter($rowData))) continue;

            // Extract __doPostBack target from href="javascript:__doPostBack('TARGET','')
            $link           = $xpath->query('.//a', $row)->item(0);
            $href           = $link ? $link->getAttribute('href') : '';
            $postbackTarget = '';

            if (preg_match("/__doPostBack\('([^']+)'/", $href, $matches)) {
                $postbackTarget = $matches[1];
            }

            $results[] = [
                'licensee_name'   => $rowData[0] ?? null,
                'type'            => $rowData[1] ?? null,
                'licence_no'      => $rowData[2] ?? null,
                'suburb'          => $rowData[3] ?? null,
                'status'          => $rowData[4] ?? null,
                'postback_target' => $postbackTarget,
            ];
        }

        return $results[0] ?? [];
    }

    private function parseDetailPage(string $html): array
    {
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($html);
        libxml_clear_errors();

        $xpath = new DOMXPath($dom);

        $getText = function (string $label) use ($xpath): string {
            // Find the <td> that follows the <td> containing the label text
            $node = $xpath->query("//td[normalize-space(.)='$label']/following-sibling::td[1]")->item(0);
            return $node ? trim($node->textContent) : '';
        };

        // Parse the status table rows
        $statusRows  = $xpath->query("//table[contains(@id,'StatusGrid') or contains(@class,'status')]//tr[position()>1]");
        $statusList  = [];

        foreach ($statusRows as $row) {
            $cells = $xpath->query('td', $row);
            $cols  = [];
            foreach ($cells as $cell) {
                $cols[] = trim($cell->textContent);
            }
            if (!empty(array_filter($cols))) {
                $statusList[] = [
                    'status'      => $cols[0] ?? '',
                    'status_date' => $cols[1] ?? '',
                ];
            }
        }

        // Fallback: grab all tables and find status table
        if (empty($statusList)) {
            $allRows = $xpath->query("//table//tr");
            foreach ($allRows as $row) {
                $cells = $xpath->query('td', $row);
                $cols  = [];
                foreach ($cells as $cell) {
                    $cols[] = trim($cell->textContent);
                }
                if (count($cols) === 2 && !empty($cols[0]) && !empty($cols[1])) {
                    // Looks like a Status | Date row
                    if (preg_match('/\d{2}\/\d{2}\/\d{4}/', $cols[1])) {
                        $statusList[] = [
                            'status'      => $cols[0],
                            'status_date' => $cols[1],
                        ];
                    }
                }
            }
        }

        return [
            'licensee_name'  => $getText('Licensee Name'),
            'known_as'       => $getText('Known As'),
            'acn'            => $getText('ACN'),
            'abn'            => $getText('ABN'),
            'licence_number' => $getText('Licence Number'),
            'licence_type'   => $getText('Licence Type'),
            'date_granted'   => $getText('Date Granted'),
            'statuses'       => $statusList,
        ];
    }

    private function extractTokens(string $html): array
    {
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($html);
        libxml_clear_errors();

        $xpath    = new DOMXPath($dom);
        $getValue = fn($name) => $xpath->query("//input[@name='$name']")->item(0)?->getAttribute('value') ?? '';

        return [
            '__CurrentFormGroupId'       => $getValue('__CurrentFormGroupId'),
            '__CurrentFormId'            => $getValue('__CurrentFormId'),
            '__VIEWSTATE'                => $getValue('__VIEWSTATE'),
            '__VIEWSTATEGENERATOR'       => $getValue('__VIEWSTATEGENERATOR'),
            '__RequestVerificationToken' => $getValue('__RequestVerificationToken'),
        ];
    }
}