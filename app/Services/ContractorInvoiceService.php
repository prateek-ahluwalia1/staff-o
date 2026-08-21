<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;

class ContractorInvoiceService
{
    /**
     * Generate a contractor-branded TAX INVOICE PDF and return raw bytes.
     *
     * Expected $data keys (new fields marked NEW):
     *  invoice_number, date,
     *
     *  // Service Provider (Resource Partner) block
     *  contractor_name, contractor_abn,
     *  contractor_license   (NEW — e.g. "Master Security Licence: 98765432S")
     *  contractor_address   (NEW)
     *  facilitated_by       (NEW — defaults to "Staffoo (Capital Services Pty Ltd)")
     *
     *  // Billed To (Client) block
     *  client_name, client_email,
     *  client_abn            (NEW)
     *  client_address         (NEW)
     *  client_attn             (NEW — e.g. "Accounts Payable")
     *
     *  // Shifts — each row now supports guard_id, site_name, rate
     *  shifts: [
     *    [
     *      'description' => 'Licensed Static Security Guard', (NEW, optional — has default)
     *      'site_name'   => 'Truganina Gate B',                (NEW)
     *      'guard_id'    => 'SG-4412',                          (NEW)
     *      'date'        => '18/08/2026',                       (NEW — single shift date; falls back to 'start' if not given)
     *      'start'       => '...', 'end' => '...',              (kept for backward compatibility / fallback)
     *      'hours'       => 12.0,
     *      'rate'        => 43.86,                               (NEW — per-hour rate; falls back to amount/hours if omitted)
     *      'amount'      => 526.32,
     *    ],
     *    ...
     *  ],
     *
     *  // Totals
     *  base_total       -> shown as "Gross Subtotal (ex. GST)"
     *  discount_percent (NEW, e.g. 5)   -> used in the discount row label
     *  discount         -> shown as "Staffoo Platform Promotion Discount"
     *  service_fee      -> shown as "GST (10% on Net Amount)"
     *  grand_total       -> shown as "Total Payable (incl. GST)"
     *
     *  // Status
     *  payment_status   (NEW — e.g. "PAID / SECURED" or "PENDING")
     *  compliance_note  (NEW, optional — custom compliance text; has a sensible default built from
     *                    contractor_license / contractor_name / facilitated_by if not given)
     */
    public function generatePdf(array $data): string
    {
        ini_set('memory_limit', '512M');
        $pdf = Pdf::loadHTML($this->buildHtml($data))->setPaper('a4', 'portrait');
        return $pdf->output();
    }

