<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; margin:0; padding:0; }
    .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; }
    .header { background:#0A7C6E; padding:14px 22px; border-radius:6px 6px 0 0; }
    .header table { width:100%; }
    .header td { vertical-align:middle; }
    .header img { height:32px; display:block; }
    .header h1 { color:#fff; font-size:16px; margin:0; padding-top:6px; }
    .body { border:1px solid #E5E7EB; border-top:none; padding:20px 22px; border-radius:0 0 6px 6px; }
    .meta { margin-bottom:16px; line-height:1.8; }
    .meta strong { color:#374151; }
    .reason-box {
        background:#FFF7ED; border:1px solid #FDBA74; border-radius:6px;
        padding:12px 14px; margin-bottom:20px; color:#7C2D12; font-size:13px;
    }
    table { width:100%; border-collapse: collapse; font-size:12px; margin-bottom: 10px; }
    thead th { background:#0A7C6E; color:#fff; text-align:left; padding:8px 10px; }
    tbody td { padding:7px 10px; border-bottom:1px solid #E5E7EB; }
    tbody tr:nth-child(even) { background:#F9FAFB; }
    .changed { background:#ECFDF5 !important; }
    .changed .new-val { color:#065F46; font-weight:bold; }
    .old-val { color:#9CA3AF; text-decoration: line-through; }
    .footer { text-align:center; color:#9CA3AF; font-size:11px; margin-top:18px; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <table>
            <tr>
                <td><img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="STAFFOO Logo" width="150" height="50" style="display:block; border:0; width:150px; height:auto; margin:0 auto;"></td>
            </tr>
        </table>
        <h1>Contractor Rate Update Request</h1>
    </div>
    <div class="body">
        <div class="meta">
            <strong>Contractor:</strong> {{ $contractorName }} ({{ $contractorEmail }})<br>
            <strong>Rate Card:</strong> {{ $rateTitle }}<br>
            <strong>State:</strong> {{ strtoupper($state) }}
        </div>

        <div class="reason-box">
            <strong>Reason for change:</strong><br>
            {{ $reason }}
        </div>

        <table>
            <thead>
                <tr>
                    <th>Rate Type</th>
                    <th>Current</th>
                    <th>Requested</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($rateRows as $row)
                    <tr class="{{ $row['changed'] ? 'changed' : '' }}">
                        <td>{{ $row['label'] }}</td>
                        <td>
                            @if($row['changed'])
                                <span class="old-val">${{ number_format($row['old'], 2) }}</span>
                            @else
                                ${{ number_format($row['old'], 2) }}
                            @endif
                        </td>
                        <td class="new-val">
                            @if($row['changed'])
                                ${{ number_format($row['new'], 2) }}
                            @else
                                ${{ number_format($row['new'], 2) }}
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <p style="font-size:13px; color:#6B7280;">
            Please review this request and update the rate card in the admin panel if approved.
        </p>
    </div>
    <div class="footer">
        This is an automated notification from STAFFOO.
    </div>
</div>
</body>
</html>