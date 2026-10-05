<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>New job request</title>
</head>
<body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2430;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
    <tr>
        <td style="background:#1f3864;padding:20px 24px;">
            <h1 style="margin:0;font-size:18px;color:#ffffff;">New job request</h1>
            <p style="margin:6px 0 0;font-size:13px;color:#c7d2e8;">
                Taken by the STAFFOO assistant via {{ $data['channel'] }} · {{ $data['received_at'] }}
            </p>
        </td>
    </tr>

    @if (!empty($data['missing']))
        <tr>
            <td style="padding:16px 24px;background:#fff4e5;border-bottom:1px solid #ffd9a0;">
                <strong style="color:#8a4b00;font-size:14px;">Incomplete —</strong>
                <span style="color:#8a4b00;font-size:14px;">
                    the caller did not give: {{ implode(', ', $data['missing']) }}.
                    Check before setting this up.
                </span>
            </td>
        </tr>
    @endif

    <tr>
        <td style="padding:24px;">
            <h2 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;">Client</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <tr><td style="padding:6px 0;width:160px;color:#6b7280;">Email</td><td style="padding:6px 0;"><strong>{{ $data['email'] ?: '—' }}</strong></td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;">{{ $data['contact_phone'] ?: '—' }}</td></tr>
            </table>

            <h2 style="margin:24px 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;">Site</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <tr><td style="padding:6px 0;width:160px;color:#6b7280;">Name</td><td style="padding:6px 0;">{{ $data['site_name'] ?: '—' }}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Address</td><td style="padding:6px 0;"><strong>{{ $data['address'] ?: '—' }}</strong></td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">State</td><td style="padding:6px 0;">{{ $data['state'] ?: '—' }}</td></tr>
            </table>

            <h2 style="margin:24px 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;">The job</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <tr><td style="padding:6px 0;width:160px;color:#6b7280;">Type</td><td style="padding:6px 0;"><strong>{{ $data['job_type'] ?: '—' }}</strong></td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Guards</td><td style="padding:6px 0;">{{ $data['number_of_guards'] ?: '—' }}</td></tr>
                <tr><td style="padding:6px 0;vertical-align:top;color:#6b7280;">Shifts</td><td style="padding:6px 0;"><strong>{!! nl2br(e($data['shifts'] ?: '—')) !!}</strong></td></tr>
            </table>

            @if ($data['requirements'] || $data['instructions'])
                <h2 style="margin:24px 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;">Extra</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                    @if ($data['requirements'])
                        <tr><td style="padding:6px 0;width:160px;vertical-align:top;color:#6b7280;">Requirements</td><td style="padding:6px 0;">{!! nl2br(e($data['requirements'])) !!}</td></tr>
                    @endif
                    @if ($data['instructions'])
                        <tr><td style="padding:6px 0;vertical-align:top;color:#6b7280;">Site instructions</td><td style="padding:6px 0;">{!! nl2br(e($data['instructions'])) !!}</td></tr>
                    @endif
                </table>
            @endif
        </td>
    </tr>

    <tr>
        <td style="padding:16px 24px;background:#f0f3f9;border-top:1px solid #dde3ef;font-size:13px;color:#4b5563;">
            <strong>Next step:</strong> set the job up and send the client a payment link.
            Nothing has been posted — the assistant cannot post jobs, and the client knows that.
        </td>
    </tr>
</table>
</body>
</html>
