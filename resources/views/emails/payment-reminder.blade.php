<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; margin:0; padding:0; background:#F3F4F6; }
    .wrapper { max-width: 620px; margin: 0 auto; padding: 24px; }

    .logo-band { background:#FFFFFF; padding:18px 22px; text-align:center; border:1px solid #E5E7EB; border-bottom:none; border-radius:10px 10px 0 0; }
    .logo-band img { height:40px; }

    .header {
        background: linear-gradient(120deg, #0B1E33 0%, #0A7C6E 100%);
        padding:22px 24px;
    }
    .header h1 { color:#fff; font-size:18px; margin:0 0 4px; }
    .header p { color:#FED7AA; font-size:12.5px; margin:0; }

    .body { background:#FFFFFF; border:1px solid #E5E7EB; border-top:none; padding:22px; border-radius:0 0 10px 10px; }

    .intro { font-size:14px; line-height:1.7; color:#374151; margin-bottom: 18px; }

    .badge {
        display:inline-block; background:#FFF7ED; color:#9A3412; border:1px solid #0A7C6E;
        border-radius:20px; padding:4px 14px; font-size:12px; font-weight:bold; margin-bottom:18px;
    }

    table.job-table { width:100%; border-collapse: collapse; font-size:12.5px; margin-bottom: 8px; }
    .job-table thead th { background:#D97706; color:#fff; text-align:left; padding:9px 10px; font-size:11.5px; }
    .job-table tbody td { padding:9px 10px; border-bottom:1px solid #E5E7EB; vertical-align:top; }
    .job-table tbody tr:nth-child(even) { background:#FFFBEB; }
    .job-site { font-weight:bold; color:#111827; }
    .job-sub { font-size:11px; color:#6B7280; margin-top:2px; }
    .job-amount { text-align:right; font-weight:bold; color:#9A3412; }

    .footer-note { font-size:13px; color:#6B7280; line-height:1.6; margin-top: 18px; }
    .footer { text-align:center; color:#9CA3AF; font-size:11px; margin-top:18px; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="logo-band">
        <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo">
    </div>
    <div class="header">
        <h1>{{ $isAdmin ? 'Payment Reminder Digest' : 'Payment Reminder' }}</h1>
        <p>{{ $isAdmin ? 'Jobs across all clients currently awaiting payment' : 'Action needed on the job(s) below' }}</p>
    </div>
    <div class="body">
        <p class="intro">Hi {{ $recipientName }},</p>

        <div class="badge">{{ count($jobs) }} job{{ count($jobs) === 1 ? '' : 's' }} awaiting payment</div>

        <p class="intro">
            @if($isAdmin)
                The following jobs have an accepted contractor but are still marked as payment not required.
                Please review and follow up with the relevant clients as needed.
            @else
                The job{{ count($jobs) === 1 ? '' : 's' }} below {{ count($jobs) === 1 ? 'has' : 'have' }} been accepted by a resource partner, but payment
                has not yet been arranged. Please arrange payment at your earliest convenience to avoid
                any disruption to your booking.
            @endif
        </p>

        <table class="job-table">
            <thead>
                <tr>
                    <th>Job</th>
                    @if($isAdmin)
                        <th>Client</th>
                    @endif
                </tr>
            </thead>
            <tbody>
                @foreach ($jobs as $job)
                    <tr>
                        <td>
                            <div class="job-site">{{ $job['site'] ?? 'N/A' }}</div>
                            <div class="job-sub">{{ $job['start'] ?? '' }} &ndash; {{ $job['end'] ?? '' }}</div>
                        </td>
                        @if($isAdmin)
                            <td>{{ $job['client_name'] ?? 'N/A' }}</td>
                        @endif
                        
                    </tr>
                @endforeach
            </tbody>
        </table>

        <p class="footer-note">
            @if($isAdmin)
                This is an automated daily digest. No action is required from this email alone.
            @else
                If you've already arranged payment for these jobs, please disregard this reminder.
                For any questions, contact our team.
            @endif
        </p>

        <p style="margin-top:16px;">Thanks,<br>The STAFFOO Team</p>
    </div>
    <div class="footer">
        This is an automated notification from STAFFOO.
    </div>
</div>
</body>
</html>