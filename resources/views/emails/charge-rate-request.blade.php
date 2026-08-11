<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; margin:0; padding:0; }
    .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; }
    .header { background:#0A7C6E; padding:14px 22px; border-radius:6px 6px 0 0; }
    .header img { height:32px; display:block; }
    .header h1 { color:#fff; font-size:16px; margin:0; padding-top:6px; }
    .body { border:1px solid #E5E7EB; border-top:none; padding:20px 22px; border-radius:0 0 6px 6px; }
    .meta { margin-bottom:16px; line-height:1.8; }
    .meta strong { color:#374151; }
    table { width:100%; border-collapse: collapse; font-size:12px; margin-bottom: 16px; }
    thead th { background:#0A7C6E; color:#fff; text-align:left; padding:8px 10px; }
    tbody td { padding:7px 10px; border-bottom:1px solid #E5E7EB; }
    tbody tr:nth-child(even) { background:#F9FAFB; }
    .footer { text-align:center; color:#9CA3AF; font-size:11px; margin-top:18px; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <img src="{{ asset('images/staffoo-logo-white.png') }}" alt="STAFFOO">
        <h1>New Charge Rate Request</h1>
    </div>
    <div class="body">
        <div class="meta">
            <strong>Contractor:</strong> {{ $contractorName }} ({{ $contractorEmail }})<br>
            <strong>Title:</strong> {{ $title }}<br>
            <strong>State:</strong> {{ strtoupper($state) }}
        </div>

        <table>
            <thead>
                <tr>
                    <th>Rate Type</th>
                    <th>Requested Value</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($rateRows as $row)
                    <tr>
                        <td>{{ $row['label'] }}</td>
                        <td>${{ number_format($row['value'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <p style="font-size:13px; color:#6B7280;">
            Please review this request in the admin panel and accept or reject it.
        </p>
    </div>
    <div class="footer">
        This is an automated notification from STAFFOO.
    </div>
</div>
</body>
</html>