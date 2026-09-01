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
        // NEW: drawn signature image — expects a full data URI
        // (e.g. "data:image/png;base64,iVBOR...") or raw base64 (we'll add
        // the prefix if missing). Embedded directly as base64 rather than a
        // file path, since dompdf handles inline data URIs more reliably
        // than remote/local file paths across environments.
        $signatureImageBase64 = $d['signature_image_base64'] ?? null;
        if ($signatureImageBase64 && !str_starts_with($signatureImageBase64, 'data:image')) {
            $signatureImageBase64 = 'data:image/png;base64,' . $signatureImageBase64;
        }

        // ── Rate table rows ──────────────────────────────────────────────
        $rateRows = '';
        foreach ($d['rates'] as $i => $rate) {
            $rowBg = ($i % 2 === 0) ? '#F7F9FC' : '#FFFFFF';
            $label = htmlspecialchars($rate['label']);
            $value = '$' . number_format((float) $rate['value'], 2);

            $rateRows .= "
            <tr style='background:{$rowBg};'>
                <td>{$label}</td>
                <td style='text-align:right;'>{$value}</td>
            </tr>";
        }

        $css = '
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size:10.5px; color:#111827; line-height:1.6; }
        .wrapper { padding:26px 30px; }
        .header { border-bottom:2px solid #0A7C6E; padding-bottom:14px; margin-bottom:20px; }
        .title { font-size:19px; font-weight:bold; color:#14243D; }
        .subtitle { font-size:10px; color:#6B7280; margin-top:3px; }
        .meta { font-size:9px; color:#6B7280; text-align:right; }
        .section-title { font-size:12px; font-weight:bold; color:#0A7C6E; margin:18px 0 6px; }
        p { margin-bottom:10px; text-align:justify; }
        .rt { width:100%; border-collapse:collapse; font-size:9.5px; margin:8px 0 16px; }
        .rt thead tr { background:#0A7C6E; color:#fff; }
        .rt thead th { padding:7px 8px; text-align:left; }
        .rt tbody td { padding:6px 8px; border-bottom:1px solid #E5E7EB; }
        .clause-list { margin:6px 0 14px 18px; }
        .clause-list li { margin-bottom:6px; }
        .sign-box { margin-top:26px; border:1px solid #D1D5DB; border-radius:6px; padding:16px; }
        .sign-title { font-size:11px; font-weight:bold; color:#14243D; margin-bottom:10px; }
        .sign-row { font-size:10px; margin-bottom:6px; }
        .sign-label { color:#6B7280; display:inline-block; width:120px; }
        .signed-badge {
            display:inline-block; background:#ECFDF5; color:#065F46; border:1px solid #6EE7B7;
            border-radius:14px; padding:3px 10px; font-size:9px; font-weight:bold; margin-bottom:10px;
        }
        .unsigned-line { border-bottom:1px solid #9CA3AF; width:220px; display:inline-block; height:16px; }
        .signature-image { height:60px; max-width:260px; border-bottom:1px solid #9CA3AF; padding-bottom:4px; margin-bottom:4px; }
        .footer { margin-top:24px; font-size:8.5px; color:#9CA3AF; text-align:center; }
        ';

        $html  = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><style>{$css}</style></head><body>";
        $html .= "<div class='wrapper'>";

        // Header
        $html .= "<div class='header'><table style='width:100%;'><tr>";
        $html .= "<td><div class='title'>Subcontractor Services Agreement</div><div class='subtitle'>Issued via Staffoo Platform</div></td>";
        $html .= "<td class='meta'>Contract #: {$contractNumber}<br>Date: {$date}</td>";
        $html .= "</tr></table></div>";

        // Parties / recitals
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
        $html .= "<div class='section-title'>Rate Schedule — {$state}</div>";
        $html .= "<table class='rt'><thead><tr><th>Rate Type</th><th style='text-align:right;'>Rate (AUD/hr)</th></tr></thead><tbody>{$rateRows}</tbody></table>";

        // Signature block
        $html .= "<div class='sign-box'>";
        if ($isSigned) {
            $html .= "<div class='signed-badge'>&#10003; Signed</div>";
            $html .= "<div class='sign-title'>Acknowledgement &amp; Signature</div>";
            $html .= "<p style='margin-bottom:10px;'>By signing below, the Subcontractor confirms they have read, understood, "
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
            $html .= "<p style='margin-bottom:10px;'>By signing below, the Subcontractor confirms they have read, understood, "
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