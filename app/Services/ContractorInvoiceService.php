<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;

class ContractorInvoiceService
{
    /**
     * Generate a contractor-branded invoice PDF and return raw bytes.
     * Same layout/design as InvoiceService, but the header/footer show
     * the contractor's own business name and ABN instead of STAFFOO.
     *
     * Expected $data keys:
     *  invoice_number, date, client_name, client_email,
     *  payment_intent_id, payment_option, location,
     *  shifts  [ {start, end, numberOfGuards, hours, amount} … ],
     *  base_total, discount, service_fee, grand_total, amount_charged, balance,
     *  contractor_name, contractor_abn
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
            $rowBg  = ($i % 2 === 0) ? '#F7F9FC' : '#FFFFFF';
            $num    = $i + 1;
            $start  = htmlspecialchars($shift['start']);
            $end    = htmlspecialchars($shift['end']);
            $guards = (int) $shift['numberOfGuards'];
            $hours  = (float) $shift['hours'];
            $amount = '$' . number_format((float) $shift['amount'], 2);

            $shiftRows .= "
            <tr style='background:{$rowBg};'>
                <td style='text-align:center;'>{$num}</td>
                <td>{$start}</td>
                <td>{$end}</td>
                <td style='text-align:center;'>{$guards}</td>
                <td style='text-align:center;'>{$hours}</td>
                <td style='text-align:right;'>{$amount}</td>
            </tr>";
        }

        // ── Scalars ───────────────────────────────────────────────────────
        $invoiceNumber = htmlspecialchars($d['invoice_number']);
        $date          = htmlspecialchars($d['date']);
        $clientName    = htmlspecialchars($d['client_name']);
        $clientEmail   = htmlspecialchars($d['client_email']);
        $paymentRef    = htmlspecialchars($d['payment_intent_id'] ?? 'N/A');
        $location      = htmlspecialchars($d['location'] ?? 'N/A');
        $paymentOption = ucfirst($d['payment_option']) . ' Payment';
        $discountLabel = ($d['payment_option'] === 'full')
            ? 'Discount (5% full-payment)'
            : 'Discount';

        // Contractor branding (replaces STAFFOO)
        $contractorName = htmlspecialchars($d['contractor_name'] ?? 'Contractor');
        $contractorAbn  = htmlspecialchars($d['contractor_abn'] ?? 'N/A');

        $baseTotal      = '$' . number_format((float) $d['base_total'], 2);
        $discount       = '$' . number_format((float) $d['discount'], 2);
        $baseFinalTotal = '$' . number_format((float) $d['service_fee'] + (float) $d['base_total'], 2);
        $serviceFee     = '$' . number_format((float) $d['service_fee'], 2);
        $grandTotal     = '$' . number_format((float) $d['grand_total'], 2);
        $amtCharged     = '$' . number_format((float) $d['amount_charged'], 2);
        $balance        = '$' . number_format((float) $d['balance'], 2);

        // ── CSS (same design as InvoiceService) ─────────────────────────────
        $css = '
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size:10px; color:#111827; }
        .header { background:#0A7C6E; padding:18px 22px; }
        .header table { width:100%; }
        .header td { vertical-align:middle; }
        .logo { font-size:20px; font-weight:bold; color:#FFFFFF; letter-spacing:0.5px; }
        .inv-title { font-size:20px; font-weight:bold; color:#FFFFFF; text-align:right; }
        .meta { padding:14px 22px 6px; }
        .meta table { width:100%; }
        .meta td { vertical-align:top; line-height:1.8; }
        .meta .right { text-align:right; }
        .accent-line { height:3px; background:#F0A500; margin:0 22px; }
        .grey-line   { height:1px; background:#D1D5DB; margin:6px 22px; }
        .section-title { padding:10px 22px 4px; font-size:12px; font-weight:bold; color:#0A7C6E; }
        .table-wrap { padding:0 22px; }
        .st { width:100%; border-collapse:collapse; font-size:9px; }
        .st thead tr { background:#0A7C6E; color:#FFFFFF; }
        .st thead th { padding:7px 6px; text-align:left; }
        .st tbody td { padding:6px 6px; border-bottom:1px solid #E5E7EB; }
        .tt { width:100%; border-collapse:collapse; font-size:9.5px; }
        .tt td { padding:4px 4px; }
        .tt .lbl { color:#6B7280; text-align:right; padding-right:16px; width:78%; }
        .tt .amt { text-align:right; }
        .grand td { font-weight:bold; color:#0A7C6E; font-size:11px;
                    border-top:2px solid #F0A500; background:#F7F9FC; padding-top:6px; }
        .charged td { font-weight:bold; color:#0A7C6E; }
        .balance td { font-weight:bold; color:#D97706; }
        .footer { padding:14px 22px 10px; text-align:center; font-size:10px; color:#9CA3AF; }
        .badge { background:#ECFDF5; color:#065F46; border:1px solid #6EE7B7;
                 padding:2px 8px; font-size:8px; }
        ';

        // ── Final HTML ────────────────────────────────────────────────────
        $html  = "<!DOCTYPE html><html lang='en'>";
        $html .= "<head><meta charset='UTF-8'><style>{$css}</style></head><body>";

        // Header — contractor branding
        $html .= "<div class='header'><table><tr>";
        $html .= "<td><div class='logo'>{$contractorName}</div></td>";
        $html .= "<td class='inv-title'>INVOICE</td>";
        $html .= "</tr></table></div>";

        // Meta
        $html .= "<div class='meta'><table><tr>";
        $html .= "<td><strong>Bill To:</strong><br>{$clientName}<br>{$clientEmail}</td>";
        $html .= "<td class='right'>";
        $html .= "<strong>Invoice #:</strong> {$invoiceNumber}<br>";
        $html .= "<strong>Date:</strong> {$date}<br>";
        $html .= "<strong>Payment Option:</strong> {$paymentOption}<br>";
        $html .= "<strong>Payment Ref:</strong> {$paymentRef}<br>";
        $html .= "<strong>Site Location:</strong> {$location}";
        $html .= "</td></tr></table></div>";
        $html .= "<div class='accent-line'></div>";

        // Shift table
        $html .= "<div class='section-title'>Shift Details</div>";
        $html .= "<div class='table-wrap'><table class='st'><thead><tr>";
        $html .= "<th style='width:5%;'>#</th>";
        $html .= "<th style='width:26%;'>Start Date</th>";
        $html .= "<th style='width:26%;'>End Date</th>";
        $html .= "<th style='width:12%;text-align:center;'>Guards</th>";
        $html .= "<th style='width:14%;text-align:center;'>Hours</th>";
        $html .= "<th style='width:17%;text-align:right;'>Amount (AUD)</th>";
        $html .= "</tr></thead><tbody>{$shiftRows}</tbody></table></div>";

        $html .= "<div style='height:10px;'></div><div class='grey-line'></div>";

        // Payment breakdown
        $html .= "<div class='section-title'>Payment Breakdown</div>";
        $html .= "<div class='table-wrap'><table class='tt'>";
        $html .= "<tr><td class='lbl'>Subtotal</td><td class='amt'>{$baseTotal}</td></tr>";
        $html .= "<tr><td class='lbl'>Service Fee (15%)</td><td class='amt'>{$serviceFee}</td></tr>";
        $html .= "<tr class='grand'><td class='lbl'>Total Amount</td><td class='amt'>{$baseFinalTotal}</td></tr>";
        $html .= "<tr><td class='lbl'>{$discountLabel}</td><td class='amt' style='color:#D97706;'>- {$discount}</td></tr>";
        $html .= "<tr class='charged'><td class='lbl'>Amount Charged Now</td><td class='amt'>{$amtCharged}</td></tr>";
        $html .= "<tr class='balance'><td class='lbl'>Balance Remaining</td><td class='amt'>{$balance}</td></tr>";
        $html .= "</table></div>";

        $html .= "<div class='grey-line'></div>";

        // Footer — contractor ABN
        $html .= "<div class='footer'>";
        $html .= "<span class='badge'>Payment held via Stripe, and the hold will be released after completion of the shift.</span><br><br>";
        $html .= "Thank you for choosing {$contractorName}.<br>";
        $html .= "ABN: {$contractorAbn}";
        $html .= "</div></body></html>";

        return $html;
    }
}