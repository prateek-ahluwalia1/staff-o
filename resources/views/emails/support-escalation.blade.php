<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Support escalation</title>
</head>
@php $urgent = strtolower($data['urgency'] ?? '') === 'urgent'; @endphp
<body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2430;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
    <tr>
        <td style="background:{{ $urgent ? '#8a1c2b' : '#1f3864' }};padding:20px 24px;">
            <h1 style="margin:0;font-size:18px;color:#ffffff;">
                {{ $urgent ? 'Urgent — support escalation' : 'Support escalation' }}
            </h1>
            <p style="margin:6px 0 0;font-size:13px;color:#d5dcea;">
                Via {{ $data['channel'] }} · {{ $data['received_at'] }}
            </p>
        </td>
    </tr>

    <tr>
        <td style="padding:24px;">
            <h2 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;">Caller</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <tr><td style="padding:6px 0;width:150px;color:#6b7280;">Name</td><td style="padding:6px 0;">{{ $data['name'] ?: '—' }}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;"><strong>{{ $data['email'] ?: '—' }}</strong></td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;"><strong>{{ $data['phone'] ?: '—' }}</strong></td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">Account type</td><td style="padding:6px 0;">{{ $data['account_type'] ?: '—' }}</td></tr>
            </table>

            <h2 style="margin:24px 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;">Issue</h2>
            <p style="margin:0 0 10px;font-size:15px;"><strong>{{ $data['issue'] ?: '—' }}</strong></p>
            @if ($data['details'])
                <p style="margin:0;font-size:14px;line-height:1.55;color:#374151;">{!! nl2br(e($data['details'])) !!}</p>
            @endif
        </td>
    </tr>

    <tr>
        <td style="padding:16px 24px;background:#f0f3f9;border-top:1px solid #dde3ef;font-size:13px;color:#4b5563;">
            The caller was told someone would come back to them <strong>typically within an hour</strong>.
        </td>
    </tr>
</table>
</body>
</html>
