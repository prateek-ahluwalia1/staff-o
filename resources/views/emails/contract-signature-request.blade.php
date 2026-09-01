<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; margin:0; padding:0; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 24px; }
    .logo-band { background:#FFFFFF; padding:18px 22px; text-align:center; border:1px solid #E5E7EB; border-bottom:none; border-radius:10px 10px 0 0; }
    .logo-band img { height:40px; }
    .header { background:#0A7C6E; padding:16px 22px; }
    .header h1 { color:#fff; font-size:16px; margin:0; }
    .body { border:1px solid #E5E7EB; border-top:none; padding:22px; border-radius:0 0 10px 10px; }
    .cta { text-align:center; margin: 24px 0; }
    .cta a {
        background:#0A7C6E; color:#fff; padding:12px 28px; text-decoration:none;
        border-radius:6px; font-weight:bold; font-size:14px; display:inline-block;
    }
    .details-box { background:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px; padding:14px 16px; margin:16px 0; font-size:13px; }
    .footer-note { font-size:12.5px; color:#6B7280; line-height:1.6; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="logo-band">
        <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo">
    </div>
    <div class="header">
        <h1>Your Subcontractor Agreement is Ready to Sign</h1>
    </div>
    <div class="body">
        <p>Hi {{ $contractorName }},</p>

        <p>Your charge rate request for <strong>{{ strtoupper($state) }}</strong> has been approved.
        Please review and sign your Subcontractor Services Agreement below to finalize this arrangement.</p>

        <div class="details-box">
            <strong>Contract #:</strong> {{ $contractNumber }}<br>
            <strong>State:</strong> {{ strtoupper($state) }}
        </div>

        <div class="cta">
            <a href="{{ $signingLink }}">Review &amp; Sign Agreement</a>
        </div>

        <p class="footer-note">
            You'll be asked to review the full agreement, including your applicable pay rates, and
            type your name to acknowledge and sign. Once signed, you and our admin team will both
            receive a copy of the fully executed agreement.
        </p>

        <p>Thanks,<br>The STAFFOO Team</p>
    </div>
</div>
</body>
</html>