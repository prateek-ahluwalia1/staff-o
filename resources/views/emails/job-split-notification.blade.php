<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; margin:0; padding:0; }
    .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; }
    .logo-band { background:#FFFFFF; padding:18px 22px; text-align:center; border:1px solid #E5E7EB; border-bottom:none; border-radius:6px 6px 0 0; }
    .logo-band img { height:40px; }
    .header { background:#0A7C6E; padding:16px 22px; }
    .header h1 { color:#fff; font-size:17px; margin:0; }
    .body { border:1px solid #E5E7EB; border-top:none; padding:22px; border-radius:0 0 6px 6px; }
    .intro { font-size:14px; line-height:1.7; margin-bottom: 18px; }
    .badge {
        display:inline-block; background:#ECFDF5; color:#065F46; border:1px solid #6EE7B7;
        border-radius:20px; padding:4px 12px; font-size:12px; font-weight:bold; margin-bottom:18px;
    }
    .meta { margin-bottom:18px; line-height:1.8; font-size:13px; color:#374151; }
    .meta strong { color:#111827; }
    table { width:100%; border-collapse: collapse; font-size:12px; margin-bottom: 18px; }
    thead th { background:#0A7C6E; color:#fff; text-align:left; padding:9px 10px; }
    tbody td { padding:8px 10px; border-bottom:1px solid #E5E7EB; }
    tbody tr:nth-child(even) { background:#F9FAFB; }
    .guard-assigned { color:#065F46; font-weight:bold; }
    .guard-unassigned { color:#D97706; }
    .footer-note { font-size:13px; color:#6B7280; line-height:1.6; margin-top: 6px; }
    .footer { text-align:center; color:#9CA3AF; font-size:11px; margin-top:18px; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="logo-band">
        <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo">
    </div>
    <div class="header">
        <h1>Job Update: Shift Split Notification</h1>
    </div>
    <div class="body">
        <p class="intro">Hi {{ $clientName }},</p>

        <div class="badge">Split into {{ $partsCount }} part{{ $partsCount > 1 ? 's' : '' }}</div>

        <p class="intro">
            Your job has been split into {{ $partsCount }} separate job{{ $partsCount > 1 ? 's' : '' }}
            to better match staffing availability. The updated job breakdown is below.
        </p>

        @if(!empty($siteAddress))
            <div class="meta">
                <strong>Site:</strong> {{ $siteAddress }}
            </div>
        @endif

        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Hours</th>
                    <th>Staff</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($shiftRows as $i => $row)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>{{ $row['start'] }}</td>
                        <td>{{ $row['end'] }}</td>
                        <td>{{ $row['hours'] }}</td>
                        <td>
                            @if(!empty($row['guard_name']))
                                <span class="guard-assigned">{{ $row['guard_name'] }}</span>
                            @else
                                <span class="guard-unassigned">Unassigned</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <p class="footer-note">
            You'll receive another update once all shifts are fully staffed. If you have any
            questions about this change, feel free to reach out to our team.
        </p>
    </div>
    <div class="footer">
        This is an automated notification from STAFFOO.
    </div>
</div>
</body>
</html>