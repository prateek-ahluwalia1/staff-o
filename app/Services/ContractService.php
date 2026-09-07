<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;

class ContractService
{
    /**
     * Generate the contract PDF and return raw bytes.
     *
     * Expected $data keys:
     *  contract_number, date,
     *  contractor_name, contractor_abn,
     *  state, title, effective_from,
     *  rates => [ ['label' => 'Default Metro Mon–Fri Day', 'value' => 25.00], ... ]
     *
     *  Optional (only present once signed):
     *  signature_name, signature_image_base64, signed_at, signed_ip
     */
    public function generatePdf(array $data): string
    {
        $pdf = Pdf::loadHTML($this->buildHtml($data))->setPaper('a4', 'portrait');
        return $pdf->output();
    }

    private function buildHtml(array $d): string
    {
        $contractNumber = htmlspecialchars($d['contract_number']);
        $date           = htmlspecialchars($d['date']);
        $contractorName = htmlspecialchars($d['contractor_name']);
        $contractorAbn  = htmlspecialchars($d['contractor_abn'] ?? 'N/A');
        $state          = htmlspecialchars(strtoupper($d['state']));
        $effectiveFrom  = htmlspecialchars($d['effective_from'] ?? 'the date of signing');

        $isSigned      = !empty($d['signature_name']) || !empty($d['signature_image_base64']);
        $signatureName = htmlspecialchars($d['signature_name'] ?? '');
        $signedAt      = htmlspecialchars($d['signed_at'] ?? '');
        $signedIp      = htmlspecialchars($d['signed_ip'] ?? '');
        $signatureImageBase64 = $d['signature_image_base64'] ?? null;
        if ($signatureImageBase64 && !str_starts_with($signatureImageBase64, 'data:image')) {
            $signatureImageBase64 = 'data:image/png;base64,' . $signatureImageBase64;
        }

        // ── Group rates into Metro/Regional pairs, keyed by category ──────
        $categories = [];
        foreach ($d['rates'] as $rate) {
            $label = trim($rate['label']);
            $value = (float) $rate['value'];

            $isMetro = stripos($label, 'metro') !== false;
            $area = $isMetro ? 'Metro' : 'Regional';

            $category = trim(str_ireplace(['Default', 'EBA', 'Metro', 'Regional'], '', $label));
            $category = trim(preg_replace('/\s+/', ' ', $category));

            $collapsed = false;
            foreach (['Saturday', 'Sunday', 'Public Holiday'] as $collapsedBase) {
                if (stripos($category, $collapsedBase) === 0) {
                    if (stripos($category, 'Night') !== false) {
                        $collapsed = true;
                        break;
                    }
                    $category = $collapsedBase;
                    break;
                }
            }
            if ($collapsed) {
                continue;
            }

            $categories[$category][$area] = $value;
        }

        // ── Build the certificate seal (scalloped red badge, top-right stamp) ──
        $categoryChunks = array_chunk($categories, 3, true);
        $rateHtml = '';
        foreach ($categoryChunks as $chunk) {
            $rateHtml .= "<table class='card-row'><tr>";
            foreach ($chunk as $categoryName => $areas) {
                $metroValue    = '$' . number_format($areas['Metro'] ?? 0, 2);
                $regionalValue = '$' . number_format($areas['Regional'] ?? 0, 2);

                $rateHtml .= "
                <td class='rate-card' width='" . (int)(100 / count($chunk)) . "%'>
                    <div class='rate-title'>" . htmlspecialchars($categoryName) . "</div>
                    <div class='rate-label'><span class='icon-dot'></span>METRO</div>
                    <div class='rate-value'>{$metroValue}</div>
                    <div style='height:4px;'></div>
                    <div class='rate-label'><span class='icon-tri'></span>REGIONAL</div>
                    <div class='rate-value'>{$regionalValue}</div>
                </td>";
            }
            for ($i = count($chunk); $i < 3; $i++) {
                $rateHtml .= "<td width='" . (int)(100/3) . "%'></td>";
            }
            $rateHtml .= "</tr></table>";
        }

        // ── CSS — spacing tightened throughout so the full document fits on
        // ONE page. Previously, content was just tall enough to overflow by
        // a small margin, and since .sign-box has page-break-inside:avoid,
        // dompdf pushed the ENTIRE signature box to page 2 rather than
        // splitting it — leaving page 2 almost empty. Compressing margins/
        // padding here reclaims enough height that everything fits on page 1.
        $css = '
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10.5px;
            color: #1a1a2e;
            line-height: 1.42;
            background: #ffffff;
        }
        .wrapper { padding: 22px 32px; max-width: 800px; margin: 0 auto; position: relative; }

