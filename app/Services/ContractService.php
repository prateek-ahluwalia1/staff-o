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
     *  rates => [ ['label' => 'Metro Mon-Fri Day', 'value' => 25.00], ... ]
     *
     *  Optional (only present once signed):
     *  signature_name, signed_at, signed_ip
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

    // ── Group rates properly ──────────────────────────────
    $rateGroups = [];
    foreach ($d['rates'] as $rate) {
        $label = trim($rate['label']);
        $value = number_format((float) $rate['value'], 2);
        
        // Determine if it's Metro or Regional
        if (stripos($label, 'metro') !== false) {
            $area = 'Metro';
            // Remove "Metro" or "Regional" from label to get the type
            $type = trim(str_ireplace(['Metro', 'Regional'], '', $label));
        } elseif (stripos($label, 'regional') !== false) {
            $area = 'Regional';
            $type = trim(str_ireplace(['Metro', 'Regional'], '', $label));
        } else {
            // Fallback: try to parse
            $parts = explode(' ', $label);
            $area = $parts[0] ?? 'Metro';
            $type = implode(' ', array_slice($parts, 1));
        }
        
        // Clean up the type
        $type = trim(preg_replace('/\s+/', ' ', $type));
        
        if (!isset($rateGroups[$type])) {
            $rateGroups[$type] = [];
        }
        $rateGroups[$type][$area] = $value;
    }

    // Build rate table HTML - simplified design matching image
    $rateHtml = '';
    foreach ($rateGroups as $type => $areas) {
        $metroValue = isset($areas['Metro']) ? '$' . $areas['Metro'] : '$0.00';
        $regionalValue = isset($areas['Regional']) ? '$' . $areas['Regional'] : '$0.00';
        
        $rateHtml .= '
        <div class="rate-block">
            <div class="rate-title">' . htmlspecialchars($type) . '</div>
            <div class="rate-items">
                <div class="rate-item">
                    <span class="rate-label">METRO</span>
                    <span class="rate-value">' . $metroValue . '</span>
                </div>
                <div class="rate-item">
                    <span class="rate-label">REGIONAL</span>
                    <span class="rate-value">' . $regionalValue . '</span>
                </div>
            </div>
        </div>';
    }

    $css = '
        * { margin:0; padding:0; box-sizing:border-box; }
        body { 
            font-family: DejaVu Sans, sans-serif; 
            font-size: 11px; 
            color: #1a1a2e; 
            line-height: 1.5; 
            background: #ffffff;
        }
        .wrapper { padding: 30px 35px; max-width: 800px; margin: 0 auto; }
        
        /* Header */
        .header { 
            border-bottom: 3px solid #0A7C6E; 
            padding-bottom: 15px; 
            margin-bottom: 25px;
        }
        .header-title { 
            font-size: 20px; 
            font-weight: bold; 
            color: #1a1a2e;
        }
        .header-subtitle { 
            font-size: 11px; 
            color: #6B7280; 
            margin-top: 2px;
        }
        .header-meta { 
            font-size: 10px; 
            color: #6B7280; 
            text-align: right;
        }
        
        /* Content */
        .section-title { 
            font-size: 14px; 
            font-weight: bold; 
            color: #0A7C6E; 
            margin: 20px 0 8px;
        }
        p { margin-bottom: 10px; text-align: justify; }
        .clause-list { 
            margin: 6px 0 16px 20px; 
        }
        .clause-list li { 
            margin-bottom: 6px; 
        }
        
        /* Rate blocks - matching the image design */
        .rate-block {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 20px;
            margin-bottom: 10px;
        }
        .rate-title {
            font-size: 13px;
            font-weight: 600;
            color: #0A7C6E;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
        }
        .rate-items {
            display: flex;
            justify-content: space-between;
            gap: 30px;
        }
        .rate-item {
            flex: 1;
        }
        .rate-label {
            display: block;
            font-size: 9px;
            font-weight: 600;
            color: #64748b;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        .rate-value {
            display: block;
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
        }
        
        /* Signature */
        .sign-box { 
            margin-top: 30px; 
            border: 1px solid #d1d5db; 
            border-radius: 6px; 
            padding: 18px 20px; 
        }
        .sign-title { 
            font-size: 12px; 
            font-weight: bold; 
            color: #1a1a2e; 
            margin-bottom: 10px; 
        }
        .sign-row { 
            font-size: 10px; 
            margin-bottom: 8px; 
        }
        .sign-label { 
            color: #6B7280; 
            display: inline-block; 
            width: 110px; 
        }
        .signed-badge {
            display: inline-block; 
            background: #ecfdf5; 
            color: #065f46; 
            border: 1px solid #6ee7b7;
            border-radius: 14px; 
            padding: 3px 12px; 
            font-size: 9px; 
            font-weight: bold; 
            margin-bottom: 12px;
        }
        .unsigned-line { 
            border-bottom: 1px solid #9ca3af; 
            width: 200px; 
            display: inline-block; 
            height: 18px; 
        }
        .signature-image { 
            height: 60px; 
            max-width: 260px; 
            border-bottom: 1px solid #9ca3af; 
            padding-bottom: 4px; 
            margin-bottom: 6px; 
        }
        .footer { 
            margin-top: 30px; 
            font-size: 8.5px; 
            color: #9ca3af; 
            text-align: center; 
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
    ';

    $html  = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><style>{$css}</style></head><body>";
    $html .= "<div class='wrapper'>";

    // Header
    $html .= "<div class='header'><table style='width:100%;'><tr>";
    $html .= "<td><div class='header-title'>Subcontractor Services Agreement</div><div class='header-subtitle'>Issued via Staffoo Platform</div></td>";
    $html .= "<td class='header-meta'>Contract #: {$contractNumber}<br>Date: {$date}</td>";
    $html .= "</tr></table></div>";

    // Parties
    $html .= "<p>This Subcontractor Services Agreement (\"Agreement\") is entered into between "
           . "<strong>Staffoo (Capital Services Pty Ltd)</strong> (\"Staffoo\") and "
           . "<strong>{$contractorName}</strong> (ABN: {$contractorAbn}) (\"Subcontractor\"), "
           . "for the provision of security services in <strong>{$state}</strong>, effective from {$effectiveFrom}.</p>";

    $html .= "<p>The Subcontractor acknowledges and agrees that it is engaged by Staffoo as an "
           . "independent <strong>subcontractor</strong>, and not as an employee, agent, or partner of Staffoo. "
           . "The Subcontractor is responsible for its own tax, superannuation, insurance, and statutory "
           . "obligations in connection with the services provided under this Agreement.</p>";

    // Key terms
    $html .= "<div class='section-title'>Key Terms</div>";
    $html .= "<ul class='clause-list'>";
    $html .= "<li>The Subcontractor will provide licensed security guarding services within the state of <strong>{$state}</strong> only, unless otherwise agreed in writing.</li>";
    $html .= "<li>Charge rates payable to the Subcontractor for services rendered in {$state} are set out in the rate schedule below, and reflect the rates approved on Staffoo's platform.</li>";
    $html .= "<li>This Agreement does not guarantee any minimum volume of work; jobs are offered at Staffoo's discretion via the platform.</li>";
    $html .= "<li>The Subcontractor must maintain all licences, certifications, and insurances required by law to perform the services in {$state}.</li>";
    $html .= "<li>Either party may terminate this arrangement in accordance with the terms of the Staffoo platform agreement.</li>";
    $html .= "</ul>";

    // Rate schedule
    $html .= "<div class='section-title'>Proposed rates for this state</div>";
    $html .= $rateHtml;

    // Signature
    $html .= "<div class='sign-box'>";
    if ($isSigned) {
        $html .= "<div class='signed-badge'>✓ Signed</div>";
        $html .= "<div class='sign-title'>Acknowledgement &amp; Signature</div>";
        $html .= "<p style='margin-bottom:10px;font-size:10px;'>By signing below, the Subcontractor confirms they have read, understood, "
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
        $html .= "<p style='margin-bottom:10px;font-size:10px;'>By signing below, the Subcontractor confirms they have read, understood, "
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