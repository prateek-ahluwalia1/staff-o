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
    .footer-note { font-size:12.5px; color:#6B7280; line-height:1.6; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="logo-band">
        <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo">
    </div>
    <div class="header">
        <h1>Subcontractor Agreement — Fully Executed</h1>
    </div>
    <div class="body">
        <p>Hi {{ $recipientName }},</p>

        <div class="badge">✓ Signed</div>

        <p>
            The Subcontractor Services Agreement ({{ $contractNumber }}) between Staffoo and
            <strong>{{ $contractorName }}</strong> for <strong>{{ strtoupper($state) }}</strong>
            has been signed. A copy is attached to this email for your records.
        </p>

        <p class="footer-note">
            Please keep this document for your records. If you have any questions about this
            agreement, contact our team.
        </p>

        <p>Thanks,<br>The STAFFOO Team</p>
    </div>
</div>
<div style="text-align:center; margin-top:24px;">
<!-- App download badges -->
<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto; padding:20px 0 10px 0;">
<tr>
<td style="padding:0 5px;"><a href="https://apps.apple.com/pk/app/staffoo/id6798964069" target="_blank"><img src="https://apis.staffoo.com.au/uploads/app-store-badge.png" alt="Download on the App Store" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
<td style="padding:0 5px;"><a href="https://play.google.com/store/apps/details?id=com.staffoo" target="_blank"><img src="https://apis.staffoo.com.au/uploads/google-play-badge.png" alt="Get it on Google Play" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
</tr>
</table>
</div>
</body>
</html>