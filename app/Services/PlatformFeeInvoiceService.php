<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;

class PlatformFeeInvoiceService
{
    /**
     * Generate the "Platform Service Fee Tax Invoice" PDF — this is the
     * invoice STAFFOO issues to the contractor for its 10% marketplace/WFM
     * fee, deducted before the net payout is transferred via Stripe Connect.
     *
     * Expected $data keys:
     *  fee_invoice_number   e.g. 'STF-FEE-5021'
     *  date                 e.g. '20 Aug 2026'
     *  job_ref              e.g. 'STF-2026-1082-D' (the client-facing invoice number)
     *  client_booking_label e.g. 'Westfield Logistics Hub'
     *  service_label        e.g. 'Automated Timesheet & Geofence Verification'
     *
     *  contractor => [ name, abn, attn, address ]
     *
     *  chargeable_basis   float  (net taxable amount the fee % is applied to)
     *  fee_rate_percent    float  (e.g. 10.0)
     *  fee_amount          float  (chargeable_basis * fee_rate_percent, ex GST)
     *  gst_percent         float  (e.g. 10)
     *  gst_amount          float
     *  total_fee_deducted  float  (fee_amount + gst_amount)
     *
     *  gross_captured      float  (total the client was charged, incl GST — e.g. 1100.01)
     *  net_payout          float  (gross_captured - total_fee_deducted)
     */
    public function generatePdf(array $data): string
    {
        $pdf = Pdf::loadHTML($this->buildHtml($data))->setPaper('a4', 'portrait');
        return $pdf->output();
    }

