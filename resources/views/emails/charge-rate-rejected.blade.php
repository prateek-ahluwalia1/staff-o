<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; margin:0; padding:0; }
    .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; }
    .logo-band { background:#FFFFFF; padding:18px 22px; text-align:center; border:1px solid #E5E7EB; border-bottom:none; border-radius:6px 6px 0 0; }
    .logo-band img { height:40px; }
    .header { background:#B91C1C; padding:14px 22px; }
    .header h1 { color:#fff; font-size:16px; margin:0; }
    .body { border:1px solid #E5E7EB; border-top:none; padding:20px 22px; border-radius:0 0 6px 6px; }
    .meta { margin-bottom:16px; line-height:1.8; }
    .meta strong { color:#374151; }
    .note-box {
        background:#FEF2F2; border:1px solid #FCA5A5; border-radius:6px;
        padding:12px 14px; margin: 16px 0; color:#7F1D1D; font-size:13px;
    }
    .footer { text-align:center; color:#9CA3AF; font-size:11px; margin-top:18px; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="logo-band">
        <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo">
    </div>
    <div class="header">
        <h1>Required Updated Charge Rates</h1>
    </div>
    <div class="body">
        <p>Hi {{ $contractorName }},</p>

        <p>
            Your charge rate request <strong>"{{ $title }}"</strong> for
            <strong>{{ strtoupper($state) }}</strong> has been reviewed and was
            <strong>not approved</strong> by Staffoo.
        </p>

        @if(!empty($reviewNote))
            <div class="note-box">
                <strong>Admin note:</strong><br>
                {{ $reviewNote }}
            </div>
        @endif

        <p>Your rates has been reviewed by Staffoo and unfortunately is not being approved.</p>
        <p>Please revise your rates and send it back.</p>

        <p>Thank you,<br>STAFFOO Team</p>
    </div>
    <div class="footer">
        This is an automated notification from STAFFOO.
    </div>
</div>
</body>
</html>