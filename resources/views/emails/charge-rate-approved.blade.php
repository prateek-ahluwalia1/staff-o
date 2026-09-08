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
    .badge {
        display:inline-block; background:#ECFDF5; color:#065F46; border:1px solid #6EE7B7;
        border-radius:20px; padding:4px 12px; font-size:12px; font-weight:bold; margin-bottom:16px;
    }
    .details-box { background:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px; padding:16px; margin:16px 0; }
    .details-row { padding:5px 0; font-size:13px; }
    .details-label { color:#6B7280; display:inline-block; width:110px; }
    .details-value { color:#111827; font-weight:bold; }
    .footer-note { font-size:13px; color:#6B7280; line-height:1.6; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="logo-band">
        <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo">
    </div>
    <div class="header">
        <h1>Charge Rate Request Approved</h1>
    </div>
    <div class="body">
        <p>Hi {{ $contractorName }},</p>

        <div class="badge">✓ Approved</div>

        <p>
            Your charge rate request <strong>"{{ $title }}"</strong> for
            <strong>{{ strtoupper($state) }}</strong> has been reviewed and approved.
            These rates are now active on your account.
        </p>

        <div class="details-box">
            <div class="details-row"><span class="details-label">State:</span><span class="details-value">{{ strtoupper($state) }}</span></div>
            <div class="details-row"><span class="details-label">Title:</span><span class="details-value">{{ $title }}</span></div>
        </div>

        <p class="footer-note">
            You can view your full rate card in the app at any time. Thanks for keeping
            your rates up to date.
        </p>

        <p>Thanks,<br>The STAFFOO Team</p>
    </div>
</div>
</body>
</html>