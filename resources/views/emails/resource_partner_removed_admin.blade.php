<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resource Partner Removed - Admin Alert</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: #c62828;
            padding: 20px 30px;
            text-align: center;
        }
        .header img {
            max-height: 60px;
            width: auto;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 24px;
            color: #c62828;
            margin-bottom: 20px;
        }
        .message {
            color: #333;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .job-details {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .job-details p {
            margin: 8px 0;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #1a237e;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-box {
            background: #fff3e0;
            border-left: 4px solid #ff6f00;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            color: #777;
            font-size: 14px;
        }
        .footer a {
            color: #1a237e;
            text-decoration: none;
        }
        .action-button {
            display: inline-block;
            background: #c62828;
            color: #ffffff !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo" style="max-width: 180px; height: auto; display: inline-block;">
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="greeting">
                ⚠️ Admin Alert
            </div>
            
            <div class="message">
                <p>A resource partner has been removed from a job. This requires immediate attention.</p>
            </div>

            <!-- Job Details -->
            <div class="job-details">
                <h3 style="margin-top: 0; color: #c62828;">Job Information</h3>
                <p><span class="label">Job ID:</span> #{{ $job_reference }}</p>
                <p><span class="label">Job Title:</span> {{ $job_title }}</p>
                <p><span class="label">Client:</span> {{ $client_name }} ({{ $client_email ?? 'No email' }})</p>
                <p><span class="label">Start Date:</span> {{ $start_date }}</p>
                <p><span class="label">End Date:</span> {{ $end_date }}</p>
                <p><span class="label">Previous Resource Partner:</span> {{ $resource_partner_name }}</p>
                <p><span class="label">Removed By:</span> {{ $removed_by }}</p>
                <p><span class="label">Removed On:</span> {{ $removed_at }}</p>
            </div>

            <!-- Info Box -->
            <div class="info-box">
                <p><strong>📋 Action Required:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Review the job details and client information</li>
                    <li>Find a suitable replacement resource partner</li>
                    <li>Coordinate with the resource partner team</li>
                    <li>Notify the client once a new partner is assigned</li>
                </ul>
            </div>

            <!-- Warning Box -->
            <div class="warning-box">
                <p><strong>⚠️ Important:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Client has been notified not to make any payment</li>
                    <li>Payment intent and invoice have been reset</li>
                    <li>Job status has been set to "pending"</li>
                    <li>Need to generate new payment link after reassignment</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ url('/admin/jobs/' . $job_id) }}" class="action-button">
                    View Job in Admin Panel
                </a>
            </div>

            <div class="message">
                <p>Please ensure this issue is resolved promptly to maintain client satisfaction.</p>
                <p>If you need assistance, contact the support team.</p>
            </div>

            <div class="message">
                <p>Best regards,<br>
                <strong>{{ $company_name ?? 'Staffoo' }} System</strong></p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $company_name ?? 'Staffoo' }}. All rights reserved.</p>
            <p>
                <a href="{{ url('/admin') }}">Admin Dashboard</a> | 
                <a href="mailto:support@staffoo.com.au">Support</a>
            </p>
        </div>
    </div>
</body>
</html>