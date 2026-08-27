<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resource Partner Removed</title>
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
            background: #1a237e;
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
            color: #1a237e;
            margin-bottom: 20px;
        }
        .message {
            color: #333;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .highlight {
            background: #fff3e0;
            padding: 15px;
            border-left: 4px solid #ff6f00;
            margin: 20px 0;
            border-radius: 4px;
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
        .action-button {
            display: inline-block;
            background: #777;
            color: #ffffff !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
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
        .alert-box {
            background: #ffebee;
            border-left: 4px solid #c62828;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header with Logo -->
        <div class="header">
            <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo" style="max-width: 180px; height: auto; display: inline-block;">
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Hi {{ $client_name }},
            </div>
            
            <div class="message">
                <p>We hope this email finds you well.</p>
                <p>We regret to inform you that the resource partner assigned to your job has <strong>declined</strong> due to staff unavailability or other reasons.</p>
            </div>

            <!-- Alert Box -->
            <div class="alert-box">
                <p><strong>⚠️ Important Update:</strong></p>
                <p>Please do not make any payment for this job at this time. We are currently working on assigning a new resource partner to your job.</p>
            </div>

            <div class="alert-box">
                <p><strong>⚠️ Reason:</strong></p>
                <p>{{ $reason }}</p>
            </div>
            <!-- Job Details -->
            <div class="job-details">
                <h3 style="margin-top: 0; color: #1a237e;">Job Details</h3>
                <p><span class="label">Job ID:</span> #{{ $job_reference }}</p>
                <p><span class="label">Job Title:</span> {{ $job_title }}</p>
                <p><span class="label">Start Date:</span> {{ $start_date }}</p>
                <p><span class="label">End Date:</span> {{ $end_date }}</p>
                <p><span class="label">Previous Resource Partner:</span> {{ $resource_partner_name }}</p>
                <p><span class="label">Removed On:</span> {{ $removed_at }}</p>
            </div>

            <!-- Highlight Box -->
            <div class="highlight">
                <p><strong>What happens next?</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>We are actively looking for a replacement resource partner.</li>
                    <li>You will receive an email confirmation once a new partner is assigned.</li>
                    <li>After reassignment, you will receive a new invoice for payment.</li>
                    <li>You can then proceed with the payment through the secure link provided.</li>
                </ul>
            </div>

            <div class="message">
                <p>We apologize for any inconvenience this may have caused and appreciate your patience and understanding.</p>
                <p>If you have any questions or need immediate assistance, please don't hesitate to contact our support team.</p>
            </div>

            <div class="message">
                <p>Thank you for your continued trust in Staffoo.</p>
                <p>Best regards,<br>
                <strong>Staffoo Team</strong></p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; {{ date('Y') }} Staffoo. All rights reserved.</p>
        </div>
    </div>
</body>
</html>