    private function buildHtml(array $d): string
    {
        // ── Scalars ───────────────────────────────────────────────────────
        $invoiceNumber = htmlspecialchars($d['invoice_number']);
        $date          = htmlspecialchars($d['date']);

        $contractorName    = htmlspecialchars($d['contractor_name'] ?? 'Contractor');
        $contractorAbn     = htmlspecialchars($d['contractor_abn'] ?? 'N/A');
        $contractorLicense = htmlspecialchars($d['contractor_license'] ?? '');
        $contractorAddress = htmlspecialchars($d['contractor_address'] ?? '');
        $facilitatedBy     = htmlspecialchars($d['facilitated_by'] ?? 'Staffoo (Capital Services Pty Ltd)');

        $clientName    = htmlspecialchars($d['client_name']);
        $clientAbn     = htmlspecialchars($d['client_abn'] ?? 'N/A');
        $clientAddress = htmlspecialchars($d['client_address'] ?? '');
        $clientAttn    = htmlspecialchars($d['client_attn'] ?? '');

        $paymentStatus = htmlspecialchars($d['payment_status'] ?? 'PENDING');

        // ── Totals ────────────────────────────────────────────────────────
        $grossSubtotal   = (float) ($d['base_total'] ?? 0);
        $discountPercent = (float) ($d['discount_percent'] ?? 0);
        $discountAmount  = (float) ($d['discount'] ?? 0);
        $netTaxable      = $grossSubtotal - $discountAmount;
        $gstAmount       = (float) ($d['service_fee'] ?? 0);
        $totalPayable    = (float) ($d['grand_total'] ?? ($netTaxable + $gstAmount));

        $grossSubtotalFmt = '$' . number_format($grossSubtotal, 2);
        $discountFmt      = '$' . number_format($discountAmount, 2);
        $netTaxableFmt    = '$' . number_format($netTaxable, 2);
        $gstFmt           = '$' . number_format($gstAmount, 2);
        $totalPayableFmt  = '$' . number_format($totalPayable, 2);

        $discountLabel = $discountPercent > 0
            ? "Staffoo Platform Promotion Discount ({$discountPercent}%):"
            : 'Discount:';

        // ── Shift rows ────────────────────────────────────────────────────
        $shiftRows = '';
        foreach ($d['shifts'] as $shift) {
            $description = htmlspecialchars($shift['description'] ?? 'Licensed Static Security Guard');
            $siteName    = htmlspecialchars($shift['site_name'] ?? '');
            $guardId     = htmlspecialchars($shift['guard_id'] ?? '');
            $shiftDate   = htmlspecialchars($shift['date'] ?? ($shift['start'] ?? ''));
            $hours       = (float) ($shift['hours'] ?? 0);
            $amount      = (float) ($shift['amount'] ?? 0);
            $rate        = isset($shift['rate']) ? (float) $shift['rate'] : ($hours > 0 ? $amount / $hours : 0);

            $subLine = trim(implode(' &middot; ', array_filter([
                $siteName ? "Site: {$siteName}" : null,
                $guardId ? "Guard ID: #{$guardId}" : null,
            ])));

            $shiftRows .= "
            <tr>
                <td>
                    <div class='desc-main'>{$description}</div>
                    " . ($subLine ? "<div class='desc-sub'>{$subLine}</div>" : "") . "
                </td>
                <td class='center'>{$shiftDate}</td>
                <td class='center'>" . number_format($hours, 1) . "</td>
                <td class='right'>$" . number_format($rate, 2) . "</td>
                <td class='right amount-col'>$" . number_format($amount, 2) . "</td>
            </tr>";
        }

        // ── Compliance note ──────────────────────────────────────────────
        $defaultCompliance = "Security guarding services are delivered under Master Security Licence "
            . ($contractorLicense ? "#{$contractorLicense} " : '')
            . "by {$contractorName}. Platform facilitation, promotion, and billing management provided by {$facilitatedBy}.";
        $complianceNote = htmlspecialchars($d['compliance_note'] ?? $defaultCompliance);

        // ── CSS — same teal/orange palette as before, navy added for headings ──
        $css = '
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size:10px; color:#111827; }
        .wrapper { padding: 24px 26px; }

        .top-row { width:100%; }
        .top-row td { vertical-align:top; }
        .title { font-size:20px; font-weight:bold; color:#0B1E33; }
        .subtitle { font-size:9px; color:#6B7280; margin-top:2px; }
        .invoice-no { font-size:13px; font-weight:bold; color:#0A7C6E; text-align:right; }
        .invoice-date { font-size:9px; color:#6B7280; text-align:right; margin-top:2px; }

        .accent-line { height:3px; background:#F0A500; margin:14px 0; }

        .parties-table { width:100%; margin-bottom:14px; }
        .parties-table td { vertical-align:top; width:50%; }
        .party-label { font-size:8.5px; font-weight:bold; color:#0A7C6E; letter-spacing:0.5px; margin-bottom:4px; }
        .party-name { font-size:11.5px; font-weight:bold; color:#111827; margin-bottom:2px; }
        .party-detail { font-size:9px; color:#374151; line-height:1.6; }
        .party-detail em { color:#6B7280; }

        .st { width:100%; border-collapse:collapse; font-size:9px; margin-bottom:14px; }
        .st thead tr { background:#0B1E33; color:#FFFFFF; }
        .st thead th { padding:8px 10px; text-align:left; font-size:8.5px; letter-spacing:0.3px; }
        .st tbody td { padding:8px 10px; border-bottom:1px solid #E5E7EB; vertical-align:top; }
        .st .center { text-align:center; }
        .st .right { text-align:right; }
        .amount-col { font-weight:bold; }
        .desc-main { font-weight:bold; color:#111827; }
        .desc-sub { color:#6B7280; font-size:8px; margin-top:2px; }

        .totals-wrap { width:100%; }
        .totals-table { width:55%; margin-left:45%; border-collapse:collapse; font-size:9.5px; }
        .totals-table td { padding:5px 0; }
        .totals-table .lbl { color:#374151; }
        .totals-table .amt { text-align:right; }
        .discount-row .lbl, .discount-row .amt { color:#D97706; font-weight:bold; }
        .net-row td { border-top:1px solid #D1D5DB; padding-top:8px; }
        .gst-row td { padding-bottom:8px; }
        .total-row td { border-top:2px solid #0A7C6E; font-weight:bold; font-size:12px; color:#0B1E33; padding-top:8px; }
        .status-row td { padding-top:10px; font-weight:bold; color:#065F46; }
        .status-row .amt { color:#065F46; }

        .compliance-box {
            margin-top:20px; padding:10px 14px; background:#F7F9FC;
            border-left:3px solid #0A7C6E; font-size:8.5px; color:#374151; line-height:1.6;
        }
        .compliance-box strong { color:#0B1E33; }

        .footer { text-align:center; font-size:8.5px; color:#9CA3AF; margin-top:20px; }
        ';

        // ── Final HTML ────────────────────────────────────────────────────
        $html  = "<!DOCTYPE html><html lang='en'>";
        $html .= "<head><meta charset='UTF-8'><style>{$css}</style></head><body>";
        $html .= "<div class='wrapper'>";

        // Top row — title + invoice number/date
        $html .= "<table class='top-row'><tr>";
        $html .= "<td><div class='title'>TAX INVOICE</div><div class='subtitle'>Issued via Staffoo Platform as Billing Agent</div></td>";
        $html .= "<td><div class='invoice-no'>INVOICE #{$invoiceNumber}</div><div class='invoice-date'>Date: {$date}</div></td>";
        $html .= "</tr></table>";
        $html .= "<div class='accent-line'></div>";

        // Provider / Client blocks
        $html .= "<table class='parties-table'><tr>";
        $html .= "<td>";
        $html .= "<div class='party-label'>SERVICE PROVIDER (RESOURCE PARTNER)</div>";
        $html .= "<div class='party-name'>{$contractorName}</div>";
        $html .= "<div class='party-detail'>ABN: {$contractorAbn}" . ($contractorLicense ? " | Master Security Licence: {$contractorLicense}" : '') . "</div>";
        if ($contractorAddress) {
            $html .= "<div class='party-detail'>{$contractorAddress}</div>";
        }
        $html .= "<div class='party-detail'><em>Facilitated by {$facilitatedBy}</em></div>";
        $html .= "</td>";

        $html .= "<td>";
        $html .= "<div class='party-label'>BILLED TO (CLIENT)</div>";
        $html .= "<div class='party-name'>{$clientName}</div>";
        $html .= "<div class='party-detail'>ABN: {$clientAbn}</div>";
        if ($clientAttn) {
            $html .= "<div class='party-detail'>Attn: {$clientAttn}</div>";
        }
        if ($clientAddress) {
            $html .= "<div class='party-detail'>{$clientAddress}</div>";
        }
        $html .= "</td>";
        $html .= "</tr></table>";

        // Shift table
        $html .= "<table class='st'><thead><tr>";
        $html .= "<th style='width:36%;'>Description</th>";
        $html .= "<th style='width:16%;' class='center'>Shift Date</th>";
        $html .= "<th style='width:12%;' class='center'>Hours</th>";
        $html .= "<th style='width:16%;' class='right'>Rate (ex. GST)</th>";
        $html .= "<th style='width:20%;' class='right'>Amount (AUD)</th>";
        $html .= "</tr></thead><tbody>{$shiftRows}</tbody></table>";

        // Totals
        $html .= "<div class='totals-wrap'><table class='totals-table'>";
        $html .= "<tr><td class='lbl'>Gross Subtotal (ex. GST):</td><td class='amt'>{$grossSubtotalFmt}</td></tr>";
        $html .= "<tr class='discount-row'><td class='lbl'>{$discountLabel}</td><td class='amt'>-{$discountFmt}</td></tr>";
        $html .= "<tr class='net-row'><td class='lbl'>Net Taxable Amount (ex. GST):</td><td class='amt'>{$netTaxableFmt}</td></tr>";
        $html .= "<tr class='gst-row'><td class='lbl'>GST (10% on Net Amount):</td><td class='amt'>{$gstFmt}</td></tr>";
        $html .= "<tr class='total-row'><td class='lbl'>Total Payable (incl. GST):</td><td class='amt'>{$totalPayableFmt}</td></tr>";
        $html .= "<tr class='status-row'><td class='lbl'>Payment Status (Stripe):</td><td class='amt'>{$paymentStatus}</td></tr>";
        $html .= "</table></div>";

        // Compliance note
        $html .= "<div class='compliance-box'><strong>Compliance Note:</strong> {$complianceNote}</div>";

        $html .= "<div class='footer'>Thank you for choosing {$contractorName}, facilitated by Staffoo.</div>";

        $html .= "</div></body></html>";

        return $html;
    }
}