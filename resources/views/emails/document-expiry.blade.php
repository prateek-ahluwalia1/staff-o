<!DOCTYPE html>
<html>
<head>
    <title>Document Expiry Alert</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        .header {
            background: #dc3545;
            color: white;
            padding: 15px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            background: white;
            padding: 20px;
            border-radius: 0 0 8px 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
            background: #f4f4f4;
        }
        .alert {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .badge {
            background: #dc3545;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>⚠️ Document Expiry Alert</h2>
        </div>
        
        <div class="content">
            <p>Dear Admin,</p>
            
            <div class="alert">
                <strong>A staff member's document is about to expire!</strong>
                <br>
                Please review the details below and take necessary action.
            </div>
            
            <h3>Staff Details:</h3>
            <table>
                <tr>
                    <th>Staff Name</th>
                    <td><strong>{{ $details['staff_name'] }}</strong></td>
                </tr>
                <tr>
                    <th>Staff Email</th>
                    <td>{{ $details['staff_email'] }}</td>
                </tr>
                <tr>
                    <th>Document Name</th>
                    <td><strong>{{ $details['document_name'] }}</strong></td>
                </tr>
                <tr>
                    <th>Expiry Date</th>
                    <td><strong style="color: #dc3545;">{{ $details['expiry_date'] }}</strong></td>
                </tr>
                <tr>
                    <th>Days Remaining</th>
                    <td>
                        <span class="badge">
                            {{ $details['days_remaining'] }} days
                        </span>
                    </td>
                </tr>
            </table>
            
            <div style="margin: 20px 0;">
                <p><strong>Message:</strong></p>
                <p style="background: #f4f4f4; padding: 10px; border-radius: 4px;">
                    {{ $details['message'] }}
                </p>
            </div>
            
            <p style="margin-top: 20px;">
                <strong>Suggested Actions:</strong>
                <ul>
                    <li>Contact the staff member to renew the document</li>
                    <li>Check if any renewal process needs to be initiated</li>
                    <li>Update the document record after renewal</li>
                </ul>
            </p>
            
            <hr>
            
            <p style="color: #666;">
                This is an automated notification from the Staff Document Management System.
                <br>
                Please do not reply to this email.
            </p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Staff Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>