        /* Header */
        .header {
            border-bottom: 3px solid #0A7C6E;
            padding-bottom: 10px;
            margin-bottom: 16px;
        }
        .header-title { font-size: 19px; font-weight: bold; color: #1a1a2e; }
        .header-subtitle { font-size: 10px; color: #6B7280; margin-top: 2px; }
        .header-meta { font-size: 9.5px; color: #6B7280; text-align: right; }

        /* Content */
        .section-title { font-size: 13px; font-weight: bold; color: #0A7C6E; margin: 12px 0 6px; }
        p { margin-bottom: 7px; text-align: justify; }
        .clause-list { margin: 4px 0 10px 18px; }
        .clause-list li { margin-bottom: 4px; }

        /* Rate cards — table-based (dompdf does not reliably support flexbox) */
        .card-row { width: 100%; border-collapse: separate; border-spacing: 6px; margin-bottom: 0; page-break-inside: avoid; }
        .rate-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 7px;
            padding: 10px 14px;
            vertical-align: top;
            page-break-inside: avoid;
        }
        .rate-title {
            font-size: 12px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 6px;
        }
        .rate-label {
            font-size: 8.5px;
            font-weight: 600;
            color: #64748b;
            letter-spacing: 0.5px;
            margin-bottom: 1px;
        }
        .icon-dot {
            display: inline-block; width: 6px; height: 6px; border-radius: 50%;
            background: #0A7C6E; margin-right: 5px;
        }
        .icon-tri {
            display: inline-block; width: 0; height: 0;
            border-left: 4px solid transparent; border-right: 4px solid transparent;
            border-bottom: 6px solid #14243D; margin-right: 5px;
        }
        .rate-value { font-size: 15px; font-weight: bold; color: #0A7C6E; }

        /* Signature */
        .sign-box { margin-top: 16px; border: 1px solid #d1d5db; border-radius: 6px; padding: 14px 16px; page-break-inside: avoid; }
        .sign-title { font-size: 11.5px; font-weight: bold; color: #1a1a2e; margin-bottom: 7px; }
        .sign-row { font-size: 9.5px; margin-bottom: 6px; }
        .sign-label { color: #6B7280; display: inline-block; width: 105px; }
        .signed-badge {
            display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7;
            border-radius: 14px; padding: 3px 12px; font-size: 9px; font-weight: bold; margin-bottom: 9px;
        }
        .unsigned-line { border-bottom: 1px solid #9ca3af; width: 200px; display: inline-block; height: 16px; }
        .signature-image { height: 50px; max-width: 240px; border-bottom: 1px solid #9ca3af; padding-bottom: 3px; margin-bottom: 5px; }
        .footer {
            margin-top: 14px; font-size: 8.5px; color: #9ca3af; text-align: center;
            border-top: 1px solid #e5e7eb; padding-top: 10px;
        }

        /* Certificate seal — absolutely positioned stamp, top-right corner */
        .seal-wrap {
            position: absolute;
            top: 14px;
            right: 28px;
            width: 90px;
            height: 90px;
        }
        ';

        $html  = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><style>{$css}</style></head><body>";
        $html .= "<div class='wrapper'>";

        // Header
        $html .= "<div class='header'><table style='width:100%;'><tr>";
        $html .= "<td><div class='header-title'>Resource Partner Services Agreement</div><div class='header-subtitle'>Issued via Staffoo Platform</div></td>";
        $html .= "<td class='header-meta'>Contract #: {$contractNumber}<br>Date: {$date}</td>";
        $html .= "</tr></table></div>";

        // Parties
        $html .= "<p>This Resource Partner Services Agreement (\"Agreement\") is entered into between "
               . "<strong>Staffoo (Capital Services Pty Ltd)</strong> (\"Staffoo\") and "
               . "<strong>{$contractorName}</strong> (ABN: {$contractorAbn}) (\"Resource Partner\"), "
               . "for the provision of security services in <strong>{$state}</strong>, effective from {$effectiveFrom}.</p>";

        $html .= "<p>The Resource Partner acknowledges and agrees that it is engaged by Staffoo as an "
               . "independent <strong>Resource Partner</strong>, and not as an employee, agent, or partner of Staffoo. "
               . "The Resource Partner is responsible for its own tax, superannuation, insurance, and statutory "
               . "obligations in connection with the services provided under this Agreement.</p>";

        // Key terms
        $html .= "<div class='section-title'>Key Terms</div>";
        $html .= "<ul class='clause-list'>";
        $html .= "<li>The Resource Partner will provide licensed security guarding services within the state of <strong>{$state}</strong> only, unless otherwise agreed in writing.</li>";
        $html .= "<li>Charge rates payable to the Resource Partner for services rendered in {$state} are set out in the rate schedule below, and reflect the rates approved on Staffoo's platform.</li>";
        $html .= "<li>This Agreement does not guarantee any minimum volume of work; jobs are offered at Staffoo's discretion via the platform.</li>";
        $html .= "<li>The Resource Partner must maintain all licences, certifications, and insurances required by law to perform the services in {$state}.</li>";
        $html .= "<li>Either party may terminate this arrangement in accordance with the terms of the Staffoo platform agreement.</li>";
        $html .= "</ul>";

        // Rate schedule
        $html .= "<div class='section-title'>{$state} — Charge Rates</div>";
        $html .= $rateHtml;

        // Signature
        $html .= "<div class='sign-box'>";
        if ($isSigned) {
            $html .= "<div class='signed-badge'>&#10003; Signed</div>";
            $html .= "<div class='sign-title'>Acknowledgement &amp; Signature</div>";
            $html .= "<p style='margin-bottom:8px;font-size:9.5px;'>By signing below, the Resource Partner confirms they have read, understood, "
                   . "and agree to be bound by the terms of this Agreement, including the rate schedule above.</p>";
            if ($signatureImageBase64) {
                $html .= "<div class='sign-row'><span class='sign-label'>Signature:</span></div>";
                $html .= "<img src='{$signatureImageBase64}' class='signature-image' />";
            }
            if ($signatureName) {
                $html .= "<div class='sign-row'><span class='sign-label'>Printed Name:</span><strong>{$signatureName}</strong></div>";
            }
            $html .= "<div class='sign-row'><span class='sign-label'>Date signed:</span>{$signedAt}</div>";
            if ($signedIp) {
                $html .= "<div class='sign-row'><span class='sign-label'>IP address:</span>{$signedIp}</div>";
            }
        } else {
            $html .= "<div class='sign-title'>Acknowledgement &amp; Signature</div>";
            $html .= "<p style='margin-bottom:8px;font-size:9.5px;'>By signing below, the Resource Partner confirms they have read, understood, "
                   . "and agree to be bound by the terms of this Agreement, including the rate schedule above.</p>";
            $html .= "<div class='sign-row'><span class='sign-label'>Signature:</span><span class='unsigned-line'></span></div>";
            $html .= "<div class='sign-row'><span class='sign-label'>Printed Name:</span><span class='unsigned-line'></span></div>";
            $html .= "<div class='sign-row'><span class='sign-label'>Date:</span><span class='unsigned-line'></span></div>";
        }
        $html .= "</div>";

        $html .= "<div class='footer'>Staffoo (Capital Services Pty Ltd) — ABN 48 613 317 838</div>";
        $html .= "</div></body></html>";

        return $html;
    }

}