    private function buildHtml(array $d): string
    {
        $feeInvoiceNumber = htmlspecialchars($d['fee_invoice_number']);
        $date             = htmlspecialchars($d['date']);
        $jobRef           = htmlspecialchars($d['job_ref']);
        $bookingLabel     = htmlspecialchars($d['client_booking_label'] ?? '');
        $serviceLabel     = htmlspecialchars($d['service_label'] ?? 'Automated Timesheet & Geofence Verification');

        $contractor = $d['contractor'] ?? [];
        $contractorName    = htmlspecialchars($contractor['name'] ?? 'Resource Partner');
        $contractorAbn     = htmlspecialchars($contractor['abn'] ?? 'N/A');
        $contractorAttn    = htmlspecialchars($contractor['attn'] ?? 'Finance Team');
        $contractorAddress = htmlspecialchars($contractor['address'] ?? '');

        $chargeableBasis  = '$' . number_format((float) $d['chargeable_basis'], 2);
        $feeRatePercent   = number_format((float) $d['fee_rate_percent'], 1);
        $feeAmount        = '$' . number_format((float) $d['fee_amount'], 2);
        $gstPercent       = (float) ($d['gst_percent'] ?? 10);
        $gstAmount        = '$' . number_format((float) $d['gst_amount'], 2);
        $totalFeeDeducted = '$' . number_format((float) $d['total_fee_deducted'], 2);

        $grossCaptured = number_format((float) $d['gross_captured'], 2);
        $totalFeePlain = number_format((float) $d['total_fee_deducted'], 2);
        $netPayoutPlain = number_format((float) $d['net_payout'], 2);
        $netPayout     = '$' . $netPayoutPlain;

        $settlementSummary = "Gross transaction proceeds (\${$grossCaptured} incl. GST) captured via Stripe. "
            . "Staffoo platform service fee (\${$totalFeePlain} incl. GST) deducted at source. "
            . "Net balance of \${$netPayoutPlain} remitted to your bank account via Stripe Connect.";

        $css = '
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size:10px; color:#111827; }

        .header { padding:20px 22px 14px; }
        .header table { width:100%; }
        .header td { vertical-align:top; }
        .brand { font-size:20px; font-weight:bold; color:#14243D; }
        .doc-subtitle { font-size:9px; font-weight:bold; color:#0A7C6E; letter-spacing:0.4px; margin-top:2px; }
        .inv-number { font-size:13px; font-weight:bold; color:#0A7C6E; text-align:right; }
        .inv-date { font-size:9px; color:#6B7280; text-align:right; margin-top:2px; }

        .accent-line { height:2px; background:#0A7C6E; margin:0 22px 14px; }

        .parties { padding:0 22px 14px; }
        .parties table { width:100%; }
        .parties td { vertical-align:top; width:50%; padding-right:16px; }
        .party-label { font-size:8.5px; font-weight:bold; color:#6B7280; letter-spacing:0.5px; margin-bottom:4px; }
        .party-name { font-size:11px; font-weight:bold; color:#14243D; margin-bottom:2px; }
        .party-line { font-size:9px; color:#374151; line-height:1.6; }

        .table-wrap { padding:0 22px; }
        .st { width:100%; border-collapse:collapse; font-size:9px; }
        .st thead tr { background:#14243D; color:#FFFFFF; }
        .st thead th { padding:8px 8px; text-align:left; font-size:8.5px; letter-spacing:0.3px; }
        .st tbody td { padding:7px 8px; border-bottom:1px solid #E5E7EB; vertical-align:top; }
        .item-desc { font-weight:bold; color:#111827; }
        .item-sub { font-size:8px; color:#6B7280; margin-top:2px; }

        .totals-wrap { padding:12px 22px 0; }
        .tt { width:60%; margin-left:40%; border-collapse:collapse; font-size:9.5px; }
        .tt td { padding:4px 4px; }
        .tt .lbl { color:#374151; text-align:right; padding-right:16px; }
        .tt .amt { text-align:right; }
        .grand td { font-weight:bold; color:#14243D; font-size:11px;
                    border-top:2px solid #0A7C6E; padding-top:8px; }
        .payout-row td { font-weight:bold; color:#0A7C6E; font-size:11px; padding-top:6px; }

        .summary-box { margin:20px 22px 0; background:#EFF6FF; border-left:3px solid #0A7C6E;
                        padding:10px 14px; font-size:8.5px; color:#374151; line-height:1.6; }
        .summary-box strong { color:#14243D; }

        .footer { padding:16px 22px 10px; text-align:center; font-size:9px; color:#9CA3AF; }
        ';

        $html  = "<!DOCTYPE html><html lang='en'>";
        $html .= "<head><meta charset='UTF-8'><style>{$css}</style></head><body>";

        // Header
        $html .= "<div class='header'><table><tr>";
        $html .= "<td><div class='brand'>STAFFOO</div><div class='doc-subtitle'>PLATFORM SERVICE FEE TAX INVOICE</div></td>";
        $html .= "<td><div class='inv-number'>INVOICE #{$feeInvoiceNumber}</div><div class='inv-date'>Date: {$date}</div></td>";
        $html .= "</tr></table></div>";
        $html .= "<div class='accent-line'></div>";

        // Parties
        $html .= "<div class='parties'><table><tr>";
        $html .= "<td>";
        $html .= "<div class='party-label'>FROM (TECHNOLOGY PROVIDER)</div>";
        $html .= "<div class='party-name'>Capital Services Pty Ltd (t/a Staffoo)</div>";
        $html .= "<div class='party-line'>ABN: 48 613 317 838</div>";
        $html .= "<div class='party-line'>Email: accounts@staffoo.com.au | Web: staffoo.com.au</div>";
        $html .= "<div class='party-line'>Tarneit VIC 3029, Australia</div>";
        $html .= "</td>";
        $html .= "<td>";
        $html .= "<div class='party-label'>BILLED TO (RESOURCE PARTNER)</div>";
        $html .= "<div class='party-name'>{$contractorName}</div>";
        $html .= "<div class='party-line'>ABN: {$contractorAbn}</div>";
        $html .= "<div class='party-line'>Attn: {$contractorAttn}</div>";
        $html .= "<div class='party-line'>{$contractorAddress}</div>";
        $html .= "</td>";
        $html .= "</tr></table></div>";

        // Line item table
        $html .= "<div class='table-wrap'><table class='st'><thead><tr>";
        $html .= "<th style='width:34%;'>Description</th>";
        $html .= "<th style='width:18%;text-align:center;'>Job Ref #</th>";
        $html .= "<th style='width:18%;text-align:right;'>Chargeable Basis</th>";
        $html .= "<th style='width:12%;text-align:right;'>Fee Rate</th>";
        $html .= "<th style='width:18%;text-align:right;'>Fee (AUD)</th>";
        $html .= "</tr></thead><tbody>";
        $html .= "<tr>";
        $html .= "<td><div class='item-desc'>Staffoo Marketplace &amp; WFM Platform Service Fee</div>";
        $html .= "<div class='item-sub'>Client Booking: {$bookingLabel} | {$serviceLabel}</div></td>";
        $html .= "<td style='text-align:center;'>#{$jobRef}</td>";
        $html .= "<td style='text-align:right;'>{$chargeableBasis}</td>";
        $html .= "<td style='text-align:right;'>{$feeRatePercent}%</td>";
        $html .= "<td style='text-align:right;'>{$feeAmount}</td>";
        $html .= "</tr>";
        $html .= "</tbody></table></div>";

        // Totals
        $html .= "<div class='totals-wrap'><table class='tt'>";
        $html .= "<tr><td class='lbl'>Platform Fee (ex. GST)</td><td class='amt'>{$feeAmount}</td></tr>";
        $html .= "<tr><td class='lbl'>GST ({$gstPercent}%)</td><td class='amt'>{$gstAmount}</td></tr>";
        $html .= "<tr class='grand'><td class='lbl'>Total Fee Deducted (incl. GST)</td><td class='amt'>{$totalFeeDeducted}</td></tr>";
        $html .= "<tr class='payout-row'><td class='lbl'>Net Payout Remitted to Partner</td><td class='amt'>{$netPayout}</td></tr>";
        $html .= "</table></div>";

        // Settlement summary
        $html .= "<div class='summary-box'><strong>Settlement Summary:</strong> {$settlementSummary}</div>";

        $html .= "<div class='footer'>Capital Services Pty Ltd (t/a Staffoo) — ABN 48 613 317 838</div>";
        $html .= "</body></html>";

        return $html;
    }
}