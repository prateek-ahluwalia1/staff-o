<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;

class ContractorInvoiceService
{
    /**
     * Generate a contractor-branded TAX INVOICE PDF and return raw bytes.
     *
     * Expected $data keys:
     *  invoice_number, date,
     *
     *  contractor => [
     *      name, abn, license_number, address
     *  ],
     *  client => [
     *      name, abn, attn, address
     *  ],
     *
     *  shifts => [
     *      [
     *          'description' => 'Licensed Static Security Guard',
     *          'site'        => 'Truganina Gate B',
     *          'guard_ref'   => 'SG-4412',   // shown as (Guard ID: #SG-4412)
     *          'date'        => '18/08/2026',
     *          'hours'       => 12.0,
     *          'rate'        => 43.86,       // ex. GST, per hour
     *          'amount'      => 526.32,      // hours * rate
     *      ],
     *      ...
     *  ],
     *
     *  gross_subtotal, discount_percent, discount_amount,
     *  net_taxable, gst_percent, gst_amount, total_payable,
     *
     *  payment_status => 'PAID / SECURED',
     *
     *  compliance_note => 'Security guarding services are delivered under ...' (optional override)
     */
    public function generatePdf(array $data): string
    {
        $pdf = Pdf::loadHTML($this->buildHtml($data))->setPaper('a4', 'portrait');
        return $pdf->output();
    }

