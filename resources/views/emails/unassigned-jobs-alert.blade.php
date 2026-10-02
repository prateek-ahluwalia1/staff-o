<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        th { background-color: #f44336; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .header { background: #f44336; color: white; padding: 16px 24px; }
        .body { padding: 24px; }
    </style>
</head>
<body>
    <div class="header">
        <h2 style="margin:0">⚠️ Unassigned Jobs Alert</h2>
        <p style="margin:4px 0 0">Generated at {{ now()->format('d M Y, H:i') }}</p>
    </div>
    <div class="body">
        <p>The following jobs have been unassigned for over <strong>1 hour</strong> and no guard has accepted them.</p>

        <table>
            <thead>
                <tr>
                    <th>Job ID</th>
                    <th>Site</th>
                    <th>Start Time</th>
                    <th>Posted At</th>
                    <th>Minutes Unassigned</th>
                </tr>
            </thead>
            <tbody>
                @foreach($jobs as $job)
                <tr>
                    <td>#{{ $job->id }}</td>
                    <td>{{ $job->site->site_name ?? 'N/A' }}</td>
                    <td>{{ \Carbon\Carbon::parse($job->start)->format('d M Y H:i') }}</td>
                    <td>{{ \Carbon\Carbon::parse($job->created_at)->format('d M Y H:i') }}</td>
                    <td>{{ now()->diffInMinutes($job->created_at) }} min</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <p style="margin-top:24px; color:#888; font-size:13px;">
            This alert is sent every 15 minutes until the jobs are assigned.
        </p>
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