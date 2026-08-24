<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Payout Released</title>
</head>
<body style="margin:0; padding:0; background:#F3F4F6; font-family: Arial, Helvetica, sans-serif; color:#111827;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
        <tr>
            <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF; border-radius:8px; overflow:hidden; border:1px solid #E5E7EB;">
                    <tr>
                        <td style="background:#14243D; padding:20px 28px;">
                            <span style="font-size:20px; font-weight:bold; color:#FFFFFF; letter-spacing:0.5px;">STAFFOO</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px;">
                            <p style="font-size:15px; margin:0 0 16px;">Hi {{ $contractorName }},</p>

                            <p style="font-size:14px; line-height:1.6; margin:0 0 16px; color:#374151;">
                                Your payout for invoice <strong>#{{ $invoiceNumber }}</strong> has been processed and
                                transferred to your connected Stripe account.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FC; border-left:3px solid #0A7C6E; border-radius:4px; margin:0 0 20px;">
                                <tr>
                                    <td style="padding:14px 18px;">
                                        <span style="font-size:12px; color:#6B7280;">Net Payout</span><br>
                                        <span style="font-size:20px; font-weight:bold; color:#0A7C6E;">${{ $netPayout }}</span>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size:14px; line-height:1.6; margin:0 0 16px; color:#374151;">
                                The attached tax invoice breaks down the platform service fee (10% + GST) deducted
                                from the gross transaction amount before this payout was sent. Funds are typically
                                available in your bank account within 1–2 business days, depending on your bank.
                            </p>

                            <p style="font-size:13px; line-height:1.6; color:#6B7280; margin:0;">
                                If anything on the invoice looks incorrect, reply to this email or contact
                                <a href="mailto:accounts@staffoo.com.au" style="color:#0A7C6E;">accounts@staffoo.com.au</a>.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 28px; background:#F9FAFB; border-top:1px solid #E5E7EB; text-align:center;">
                            <span style="font-size:11px; color:#9CA3AF;">
                                Capital Services Pty Ltd (t/a Staffoo) — ABN 48 613 317 838
                            </span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>