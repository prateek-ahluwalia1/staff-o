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
     *  title, effective_from,
     *
     *  states => [
     *      ['state' => 'NSW', 'rates' => [ ['label' => 'Default Metro Mon–Fri Day', 'value' => 25.00], ... ]],
     *      ['state' => 'VIC', 'rates' => [ ... ]],
     *      ...
     *  ]
     *  Every state the contractor has an approved rate card for is rendered
     *  as ONE ROW in a single rate table (not a separate card section per
     *  state) — keeps the document compact even with many states.
     *
     *  Back-compat: a caller can still pass the old single-state shape
     *  (`state` + `rates` at the top level) and it will be treated as a
     *  one-entry `states` list.
     *
     *  Optional (only present once signed):
     *  signature_name, signature_image_base64, signed_at, signed_ip
     */
    public function generatePdf(array $data): string
    {
        $pdf = Pdf::loadHTML($this->buildHtml($data))->setPaper('a4', 'portrait');
        return $pdf->output();
    }

    /**
     * Group a flat list of rate rows into Metro/Regional pairs keyed by
     * category (e.g. "Mon–Fri Day" => ['Metro' => 25.00, 'Regional' => 30.00]).
     */
    private function groupRatesByCategory(array $rates): array
    {
        $categories = [];
        foreach ($rates as $rate) {
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

        return $categories;
    }

    /**
     * Render ONE table covering every state — each state is a single row,
     * with a fixed column per rate category (Mon–Fri Day/Night, Saturday,
     * Sunday, Public Holiday), each cell showing Metro + Regional stacked.
     * Replaces the old per-state card-grid layout (which repeated a whole
     * card section per state and grew tall fast with multiple states).
     */
    private function renderRateTable(array $stateBlocks): string
    {
        $categoryOrder = ['Mon–Fri Day', 'Mon–Fri Night', 'Saturday', 'Sunday', 'Public Holiday'];

        $headerCells = '';
        foreach ($categoryOrder as $cat) {
            $headerCells .= "<th class='rate-cell-h'>" . htmlspecialchars($cat) . "</th>";
        }

        $rows = '';
        foreach ($stateBlocks as $i => $block) {
            $rowBg = ($i % 2 === 0) ? '#FFFFFF' : '#F8FAFC';
            $stateName = htmlspecialchars(strtoupper($block['state'] ?? ''));
            $categories = $this->groupRatesByCategory($block['rates'] ?? []);

            $rows .= "<tr style='background:{$rowBg};'><td class='state-cell'>{$stateName}</td>";
            foreach ($categoryOrder as $cat) {
                $metro    = $categories[$cat]['Metro'] ?? 0;
                $regional = $categories[$cat]['Regional'] ?? 0;
                $rows .= "<td class='rate-cell'>"
                       . "<div class='rate-cell-line'><span class='rc-label'>M</span> $" . number_format($metro, 2) . "</div>"
                       . "<div class='rate-cell-line'><span class='rc-label'>R</span> $" . number_format($regional, 2) . "</div>"
                       . "</td>";
            }
            $rows .= "</tr>";
        }

        return "<table class='rate-table'><thead><tr><th class='state-cell-h'>State</th>{$headerCells}</tr></thead><tbody>{$rows}</tbody></table>";
    }

    private function buildHtml(array $d): string
    {
        $contractNumber = htmlspecialchars($d['contract_number']);
        $date           = htmlspecialchars($d['date']);
        $contractorName = htmlspecialchars($d['contractor_name']);
        $contractorAbn  = htmlspecialchars($d['contractor_abn'] ?? 'N/A');
        $effectiveFrom  = htmlspecialchars($d['effective_from'] ?? 'the date of signing');

        $isSigned      = !empty($d['signature_name']) || !empty($d['signature_image_base64']);
        $signatureName = htmlspecialchars($d['signature_name'] ?? '');
        $signedAt      = htmlspecialchars($d['signed_at'] ?? '');
        $signedIp      = htmlspecialchars($d['signed_ip'] ?? '');
        $signatureImageBase64 = $d['signature_image_base64'] ?? null;
        if ($signatureImageBase64 && !str_starts_with($signatureImageBase64, 'data:image')) {
            $signatureImageBase64 = 'data:image/png;base64,' . $signatureImageBase64;
        }

        // ── One contract, every approved state on it. Accepts the new
        // multi-state 'states' shape, or falls back to the old single
        // 'state' + 'rates' shape wrapped into a one-entry list. ──────────
        $stateBlocks = $d['states'] ?? [
            ['state' => $d['state'] ?? '', 'rates' => $d['rates'] ?? []],
        ];

        $rateTableHtml = $this->renderRateTable($stateBlocks);
        $sealSvg = $this->buildSealSvg();

        // ── CSS ──────────────────────────────────────────────────────────
        $css = '
        /* Uniform padding on every side, every page — @page margin applies
           to EVERY page dompdf renders (page 1 and any page after a break),
           so this alone gives consistent spacing without needing separate
           wrapper padding that would otherwise double up on page 1. */
        @page { margin: 28px; }
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #1a1a2e;
            line-height: 1.38;
            background: #ffffff;
        }
        .wrapper { max-width: 800px; margin: 0 auto; }

        /* Header */
        .header {
            border-bottom: 3px solid #0A7C6E;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }
        .header-title { font-size: 17px; font-weight: bold; color: #1a1a2e; }
        .header-subtitle { font-size: 9.5px; color: #6B7280; margin-top: 2px; }
        .header-meta { font-size: 9px; color: #6B7280; text-align: right; }

        /* Content */
        .section-title { font-size: 12.5px; font-weight: bold; color: #0A7C6E; margin: 11px 0 5px; }
        .clause-block { margin-bottom: 8px; page-break-inside: avoid; }
        .clause-heading { font-size: 10.2px; font-weight: bold; color: #1a1a2e; margin-bottom: 2px; }
        p { margin-bottom: 7px; text-align: justify; }
        .clause-list { margin: 4px 0 10px 18px; }
        .clause-list li { margin-bottom: 4px; }

        /* Rate table — one row per state (dompdf repeats <thead> across
           page breaks automatically, so a long state list still shows the
           column headers on every page it spans). */
        .rate-table { width: 100%; border-collapse: collapse; font-size: 8.5px; margin-top: 4px; }
        .rate-table thead th {
            background: #0A7C6E; color: #fff; padding: 7px 6px; font-size: 8px;
            text-align: center; letter-spacing: 0.2px;
        }
        .state-cell-h { text-align: left !important; }
        .rate-table tbody td { padding: 6px 6px; border-bottom: 1px solid #E5E7EB; text-align: center; vertical-align: top; }
        .state-cell { font-weight: bold; color: #0f172a; text-align: left; font-size: 9.5px; }
        .rate-cell-line { font-size: 8px; color: #0A7C6E; font-weight: 600; white-space: nowrap; }
        .rc-label { color: #64748b; font-weight: 600; margin-right: 3px; }

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

        .seal-cell { width: 80px; text-align: right; vertical-align: top; }
        ';

        $html  = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><style>{$css}</style></head><body>";
        $html .= "<div class='wrapper'>";

        
        $html .= "<div class='header'><table style='width:100%;'><tr>";
        $html .= "<td><div class='header-title'>Resource Partner &amp; Subcontractor Agreement</div><div class='header-subtitle'>Operated by Capital Services Pty Ltd &middot; Issued via Staffoo Platform &middot;</div></td>";
        $html .= "<td class='header-meta'>Contract #: {$contractNumber}<br>Date: {$date}</td>";
        $html .= "<td class='seal-cell'>{$sealSvg}</td>";
        $html .= "</tr></table></div>";

        // Parties
        $html .= "<p>This Resource Partner &amp; Subcontractor Agreement (\"Agreement\") governs the commercial and "
               . "operational relationship between <strong>Capital Services Pty Ltd</strong> (ABN 48 613 317 838, "
               . "trading as \"Staffoo\") and independent licensed security providers, vendors, and staffing "
               . "agencies (\"Resource Partner\") accepting shift allocations and providing security personnel "
               . "through the Staffoo platform.</p>";

        // 1. Licensing, Statutory Warranties & Compliance
        $html .= "<div class='section-title'>1. Licensing, Statutory Warranties &amp; Compliance</div>";
        $html .= "<div class='clause-block'>";
        $html .= "<div class='clause-heading'>1.1 Corporate Licensing &amp; Registration</div>";
        $html .= "<p>The Resource Partner warrants that it holds and maintains at all times all necessary Master "
               . "Security Licences, Labour Hire Licences (where mandated by state legislation, including Victoria, "
               . "Queensland, and South Australia), and corporate registrations required to legally supply security "
               . "personnel in all operating jurisdictions.</p>";
        $html .= "<div class='clause-heading'>1.2 Personnel Qualifications &amp; VEVO Verification</div>";
        $html .= "<p>The Resource Partner warrants that all guards assigned to Staffoo shifts possess valid, current "
               . "individual security licences, valid First Aid/CPR certifications, Responsible Service of Alcohol "
               . "(RSA, where applicable), and legal Australian working rights verified via VEVO.</p>";
        $html .= "</div>";

        // 2. Operational Standards, Uniforms & Shift Punctuality
        $html .= "<div class='section-title'>2. Operational Standards, Uniforms &amp; Shift Punctuality</div>";
        $html .= "<div class='clause-block'>";
        $html .= "<div class='clause-heading'>2.1 Standard Uniform &amp; Presentation Requirements</div>";
        $html .= "<p>The Resource Partner must ensure that all deployed personnel arrive on site wearing a neat, "
               . "professional standard black security uniform (black trousers, black collared security shirt or "
               . "blazer, and clean black safety footwear). Personnel must wear a high-visibility (hi-vis) safety "
               . "vest where required by site safety protocols, client briefs, or WHS laws.</p>";
        $html .= "<div class='clause-heading'>2.2 Mandatory 15-Minute Early Arrival</div>";
        $html .= "<p>To ensure proper site handover, safety briefings, and timely clock-in, the Resource Partner "
               . "must ensure that all personnel arrive on site at least fifteen (15) minutes prior to the "
               . "scheduled shift start time.</p>";
        $html .= "<div class='clause-heading'>2.3 App Usage &amp; Attendance Logging</div>";
        $html .= "<p>All time, attendance, site check-ins, break logging, and duress checks must be completed "
               . "exclusively through the Staffoo mobile application. Unauthorized sub-subcontracting or secondary "
               . "outsourcing of assigned shifts is strictly prohibited.</p>";
        $html .= "</div>";

        // 3. Employment Obligations, Fair Work & WHS Compliance
        $html .= "<div class='section-title'>3. Employment Obligations, Fair Work &amp; WHS Compliance</div>";
        $html .= "<div class='clause-block'>";
        $html .= "<div class='clause-heading'>3.1 Direct Employment Relationship</div>";
        $html .= "<p>The Resource Partner acknowledges that it is the sole employer or principal contractor of all "
               . "personnel deployed. No employment, agency, or joint-venture relationship exists between Staffoo "
               . "and the Resource Partner's personnel.</p>";
        $html .= "<div class='clause-heading'>3.2 Modern Award &amp; Fatigue Management</div>";
        $html .= "<p>The Resource Partner warrants strict compliance with the Security Services Industry Award 2020 "
               . "[MA000016], the Fair Work Act 2009 (Cth), Superannuation Guarantee laws, and state Workers' "
               . "Compensation laws. This includes paying mandatory minimum hourly rates, penalty rates, and "
               . "enforcing fatigue limits (including mandatory minimum 8-to-10 hour breaks between shifts).</p>";
        $html .= "</div>";

        // 4. Client Deductions, Negligence Liability & Financial Set-Off
        $html .= "<div class='section-title'>4. Client Deductions, Negligence Liability &amp; Financial Set-Off</div>";
        $html .= "<div class='clause-block'>";
        $html .= "<div class='clause-heading'>4.1 Liability for Negligence &amp; Client Deductions</div>";
        $html .= "<p>If a Client reduces, deducts, or refuses payment for shift hours due to late arrival, "
               . "abandonment, uniform non-compliance, misconduct, breach of site instructions, or negligence by "
               . "the Resource Partner or its personnel, the Resource Partner shall be held fully responsible for "
               . "all resulting financial losses, damages, and administrative costs suffered by Staffoo.</p>";
        $html .= "<div class='clause-heading'>4.2 Right of Recovery &amp; Set-Off</div>";
        $html .= "<p>The Resource Partner expressly authorizes Staffoo to deduct, withhold, or set off the amount "
               . "of any client payment deductions or loss claims directly from current or future funds held in "
               . "the Resource Partner's Stripe account or pending payout ledger.</p>";
        $html .= "</div>";

        // 5. Platform Fees & Automated Deductions
        $html .= "<div class='section-title'>5. Platform Fees &amp; Automated Deductions</div>";
        $html .= "<div class='clause-block'>";
        $html .= "<div class='clause-heading'>5.1 Platform Service Fee</div>";
        $html .= "<p>In consideration for access to the Staffoo marketplace, WFM tools, and automated billing "
               . "engine, the Resource Partner agrees to pay Staffoo the agreed Platform Service Fee per shift.</p>";
        $html .= "<div class='clause-heading'>5.2 Automated Stripe Payout Deductions</div>";
        $html .= "<p>The Resource Partner authorizes Staffoo and its payment gateway provider (Stripe) to "
               . "automatically deduct the Platform Service Fee from captured client funds upon job completion "
               . "before remitting the net balance to the Resource Partner's bank account.</p>";
        $html .= "</div>";

        // 6. Mandatory Insurance Requirements
        $html .= "<div class='section-title'>6. Mandatory Insurance Requirements</div>";
        $html .= "<div class='clause-block'>";
        $html .= "<p>The Resource Partner must maintain at all times:</p>";
        $html .= "<ul class='clause-list'>";
        $html .= "<li><strong>Public &amp; Products Liability Insurance:</strong> Minimum coverage of $10,000,000 "
               . "per claim (or $20,000,000 where specified by site brief).</li>";
        $html .= "<li><strong>Workers' Compensation Insurance:</strong> Statutory coverage for all employees in "
               . "accordance with relevant state laws.</li>";
        $html .= "</ul>";
        $html .= "</div>";

        // 7. Governing Law
        $html .= "<div class='section-title'>7. Governing Law</div>";
        $html .= "<div class='clause-block'>";
        $html .= "<p>This Agreement is governed by the laws of the State of Victoria, Australia. Both parties "
               . "submit to the exclusive jurisdiction of the courts operating in Victoria.</p>";
        $html .= "</div>";

        // Rate schedule — ONE table, one row per approved state
        $html .= "<div class='section-title'>Charge Rates — All Approved States</div>";
        $html .= $rateTableHtml;

         // Signature — unchanged
        $html .= "<div class='sign-box'>";
        if ($isSigned) {
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

    /**
     * Builds an inline SVG scalloped-edge seal/badge with "STAFFOO" text.
     * Returns raw SVG markup (not a data URI) — inline SVG renders more
     * reliably in dompdf than an <img> with a base64-encoded SVG source.
     */
    private function buildSealSvg(): string
    {
        $cx = 45;
        $cy = 45;
        $outerR = 42;
        $innerR = 36;
        $teeth = 22;

        $points = [];
        for ($i = 0; $i < $teeth * 2; $i++) {
            $angle = (M_PI * 2 / ($teeth * 2)) * $i;
            $r = ($i % 2 === 0) ? $outerR : $innerR;
            $x = $cx + $r * cos($angle);
            $y = $cy + $r * sin($angle);
            $points[] = round($x, 1) . ',' . round($y, 1);
        }
        $pointsAttr = implode(' ', $points);

        return "
        <svg width='72' height='72' viewBox='0 0 90 90' xmlns='http://www.w3.org/2000/svg'>
            <defs>
                <linearGradient id='sealGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
                    <stop offset='0%' stop-color='#DC2626' />
                    <stop offset='100%' stop-color='#7F1D1D' />
                </linearGradient>
            </defs>
            <polygon points='{$pointsAttr}' fill='url(#sealGrad)' stroke='#7F1D1D' stroke-width='1' />
            <circle cx='{$cx}' cy='{$cy}' r='30' fill='none' stroke='#FFFFFF' stroke-width='1' stroke-opacity='0.7' />
            <text x='{$cx}' y='42' text-anchor='middle' font-family='DejaVu Sans, sans-serif'
                  font-size='11' font-weight='bold' fill='#FFFFFF' letter-spacing='0.5'>STAFFOO</text>
            <text x='{$cx}' y='55' text-anchor='middle' font-family='DejaVu Sans, sans-serif'
                  font-size='6' fill='#FCA5A5' letter-spacing='1.5'>CERTIFIED</text>
        </svg>";
    }
}