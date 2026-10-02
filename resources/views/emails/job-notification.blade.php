<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
            color: #333333;
        }
        .wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 24px 16px;
        }
        .card {
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .header {
            background-color: #0a7c6e;
            color: #ffffff;
            padding: 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
        }
        .body {
            padding: 24px;
        }
        .body p {
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 16px;
        }
        .job-details {
            background-color: #f9f9fb;
            border-left: 4px solid #0a7c6e;
            padding: 16px;
            border-radius: 4px;
            margin: 16px 0;
        }
        .job-details table {
            width: 100%;
            border-collapse: collapse;
        }
        .job-details td {
            padding: 4px 0;
            font-size: 14px;
        }
        .job-details td.label {
            color: #777777;
            width: 40%;
        }
        .job-details td.value {
            font-weight: bold;
            color: #0a7c6e;
        }
        .cta-button {
            display: inline-block;
            background-color: #0a7c6e;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 6px;
            font-size: 15px;
            font-weight: bold;
            margin-top: 8px;
        }
        .footer {
            text-align: center;
            padding: 16px;
            font-size: 12px;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="header">
                <h1>{{ $title }}</h1>
            </div>
            <div class="body">

                <p>New Job Available - Check Your App Now.</p>

                <div class="job-details">
                    <table>
                        <tr>
                            <td class="label">Job ID</td>
                            <td class="value">#{{ $job->id }}</td>
                        </tr>
                        @if($job->site)
                        <tr>
                            <td class="label">Site</td>
                            <td class="value">{{ $job->site->site_name ?? 'N/A' }}</td>
                        </tr>
                        @endif
                        <tr>
                            <td class="label">Start Time</td>
                            <td class="value">{{ \Carbon\Carbon::parse($job->start)->format('d M Y, h:i A') }}</td>
                        </tr>
                        @if(isset($job->end))
                        <tr>
                            <td class="label">End Time</td>
                            <td class="value">{{ \Carbon\Carbon::parse($job->end)->format('d M Y, h:i A') }}</td>
                        </tr>
                        @endif
                    </table>
                </div>

                <p>Please open the Staffoo app to view full details and accept this job.</p>
            </div>
        </div>
        <div class="footer">
<!-- App download badges -->
<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto; padding:20px 0 10px 0;">
<tr>
<td style="padding:0 5px;"><a href="https://apps.apple.com/pk/app/staffoo/id6798964069" target="_blank"><img src="https://apis.staffoo.com.au/uploads/app-store-badge.png" alt="Download on the App Store" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
<td style="padding:0 5px;"><a href="https://play.google.com/store/apps/details?id=com.staffoo" target="_blank"><img src="https://apis.staffoo.com.au/uploads/google-play-badge.png" alt="Get it on Google Play" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
</tr>
</table>
            &copy; {{ date('Y') }} Staffoo. All rights reserved.<br>
            This is an automated notification — please do not reply to this email.
        </div>
    </div>
</body>
</html>