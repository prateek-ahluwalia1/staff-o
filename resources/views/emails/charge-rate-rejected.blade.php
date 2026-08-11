<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; margin:0; padding:0; }
    .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; }
    .header { background:#B91C1C; padding:14px 22px; border-radius:6px 6px 0 0; }
    .header img { height:32px; display:block; }
    .header h1 { color:#fff; font-size:16px; margin:0; padding-top:6px; }
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
    <div class="header">
        <img src="{{ asset('images/staffoo-logo-white.png') }}" alt="STAFFOO">
        <h1>Charge Rate Request Update</h1>
    </div>
    <div class="body">
        <p>Hi {{ $contractorName }},</p>

        <p>
            Your charge rate request <strong>"{{ $title }}"</strong> for
            <strong>{{ strtoupper($state) }}</strong> has been reviewed and was
            <strong>not approved</strong> by our admin team.
        </p>

        @if(!empty($reviewNote))
            <div class="note-box">
                <strong>Admin note:</strong><br>
                {{ $reviewNote }}
            </div>
        @endif

        <p>You're welcome to submit an updated request with revised rates at any time.</p>

        <p>Thank you,<br>STAFFOO Team</p>
    </div>
    <div class="footer">
        This is an automated notification from STAFFOO.
    </div>
</div>
</body>
</html>