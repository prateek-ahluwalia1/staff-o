<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;

class ContractService
{
    /**
     * Generate the contract PDF and return raw bytes.
     */
    public function generatePdf(array $data): string
    {
        $html = $this->buildHtml($data);

        $pdf = Pdf::loadHTML($html)
            ->setPaper('a4', 'portrait');

        return $pdf->output();
    }

    /**
     * Group rates into categories and Metro/Regional values.
     */
    private function groupRatesByCategory(array $rates): array
    {
        $categories = [];

        foreach ($rates as $rate) {
            $label = trim($rate['label'] ?? '');
            $value = (float) ($rate['value'] ?? 0);

            if ($label === '') {
                continue;
            }

            $isMetro = stripos($label, 'metro') !== false;
            $area = $isMetro ? 'Metro' : 'Regional';

            $category = trim(
                str_ireplace(
                    ['Default', 'EBA', 'Metro', 'Regional'],
                    '',
                    $label
                )
            );

            $category = trim(
                preg_replace('/\s+/', ' ', $category)
            );

            /*
             * Ignore Saturday/Sunday/Public Holiday night
             * rows because the rate table uses one row per category.
             */
            $collapsed = false;

            foreach ([
                'Saturday',
                'Sunday',
                'Public Holiday'
            ] as $collapsedBase) {

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
     * Render a single rate table for all approved states.
     */
    private function renderRateTable(array $stateBlocks): string
    {
        $categoryOrder = [
            'Mon–Fri Day',
            'Mon–Fri Night',
            'Saturday',
            'Sunday',
            'Public Holiday',
        ];

        $headerCells = '';

        foreach ($categoryOrder as $category) {
            $headerCells .= '
                <th class="rate-header">
                    ' . htmlspecialchars($category) . '
                </th>
            ';
        }

        $rows = '';

        foreach ($stateBlocks as $index => $block) {

            $stateName = htmlspecialchars(
                strtoupper($block['state'] ?? '')
            );

            $categories = $this->groupRatesByCategory(
                $block['rates'] ?? []
            );

            $rowClass = ($index % 2 === 0)
                ? 'rate-row'
                : 'rate-row rate-row-alt';

            $rows .= '
                <tr class="' . $rowClass . '">
                    <td class="state-cell">
                        ' . $stateName . '
                    </td>
            ';

            foreach ($categoryOrder as $category) {

                $metro = $categories[$category]['Metro'] ?? 0;
                $regional = $categories[$category]['Regional'] ?? 0;

                $rows .= '
                    <td class="rate-cell">

                        <div class="rate-line">
                            <span class="rate-label">M</span>
                            <span class="rate-value">
                                $' . number_format($metro, 2) . '
                            </span>
                        </div>

                        <div class="rate-line">
                            <span class="rate-label">R</span>
                            <span class="rate-value">
                                $' . number_format($regional, 2) . '
                            </span>
                        </div>

                    </td>
                ';
            }

            $rows .= '</tr>';
        }

        return '
            <table class="rate-table">
                <thead>
                    <tr>
                        <th class="state-header">State</th>
                        ' . $headerCells . '
                    </tr>
                </thead>

                <tbody>
                    ' . $rows . '
                </tbody>
            </table>

            <div class="rate-note">
                <strong>M</strong> = Metro &nbsp;&nbsp;&nbsp;
                <strong>R</strong> = Regional
            </div>
        ';
    }

    /**
     * Build complete contract HTML.
     */
    private function buildHtml(array $d): string
    {
        $contractNumber = htmlspecialchars(
            $d['contract_number'] ?? ''
        );

        $date = htmlspecialchars(
            $d['date'] ?? ''
        );

        $contractorName = htmlspecialchars(
            $d['contractor_name'] ?? ''
        );

        $contractorAbn = htmlspecialchars(
            $d['contractor_abn'] ?? 'N/A'
        );

        $effectiveFrom = htmlspecialchars(
            $d['effective_from'] ?? 'the date of signing'
        );

        $isSigned =
            !empty($d['signature_name']) ||
            !empty($d['signature_image_base64']);

        $signatureName = htmlspecialchars(
            $d['signature_name'] ?? ''
        );

        $signedAt = htmlspecialchars(
            $d['signed_at'] ?? ''
        );

        $signedIp = htmlspecialchars(
            $d['signed_ip'] ?? ''
        );

        $signatureImageBase64 =
            $d['signature_image_base64'] ?? null;

        if (
            $signatureImageBase64 &&
            !str_starts_with(
                $signatureImageBase64,
                'data:image'
            )
        ) {
            $signatureImageBase64 =
                'data:image/png;base64,' .
                $signatureImageBase64;
        }

        /*
         * Support both:
         *
         * states => [...]
         *
         * and old:
         *
         * state + rates
         */
        $stateBlocks = $d['states'] ?? [
            [
                'state' => $d['state'] ?? '',
                'rates' => $d['rates'] ?? [],
            ],
        ];

        $rateTableHtml =
            $this->renderRateTable($stateBlocks);

        /*
         * IMPORTANT:
         *
         * Use millimetres for @page instead of px.
         * This gives DomPDF much more predictable A4 margins.
         */
        $css = <<<'CSS'

        @page {
            size: A4 portrait;

            /*
             * Top    : 16mm
             * Right  : 15mm
             * Bottom : 17mm
             * Left   : 15mm
             */
            margin: 16mm 15mm 17mm 15mm;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            padding: 0;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9.2px;
            color: #1f2937;
            line-height: 1.55;
            background: #ffffff;
        }

        .wrapper {
            width: 100%;
            margin: 0;
            padding: 0;
        }

        /* =========================================================
           HEADER
        ========================================================= */

        .header {
            width: 100%;
            padding: 0 0 12px 0;
            margin: 0 0 18px 0;
            border-bottom: 2px solid #087f70;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-left {
            width: 68%;
            vertical-align: top;
            padding: 0;
        }

        .header-right {
            width: 32%;
            vertical-align: top;
            text-align: right;
            padding: 2px 0 0 10px;
        }

        .header-title {
            font-size: 17px;
            line-height: 1.25;
            font-weight: bold;
            color: #172033;
            margin: 0 0 5px 0;
        }

        .header-subtitle {
            font-size: 8.5px;
            line-height: 1.4;
            color: #6b7280;
            margin: 0;
        }

        .contract-meta {
            font-size: 8.5px;
            line-height: 1.65;
            color: #4b5563;
        }

        .contract-meta strong {
            color: #172033;
        }

        /* =========================================================
           INTRO / GENERAL TEXT
        ========================================================= */

        .intro {
            margin: 0 0 16px 0;
            padding: 0;
        }

        p {
            margin: 0 0 8px 0;
            padding: 0;
            line-height: 1.55;
            text-align: justify;
        }

        strong {
            color: #172033;
        }

        /* =========================================================
           SECTIONS
        ========================================================= */

        .section {
            margin: 0 0 13px 0;
            padding: 0;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 11.5px;
            line-height: 1.35;
            font-weight: bold;
            color: #087f70;
            margin: 15px 0 8px 0;
            padding: 0 0 5px 0;
            border-bottom: 0.6px solid #d9e5e2;
        }

        .section-title.first {
            margin-top: 0;
        }

        .clause-block {
            margin: 0;
            padding: 0;
        }

        .clause-heading {
            font-size: 9.5px;
            line-height: 1.4;
            font-weight: bold;
            color: #172033;
            margin: 8px 0 3px 0;
            padding: 0;
        }

        .clause-heading:first-child {
            margin-top: 0;
        }

        .clause-list {
            margin: 4px 0 10px 18px;
            padding: 0;
        }

        .clause-list li {
            margin: 0 0 5px 0;
            padding: 0 0 0 3px;
            line-height: 1.5;
        }

        /* =========================================================
           RATE SECTION
        ========================================================= */

        .rate-section {
            margin-top: 16px;
            page-break-inside: avoid;
        }

        .rate-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin: 7px 0 4px 0;
            font-size: 7.7px;
        }

        .rate-table thead {
            display: table-header-group;
        }

        .rate-header,
        .state-header {
            background: #087f70;
            color: #ffffff;
            font-size: 7.5px;
            font-weight: bold;
            line-height: 1.25;
            padding: 8px 4px;
            text-align: center;
            border-right: 0.5px solid #48a89d;
            vertical-align: middle;
        }

        .state-header {
            width: 12%;
            text-align: left;
            padding-left: 8px;
        }

        .rate-header {
            width: 17.6%;
        }

        .rate-row {
            background: #ffffff;
        }

        .rate-row-alt {
            background: #f5f8f8;
        }

        .rate-table tbody tr {
            page-break-inside: avoid;
        }

        .rate-table tbody td {
            border-bottom: 0.5px solid #dfe6e8;
            vertical-align: middle;
            height: 42px;
            padding: 7px 4px;
        }

        .state-cell {
            text-align: left;
            padding-left: 8px !important;
            font-size: 9px;
            font-weight: bold;
            color: #172033;
        }

        .rate-cell {
            text-align: center;
        }

        .rate-line {
            width: 100%;
            white-space: nowrap;
            line-height: 1.7;
        }

        .rate-label {
            display: inline-block;
            width: 12px;
            color: #64748b;
            font-size: 7px;
            font-weight: bold;
        }

        .rate-value {
            color: #087f70;
            font-size: 7.5px;
            font-weight: bold;
        }

        .rate-note {
            font-size: 7px;
            color: #7b8794;
            text-align: right;
            margin: 3px 0 0 0;
        }

        /* =========================================================
           SIGNATURE
        ========================================================= */

        .signature-section {
            margin-top: 18px;
            page-break-inside: avoid;
        }

        .sign-box {
            width: 100%;
            border: 0.8px solid #cbd5dc;
            background: #f8fafb;
            padding: 15px 17px 13px 17px;
            margin: 0;
        }

        .sign-title {
            font-size: 11px;
            line-height: 1.3;
            font-weight: bold;
            color: #172033;
            margin: 0 0 7px 0;
        }

        .sign-description {
            font-size: 8.5px;
            line-height: 1.5;
            color: #374151;
            margin: 0 0 12px 0;
        }

        .sign-table {
            width: 100%;
            border-collapse: collapse;
        }

        .sign-table td {
            vertical-align: middle;
            padding: 5px 0;
        }

        .sign-label-cell {
            width: 24%;
            font-size: 8px;
            font-weight: bold;
            color: #6b7280;
        }

        .sign-value-cell {
            width: 76%;
            font-size: 8.5px;
            color: #172033;
        }

        .unsigned-line {
            display: inline-block;
            width: 225px;
            height: 17px;
            border-bottom: 0.8px solid #9ca3af;
        }

        .signature-image {
            display: block;
            width: auto;
            height: 45px;
            max-width: 240px;
            margin: 0 0 3px 0;
        }

        .signature-line {
            width: 240px;
            border-bottom: 0.8px solid #9ca3af;
        }

        /* =========================================================
           FOOTER
        ========================================================= */

        .footer {
            width: 100%;
            margin: 18px 0 0 0;
            padding: 8px 0 0 0;
            border-top: 0.5px solid #dce3e7;
            text-align: center;
            font-size: 7.5px;
            line-height: 1.4;
            color: #9aa5b1;
        }

        /* =========================================================
           DOMPDF PAGE BREAK HELPERS
        ========================================================= */

        .keep-together {
            page-break-inside: avoid;
        }

        .page-break-before {
            page-break-before: always;
        }

        CSS;

        $html = '
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Resource Partner Agreement</title>

            <style>
                ' . $css . '
            </style>
        </head>

        <body>

            <div class="wrapper">

                <!-- ================= HEADER ================= -->

                <div class="header">

                    <table class="header-table">

                        <tr>

                            <td class="header-left">

                                <div class="header-title">
                                    Resource Partner &amp; Subcontractor Agreement
                                </div>

                                <div class="header-subtitle">
                                    Operated by Capital Services Pty Ltd
                                    &middot;
                                    Issued via Staffoo Platform
                                </div>

                            </td>

                            <td class="header-right">

                                <div class="contract-meta">
                                    <strong>Contract #:</strong>
                                    ' . $contractNumber . '
                                    <br>

                                    <strong>Date:</strong>
                                    ' . $date . '
                                </div>

                            </td>

                        </tr>

                    </table>

                </div>


                <!-- ================= INTRO ================= -->

                <div class="intro">

                    <p>
                        This Resource Partner &amp; Subcontractor Agreement
                        ("Agreement") governs the commercial and operational
                        relationship between
                        <strong>Capital Services Pty Ltd</strong>
                        (ABN 48 613 317 838, trading as "Staffoo")
                        and independent licensed security providers,
                        vendors, and staffing agencies
                        ("Resource Partner") accepting shift allocations
                        and providing security personnel through the Staffoo
                        platform.
                    </p>

                </div>


                <!-- ================= SECTION 1 ================= -->

                <div class="section">

                    <div class="section-title first">
                        1. Licensing, Statutory Warranties &amp; Compliance
                    </div>

                    <div class="clause-block">

                        <div class="clause-heading">
                            1.1 Corporate Licensing &amp; Registration
                        </div>

                        <p>
                            The Resource Partner warrants that it holds and
                            maintains at all times all necessary Master
                            Security Licences, Labour Hire Licences
                            (where mandated by state legislation, including
                            Victoria, Queensland, and South Australia),
                            and corporate registrations required to legally
                            supply security personnel in all operating
                            jurisdictions.
                        </p>

                        <div class="clause-heading">
                            1.2 Personnel Qualifications &amp; VEVO Verification
                        </div>

                        <p>
                            The Resource Partner warrants that all guards
                            assigned to Staffoo shifts possess valid, current
                            individual security licences, valid First Aid/CPR
                            certifications, Responsible Service of Alcohol
                            (RSA, where applicable), and legal Australian
                            working rights verified via VEVO.
                        </p>

                    </div>

                </div>


                <!-- ================= SECTION 2 ================= -->

                <div class="section">

                    <div class="section-title">
                        2. Operational Standards, Uniforms &amp; Shift Punctuality
                    </div>

                    <div class="clause-block">

                        <div class="clause-heading">
                            2.1 Standard Uniform &amp; Presentation Requirements
                        </div>

                        <p>
                            The Resource Partner must ensure that all deployed
                            personnel arrive on site wearing a neat,
                            professional standard black security uniform
                            (black trousers, black collared security shirt
                            or blazer, and clean black safety footwear).
                            Personnel must wear a high-visibility (hi-vis)
                            safety vest where required by site safety
                            protocols, client briefs, or WHS laws.
                        </p>

                        <div class="clause-heading">
                            2.2 Mandatory 15-Minute Early Arrival
                        </div>

                        <p>
                            To ensure proper site handover, safety briefings,
                            and timely clock-in, the Resource Partner must
                            ensure that all personnel arrive on site at least
                            fifteen (15) minutes prior to the scheduled shift
                            start time.
                        </p>

                        <div class="clause-heading">
                            2.3 App Usage &amp; Attendance Logging
                        </div>

                        <p>
                            All time, attendance, site check-ins, break logging,
                            and duress checks must be completed exclusively
                            through the Staffoo mobile application.
                            Unauthorized sub-subcontracting or secondary
                            outsourcing of assigned shifts is strictly
                            prohibited.
                        </p>

                    </div>

                </div>


                <!-- ================= SECTION 3 ================= -->

                <div class="section">

                    <div class="section-title">
                        3. Employment Obligations, Fair Work &amp; WHS Compliance
                    </div>

                    <div class="clause-block">

                        <div class="clause-heading">
                            3.1 Direct Employment Relationship
                        </div>

                        <p>
                            The Resource Partner acknowledges that it is the
                            sole employer or principal contractor of all
                            personnel deployed. No employment, agency, or
                            joint-venture relationship exists between Staffoo
                            and the Resource Partner\'s personnel.
                        </p>

                        <div class="clause-heading">
                            3.2 Modern Award &amp; Fatigue Management
                        </div>

                        <p>
                            The Resource Partner warrants strict compliance
                            with the Security Services Industry Award 2020
                            [MA000016], the Fair Work Act 2009 (Cth),
                            Superannuation Guarantee laws, and state Workers\'
                            Compensation laws. This includes paying mandatory
                            minimum hourly rates, penalty rates, and enforcing
                            fatigue limits (including mandatory minimum
                            8-to-10 hour breaks between shifts).
                        </p>

                    </div>

                </div>


                <!-- ================= SECTION 4 ================= -->

                <div class="section">

                    <div class="section-title">
                        4. Client Deductions, Negligence Liability &amp;
                        Financial Set-Off
                    </div>

                    <div class="clause-block">

                        <div class="clause-heading">
                            4.1 Liability for Negligence &amp; Client Deductions
                        </div>

                        <p>
                            If a Client reduces, deducts, or refuses payment
                            for shift hours due to late arrival, abandonment,
                            uniform non-compliance, misconduct, breach of site
                            instructions, or negligence by the Resource Partner
                            or its personnel, the Resource Partner shall be
                            held fully responsible for all resulting financial
                            losses, damages, and administrative costs suffered
                            by Staffoo.
                        </p>

                        <div class="clause-heading">
                            4.2 Right of Recovery &amp; Set-Off
                        </div>

                        <p>
                            The Resource Partner expressly authorizes Staffoo
                            to deduct, withhold, or set off the amount of any
                            client payment deductions or loss claims directly
                            from current or future funds held in the Resource
                            Partner\'s Stripe account or pending payout ledger.
                        </p>

                    </div>

                </div>


                <!-- ================= SECTION 5 ================= -->

                <div class="section">

                    <div class="section-title">
                        5. Platform Fees &amp; Automated Deductions
                    </div>

                    <div class="clause-block">

                        <div class="clause-heading">
                            5.1 Platform Service Fee
                        </div>

                        <p>
                            In consideration for access to the Staffoo
                            marketplace, WFM tools, and automated billing
                            engine, the Resource Partner agrees to pay Staffoo
                            the agreed Platform Service Fee per shift.
                        </p>

                        <div class="clause-heading">
                            5.2 Automated Stripe Payout Deductions
                        </div>

                        <p>
                            The Resource Partner authorizes Staffoo and its
                            payment gateway provider (Stripe) to automatically
                            deduct the Platform Service Fee from captured
                            client funds upon job completion before remitting
                            the net balance to the Resource Partner\'s bank
                            account.
                        </p>

                    </div>

                </div>


                <!-- ================= SECTION 6 ================= -->

                <div class="section">

                    <div class="section-title">
                        6. Mandatory Insurance Requirements
                    </div>

                    <div class="clause-block">

                        <p>
                            The Resource Partner must maintain at all times:
                        </p>

                        <ul class="clause-list">

                            <li>
                                <strong>
                                    Public &amp; Products Liability Insurance:
                                </strong>
                                Minimum coverage of $10,000,000 per claim
                                (or $20,000,000 where specified by site brief).
                            </li>

                            <li>
                                <strong>
                                    Workers\' Compensation Insurance:
                                </strong>
                                Statutory coverage for all employees in
                                accordance with relevant state laws.
                            </li>

                        </ul>

                    </div>

                </div>


                <!-- ================= SECTION 7 ================= -->

                <div class="section">

                    <div class="section-title">
                        7. Governing Law
                    </div>

                    <div class="clause-block">

                        <p>
                            This Agreement is governed by the laws of the
                            State of Victoria, Australia. Both parties submit
                            to the exclusive jurisdiction of the courts
                            operating in Victoria.
                        </p>

                    </div>

                </div>


                <!-- ================= RATE SCHEDULE ================= -->

                <div class="rate-section keep-together">

                    <div class="section-title">
                        Charge Rates — All Approved States
                    </div>

                    ' . $rateTableHtml . '

                </div>


                <!-- ================= SIGNATURE ================= -->

                <div class="signature-section keep-together">

                    <div class="sign-box">

                        <div class="sign-title">
                            Acknowledgement &amp; Signature
                        </div>

                        <p class="sign-description">
                            By signing below, the Resource Partner confirms
                            they have read, understood, and agree to be bound
                            by the terms of this Agreement, including the rate
                            schedule above.
                        </p>

                        <table class="sign-table">

        ';

        if ($isSigned) {

            $html .= '

                            <tr>

                                <td class="sign-label-cell">
                                    Signature:
                                </td>

                                <td class="sign-value-cell">
            ';

            if ($signatureImageBase64) {

                $html .= '
                                    <img
                                        src="' . $signatureImageBase64 . '"
                                        class="signature-image"
                                    />

                                    <div class="signature-line"></div>
                ';
            } else {

                $html .= '
                                    <strong>Signed electronically</strong>
                ';
            }

            $html .= '

                                </td>

                            </tr>

            ';

            if ($signatureName) {

                $html .= '

                            <tr>

                                <td class="sign-label-cell">
                                    Printed Name:
                                </td>

                                <td class="sign-value-cell">
                                    <strong>
                                        ' . $signatureName . '
                                    </strong>
                                </td>

                            </tr>

                ';
            }

            $html .= '

                            <tr>

                                <td class="sign-label-cell">
                                    Date signed:
                                </td>

                                <td class="sign-value-cell">
                                    ' . $signedAt . '
                                </td>

                            </tr>

            ';

            if ($signedIp) {

                $html .= '

                            <tr>

                                <td class="sign-label-cell">
                                    IP address:
                                </td>

                                <td class="sign-value-cell">
                                    ' . $signedIp . '
                                </td>

                            </tr>

                ';
            }

        } else {

            $html .= '

                            <tr>

                                <td class="sign-label-cell">
                                    Signature:
                                </td>

                                <td class="sign-value-cell">
                                    <span class="unsigned-line"></span>
                                </td>

                            </tr>

                            <tr>

                                <td class="sign-label-cell">
                                    Printed Name:
                                </td>

                                <td class="sign-value-cell">
                                    <span class="unsigned-line"></span>
                                </td>

                            </tr>

                            <tr>

                                <td class="sign-label-cell">
                                    Date:
                                </td>

                                <td class="sign-value-cell">
                                    <span class="unsigned-line"></span>
                                </td>

                            </tr>

            ';
        }

        $html .= '

                        </table>

                    </div>

                </div>


                <!-- ================= FOOTER ================= -->

                <div class="footer">
                    Staffoo (Capital Services Pty Ltd)
                    &mdash;
                    ABN 48 613 317 838
                </div>

            </div>

        </body>
        </html>
        ';

        return $html;
    }
}