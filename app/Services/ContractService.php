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
     *  One "STATE — Charge Rates" section is rendered per entry — this is how
     *  every state the contractor has an approved rate card for shows up on
     *  the single contract, instead of only the state just approved.
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
     * Render grouped categories as compact rate cards, ALL in a single row
     * per state. Cards are sized down (smaller padding/type) so an entire
     * state's category set fits on one line without wrapping.
     */
    private function renderRateCards(array $categories): string
    {
        $count = count($categories);
        if ($count === 0) {
            return '';
        }

        $widthPct = round(100 / $count, 4);

        $rateHtml = "<table class='card-row'><tr>";
        foreach ($categories as $categoryName => $areas) {
            $metroValue    = '$' . number_format($areas['Metro'] ?? 0, 2);
            $regionalValue = '$' . number_format($areas['Regional'] ?? 0, 2);

            $rateHtml .= "
            <td class='rate-card' width='{$widthPct}%'>
                <div class='rate-title'>" . htmlspecialchars($categoryName) . "</div>
                <div class='rate-label'><span class='icon-dot'></span>METRO</div>
                <div class='rate-value'>{$metroValue}</div>
                <div style='height:1px;'></div>
                <div class='rate-label'><span class='icon-tri'></span>REGIONAL</div>
                <div class='rate-value'>{$regionalValue}</div>
            </td>";
        }
        $rateHtml .= "</tr></table>";

        return $rateHtml;
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

        $rateSectionsHtml = '';
        foreach ($stateBlocks as $block) {
            $blockState = htmlspecialchars(strtoupper($block['state'] ?? ''));
            $categories = $this->groupRatesByCategory($block['rates'] ?? []);
            $rateSectionsHtml .= "<div class='section-title'>{$blockState} — Charge Rates</div>";
            $rateSectionsHtml .= $this->renderRateCards($categories);
        }

        // ── CSS — spacing kept generous throughout. Rate cards sit in a
        // single compact row per state (smaller padding/type so the full
        // category set for one state fits on one line without wrapping).
        // .sign-box still has page-break-inside:avoid, so if it doesn't fit
        // under the rate cards it drops to the next page as a whole block.
        // Section blocks use page-break-inside:avoid so a heading is never
        // orphaned from its clauses across a page break.
        //
        // NOTE ON PAGE MARGINS: a manual thead/tfoot "spacer table" wrapper
        // was tried here to force per-page margins, but it broke
        // pagination — dompdf does not reliably paginate a table cell that
        // itself contains other tables (the header table, the rate-card
        // tables), and content was silently dropped after a certain point.
        // @page margin is the correct, natively-supported mechanism for
        // per-page margins in dompdf and does not have this problem — back
        // to using it here. If a build ever appears to ignore it, clear
        // compiled views/config (`php artisan view:clear && config:clear`)
        // before assuming dompdf itself isn't applying it.
        $css = '
        @page {
            margin-top: 46px;
            margin-right: 50px;
            margin-bottom: 46px;
            margin-left: 50px;
        }
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #1a1a2e;
            line-height: 1.38;
            background: #ffffff;
        }
        /* Horizontal/vertical spacing comes from @page above, so the
           wrapper itself carries no extra padding — otherwise page 1 would
           get double padding (page margin + wrapper padding) while later
           pages would only get the page margin. */
        .wrapper { padding: 0; max-width: 800px; margin: 0 auto; position: relative; }

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

        /* Rate cards — table-based (dompdf does not reliably support
           flexbox). One row per state, sized down so every category for
           that state fits on a single line. */
        .card-row { width: 100%; border-collapse: separate; border-spacing: 3px; margin-bottom: 2px; page-break-inside: avoid; }
        .rate-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 4px 5px;
            vertical-align: top;
            page-break-inside: avoid;
        }
        .rate-title {
            font-size: 7.8px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .rate-label {
            font-size: 5.3px;
            font-weight: 600;
            color: #64748b;
            letter-spacing: 0.3px;
            margin-bottom: 1px;
        }
        .icon-dot {
            display: inline-block; width: 3px; height: 3px; border-radius: 50%;
            background: #0A7C6E; margin-right: 2px;
        }
        .icon-tri {
            display: inline-block; width: 0; height: 0;
            border-left: 2.5px solid transparent; border-right: 2.5px solid transparent;
            border-bottom: 3.5px solid #14243D; margin-right: 2px;
        }
        .rate-value { font-size: 9px; font-weight: bold; color: #0A7C6E; }

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
        $html .= "<td><div class='header-title'>Resource Partner &amp; Subcontractor Agreement</div><div class='header-subtitle'>Operated by Capital Services Pty Ltd &middot; Issued via Staffoo Platform &middot;</div></td>";
        $html .= "<td class='header-meta'>Contract #: {$contractNumber}<br>Date: {$date}</td>";
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

        // 5. Platform Fees, Automated Deductions & Insurance
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

        // Rate schedule — one compact single-row section per approved state
        $html .= $rateSectionsHtml;

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

}