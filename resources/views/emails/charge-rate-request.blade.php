<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; margin:0; padding:0; }
    .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; }
    .logo-band { background:#FFFFFF; padding:18px 22px; text-align:center; border:1px solid #E5E7EB; border-bottom:none; border-radius:6px 6px 0 0; }
    .logo-band img { height:40px; }
    .header { background:#0A7C6E; padding:14px 22px; }
    .header h1 { color:#fff; font-size:16px; margin:0; }
    .body { border:1px solid #E5E7EB; border-top:none; padding:20px 22px; border-radius:0 0 6px 6px; }
    .meta { margin-bottom:16px; line-height:1.8; }
    .meta strong { color:#374151; }
    .notes-box {
        background:#F9FAFB; border:1px solid #E5E7EB; border-radius:6px;
        padding:12px 14px; margin-bottom:20px; color:#374151; font-size:13px;
    }
    .state-block { margin-bottom: 24px; }
    .state-title { font-size:14px; font-weight:bold; color:#0A7C6E; margin-bottom:8px; }
    table { width:100%; border-collapse: collapse; font-size:12px; margin-bottom: 6px; }
    thead th { background:#0A7C6E; color:#fff; text-align:left; padding:8px 10px; }
    tbody td { padding:7px 10px; border-bottom:1px solid #E5E7EB; }
    tbody tr:nth-child(even) { background:#F9FAFB; }
    .footer { text-align:center; color:#9CA3AF; font-size:11px; margin-top:18px; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="logo-band">
        <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo">
    </div>
    <div class="header">
        <h1>New Charge Rate Request</h1>
    </div>
    <div class="body">
        <div class="meta">
            <strong>Contractor:</strong> {{ $contractorName }} ({{ $contractorEmail }})<br>
            <strong>States Requested:</strong> {{ collect($stateBlocks)->pluck('state')->map(fn($s) => strtoupper($s))->implode(', ') }}
        </div>

        @if(!empty($notes))
            <div class="notes-box">
                <strong>Notes from contractor:</strong><br>
                {{ $notes }}
            </div>
        @endif

        @foreach ($stateBlocks as $block)
            <div class="state-block">
                <div class="state-title">
                    {{ strtoupper($block['state']) }}{{ !empty($block['title']) ? ' — ' . $block['title'] : '' }}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Rate Type</th>
                            <th>Requested Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($block['rateRows'] as $row)
                            @continue(!str_starts_with($row['label'], 'Default'))
                            <tr>
                                <td>{{ $row['label'] }}</td>
                                <td>${{ number_format($row['value'], 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endforeach

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