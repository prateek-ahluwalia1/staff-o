<!DOCTYPE html>
<html>
<head>
    <title>Document Expiry Alert - Summary Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 800px;
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
        .user-section {
            background: #f8f9fa;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #007bff;
            border-radius: 4px;
        }
        .user-section h3 {
            margin-top: 0;
            color: #007bff;
        }
        .summary-box {
            background: #e9ecef;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
            display: inline-block;
        }
        .summary-box span {
            font-weight: bold;
            color: #dc3545;
        }
        .doc-table {
            background: white;
            border-radius: 4px;
            overflow: hidden;
        }
        .doc-table th {
            background: #007bff;
            color: white;
        }
        .urgent {
            color: #dc3545;
            font-weight: bold;
        }
        .warning {
            color: #ffc107;
            font-weight: bold;
        }
        .info {
            color: #17a2b8;
            font-weight: bold;
        }
        .badge-danger {
            background: #dc3545;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
        .badge-warning {
            background: #ffc107;
            color: #333;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
        .badge-info {
            background: #17a2b8;
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
            <h2>⚠️ Document Expiry Alert - Summary Report</h2>
        </div>
        
        <div class="content">
            <p>Dear Admin,</p>
            
            <div class="alert">
                <strong>⚠️ Multiple documents are about to expire!</strong>
                <br>
                Please review the details below and take necessary action.
            </div>
            
            <!-- Summary Section -->
            <div style="margin: 20px 0;">
                <h3>📊 Summary Report</h3>
                <div class="summary-box">
                    <p><strong>Total Users:</strong> <span>{{ $details['total_users'] }}</span></p>
                    <p><strong>Total Expiring Documents:</strong> <span>{{ $details['total_documents'] }}</span></p>
                    <p><strong>Generated at:</strong> {{ $details['generated_at'] }}</p>
                </div>
            </div>
            
            <hr>
            
            <!-- User-wise Documents -->
            <h3>📋 Detailed Report</h3>
            
            @foreach($details['users_data'] as $userData)
                <div class="user-section">
                    <h3>👤 User: {{ $userData['user']->name }}</h3>
                    <p><strong>Email:</strong> {{ $userData['user']->email }}</p>
                    <p><strong>Total Documents Expiring:</strong> {{ count($userData['documents']) }}</p>
                    
                    <table class="doc-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Document Name</th>
                                <th>Expiry Date</th>
                                <th>Days Remaining</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($userData['documents'] as $index => $doc)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td><strong>{{ $doc['document_name'] }}</strong></td>
                                    <td><strong style="color: #dc3545;">{{ $doc['expiry_date'] }}</strong></td>
                                    <td>
                                        @if($doc['days_remaining'] <= 7)
                                            <span class="badge-danger">{{ $doc['days_remaining'] }} days</span>
                                        @elseif($doc['days_remaining'] <= 15)
                                            <span class="badge-warning">{{ $doc['days_remaining'] }} days</span>
                                        @else
                                            <span class="badge-info">{{ $doc['days_remaining'] }} days</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($doc['days_remaining'] <= 7)
                                            <span style="color: #dc3545;">🔴 Urgent</span>
                                        @elseif($doc['days_remaining'] <= 15)
                                            <span style="color: #ffc107;">🟡 Warning</span>
                                        @else
                                            <span style="color: #17a2b8;">🔵 Info</span>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endforeach
            
            <hr>
            
            <!-- Actions Section -->
            <div style="margin: 20px 0;">
                <h3>✅ Suggested Actions:</h3>
                <ul>
                    <li>Contact the staff members to renew their documents</li>
                    <li>Check if any renewal processes need to be initiated</li>
                    <li>Update the document records after renewal</li>
                    <li>Prioritize documents with <span style="color: #dc3545;">🔴 Urgent</span> status (7 days or less)</li>
                </ul>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #155724;">
                    <strong>💡 Note:</strong> 
                    This is a consolidated report of all expiring documents. 
                    Individual notifications have already been sent to the respective users.
                </p>
            </div>
            
            <hr>
            
            <p style="color: #666; font-size: 14px;">
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