    private function buildHtml(array $d): string
    {
        // ── Shift rows ────────────────────────────────────────────────────
        $shiftRows = '';
        foreach ($d['shifts'] as $i => $shift) {
            $rowBg      = ($i % 2 === 0) ? '#FFFFFF' : '#F7F9FC';
            $description = htmlspecialchars($shift['description'] ?? 'Licensed Static Security Guard');
            $site        = htmlspecialchars($shift['site'] ?? '');
            $guardRef    = htmlspecialchars($shift['guard_ref'] ?? '');
            $date        = htmlspecialchars($shift['date'] ?? '');
            $hours       = number_format((float) ($shift['hours'] ?? 0), 1);
            $rate        = '$' . number_format((float) ($shift['rate'] ?? 0), 2);
            $amount      = '$' . number_format((float) ($shift['amount'] ?? 0), 2);

            $subLine = '';
            if ($site || $guardRef) {
                $subLine = "<div class='shift-sub'>Site: {$site}</div>";
            }

            $shiftRows .= "
            <tr style='background:{$rowBg};'>
                <td>
                    <div class='shift-desc'>{$description}</div>
                    {$subLine}
                </td>
                <td style='text-align:center;'>{$date}</td>
                <td style='text-align:center;'>{$hours}</td>
                <td style='text-align:right;'>{$rate}</td>
                <td style='text-align:right;'>{$amount}</td>
            </tr>";
        }

        // ── Scalars ───────────────────────────────────────────────────────
        $invoiceNumber = htmlspecialchars($d['invoice_number']);
        $date          = htmlspecialchars($d['date']);

        $contractor = $d['contractor'] ?? [];
        $client     = $d['client'] ?? [];

        $contractorName    = htmlspecialchars($contractor['name'] ?? 'Contractor');
        $contractorAbn     = htmlspecialchars($contractor['abn'] ?? 'N/A');
        $contractorLicense = htmlspecialchars($contractor['license_number'] ?? 'N/A');
        $contractorAddress = htmlspecialchars($contractor['address'] ?? '');

        $clientName    = htmlspecialchars($client['name'] ?? 'Client');
        $clientAbn     = htmlspecialchars($client['abn'] ?? 'N/A');
        $clientAttn    = htmlspecialchars($client['attn'] ?? 'Accounts Payable');
        $clientAddress = htmlspecialchars($client['address'] ?? '');

        $grossSubtotal   = '$' . number_format((float) $d['gross_subtotal'], 2);
        $discountPercent = (float) ($d['discount_percent'] ?? 0);
        $discountAmount  = '$' . number_format((float) $d['discount_amount'], 2);
        $netTaxable      = '$' . number_format((float) $d['net_taxable'], 2);
        $gstPercent      = (float) ($d['gst_percent'] ?? 10);
        $gstAmount       = '$' . number_format((float) $d['gst_amount'], 2);
        $totalPayable    = '$' . number_format((float) $d['total_payable'], 2);

        $paymentStatus = htmlspecialchars($d['payment_status'] ?? 'PENDING');

        $complianceNote = $d['compliance_note'] ?? (
            "Security guarding services are delivered under Master Security Licence #{$contractorLicense} by "
            . "{$contractorName}. Platform facilitation, promotion, and billing management provided by Staffoo "
            . "(Capital Services Pty Ltd ABN 48 613 317 838)."
        );

        // ── CSS ──────────────────────────────────────────────────────────
        $css = '
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size:10px; color:#111827; }

        .header { padding:20px 22px 14px; }
        .header table { width:100%; }
        .header td { vertical-align:top; }
        .doc-title { font-size:20px; font-weight:bold; color:#14243D; }
        .doc-subtitle { font-size:9px; color:#6B7280; margin-top:2px; }
        .inv-number { font-size:13px; font-weight:bold; color:#0A7C6E; text-align:right; }
        .inv-date { font-size:9px; color:#6B7280; text-align:right; margin-top:2px; }

        .accent-line { height:2px; background:#0A7C6E; margin:0 22px 14px; }

        .parties { padding:0 22px 14px; }
        .parties table { width:100%; }
        .parties td { vertical-align:top; width:50%; padding-right:16px; }
        .party-label { font-size:8.5px; font-weight:bold; color:#6B7280; letter-spacing:0.5px; margin-bottom:4px; }
        .party-name { font-size:11px; font-weight:bold; color:#14243D; margin-bottom:2px; }
        .party-line { font-size:9px; color:#374151; line-height:1.6; }
        .party-italic { font-size:8.5px; color:#6B7280; font-style:italic; margin-top:3px; }

        .table-wrap { padding:0 22px; }
        .st { width:100%; border-collapse:collapse; font-size:9px; }
        .st thead tr { background:#0A7C6E; color:#FFFFFF; }
        .st thead th { padding:8px 8px; text-align:left; font-size:8.5px; letter-spacing:0.3px; }
        .st tbody td { padding:7px 8px; border-bottom:1px solid #E5E7EB; vertical-align:top; }
        .shift-desc { font-weight:bold; color:#111827; }
        .shift-sub { font-size:8px; color:#6B7280; margin-top:2px; }

        .totals-wrap { padding:12px 22px 0; }
        .tt { width:60%; margin-left:40%; border-collapse:collapse; font-size:9.5px; }
        .tt td { padding:4px 4px; }
        .tt .lbl { color:#374151; text-align:right; padding-right:16px; }
        .tt .amt { text-align:right; }
        .discount-row td { color:#DC2626; font-weight:bold; }
        .net-row td { border-top:1px solid #D1D5DB; font-weight:bold; padding-top:6px; }
        .grand td { font-weight:bold; color:#14243D; font-size:12px;
                    border-top:2px solid #0A7C6E; background:#F7F9FC; padding-top:8px; padding-bottom:8px; }
        .status-row td { font-weight:bold; color:#0A7C6E; padding-top:8px; }

        .compliance-box { margin:20px 22px 0; background:#EFF6FF; border-left:3px solid #0A7C6E;
                           padding:10px 14px; font-size:8.5px; color:#374151; line-height:1.6; }
        .compliance-box strong { color:#14243D; }

        .footer { padding:16px 22px 10px; text-align:center; font-size:9px; color:#9CA3AF; }
        ';

        // ── Final HTML ────────────────────────────────────────────────────
        $html  = "<!DOCTYPE html><html lang='en'>";
        $html .= "<head><meta charset='UTF-8'><style>{$css}</style></head><body>";

        // Header
        $html .= "<div class='header'><table><tr>";
        $html .= "<td><div class='doc-title'>TAX INVOICE</div><div class='doc-subtitle'>Issued via Staffoo Platform as Billing Agent</div></td>";
        $html .= "<td><div class='inv-number'>INVOICE #{$invoiceNumber}</div><div class='inv-date'>Date: {$date}</div></td>";
        $html .= "</tr></table></div>";
        $html .= "<div class='accent-line'></div>";

        // Parties
        $html .= "<div class='parties'><table><tr>";
        $html .= "<td>";
        $html .= "<div class='party-label'>SERVICE PROVIDER (RESOURCE PARTNER)</div>";
        $html .= "<div class='party-name'>{$contractorName}</div>";
        $html .= "<div class='party-line'>ABN: {$contractorAbn} | Master Security Licence: {$contractorLicense}</div>";
        $html .= "<div class='party-line'>{$contractorAddress}</div>";
        $html .= "<div class='party-italic'>Facilitated by Staffoo (Capital Services Pty Ltd)</div>";
        $html .= "</td>";
        $html .= "<td>";
        $html .= "<div class='party-label'>BILLED TO (CLIENT)</div>";
        $html .= "<div class='party-name'>{$clientName}</div>";
        $html .= "<div class='party-line'>ABN: {$clientAbn}</div>";
        $html .= "<div class='party-line'>Attn: {$clientAttn}</div>";
        $html .= "<div class='party-line'>{$clientAddress}</div>";
        $html .= "</td>";
        $html .= "</tr></table></div>";

        // Shift table
        $html .= "<div class='table-wrap'><table class='st'><thead><tr>";
        $html .= "<th style='width:40%;'>Description</th>";
        $html .= "<th style='width:16%;text-align:center;'>Shift Date</th>";
        $html .= "<th style='width:12%;text-align:center;'>Hours</th>";
        $html .= "<th style='width:16%;text-align:right;'>Rate (ex. GST)</th>";
        $html .= "<th style='width:16%;text-align:right;'>Amount (AUD)</th>";
        $html .= "</tr></thead><tbody>{$shiftRows}</tbody></table></div>";

        // Totals
        $html .= "<div class='totals-wrap'><table class='tt'>";
        $html .= "<tr><td class='lbl'>Gross Subtotal (ex. GST)</td><td class='amt'>{$grossSubtotal}</td></tr>";
        $html .= "<tr class='discount-row'><td class='lbl'>Staffoo Platform Promotion Discount ({$discountPercent}%)</td><td class='amt'>-{$discountAmount}</td></tr>";
        $html .= "<tr class='net-row'><td class='lbl'>Net Taxable Amount (ex. GST)</td><td class='amt'>{$netTaxable}</td></tr>";
        $html .= "<tr><td class='lbl'>GST ({$gstPercent}% on Net Amount)</td><td class='amt'>{$gstAmount}</td></tr>";
        $html .= "<tr class='grand'><td class='lbl'>Total Payable (incl. GST)</td><td class='amt'>{$totalPayable}</td></tr>";
        $html .= "<tr class='status-row'><td class='lbl'>Payment Status (Stripe)</td><td class='amt'>{$paymentStatus}</td></tr>";
        $html .= "</table></div>";

        // Compliance note
        $html .= "<div class='compliance-box'><strong>Compliance Note:</strong> {$complianceNote}</div>";

        $html .= "<div class='footer'>Thank you for choosing {$contractorName} via Staffoo.</div>";
        $html .= "</body></html>";

        return $html;
    }
}