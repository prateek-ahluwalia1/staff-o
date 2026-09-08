<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 14px;
        color: #1F2937;
        margin: 0;
        padding: 0;
        background: #F3F4F6;
    }
    a { color: #0A7C6E; }
</style>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;">

<!-- Outer wrapper — table-based so this renders consistently across Gmail/Outlook/Apple Mail -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;">
    <tr>
        <td align="center" style="padding:40px 16px;">

            <!-- Card -->
            <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                   style="width:600px;max-width:600px;background:#FFFFFF;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">

                <!-- Header: logo + title on one continuous band, no seam -->
                <tr>
                    <td style="background-color:#0A7C6E;padding:28px 40px 24px 40px;" align="center">
                        <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo"
                             height="32" style="display:block;margin:0 auto 18px auto;filter:brightness(0) invert(1);">
                        <div style="font-size:19px;font-weight:700;color:#FFFFFF;letter-spacing:-0.2px;">
                            Charge Rate Request Approved
                        </div>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:32px 40px 8px 40px;">
                        <p style="margin:0 0 18px 0;font-size:14px;color:#374151;">
                            Hi {{ $contractorName }},
                        </p>

                        <!-- Approved badge -->
                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px 0;">
                            <tr>
                                <td style="background-color:#ECFDF5;border:1px solid #6EE7B7;border-radius:20px;padding:6px 14px 6px 12px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="padding-right:6px;">
                                                <div style="width:16px;height:16px;border-radius:50%;background-color:#059669;text-align:center;line-height:16px;">
                                                    <span style="color:#FFFFFF;font-size:11px;font-weight:bold;">&#10003;</span>
                                                </div>
                                            </td>
                                            <td style="font-size:12px;font-weight:700;color:#065F46;letter-spacing:0.2px;">
                                                APPROVED
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:0 0 22px 0;font-size:14px;line-height:1.6;color:#374151;">
                            Your charge rate request <strong style="color:#111827;">&ldquo;{{ $title }}&rdquo;</strong> for
                            <strong style="color:#111827;">{{ strtoupper($state) }}</strong> has been reviewed and approved.
                            These rates are now active on your account.
                        </p>

                        <!-- Details box -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                               style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;margin:0 0 24px 0;">
                            <tr>
                                <td style="padding:18px 20px;">
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="padding:6px 0;font-size:12px;color:#6B7280;width:100px;vertical-align:top;">State</td>
                                            <td style="padding:6px 0;font-size:13px;font-weight:700;color:#111827;">{{ strtoupper($state) }}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:6px 0;font-size:12px;color:#6B7280;width:100px;vertical-align:top;">Title</td>
                                            <td style="padding:6px 0;font-size:13px;font-weight:700;color:#111827;">{{ $title }}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:0 0 24px 0;font-size:13px;line-height:1.6;color:#6B7280;">
                            You can view your full rate card in the app at any time. Thanks for keeping your rates up to date.
                        </p>

                        <p style="margin:0 0 28px 0;font-size:14px;color:#374151;">
                            Thanks,<br>The Staffoo Team
                        </p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="padding:18px 40px;background-color:#F9FAFB;border-top:1px solid #E5E7EB;" align="center">
                        <p style="margin:0;font-size:11px;color:#9CA3AF;">
                            Staffoo &middot; Capital Services Pty Ltd &middot; ABN 48 613 317 838
                        </p>
                    </td>
                </tr>

            </table>
            <!-- /Card -->

        </td>
    </tr>
</table>

</body>
</html>