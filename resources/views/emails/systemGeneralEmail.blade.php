<!DOCTYPE html>
<html>
<head>
    <title>247 Staffing Solutions</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4a90e2;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 30px 20px;
            background-color: #f9f9f9;
            text-align: center;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #45a049;
        }
        .button-download {
            background-color: #2196F3;
        }
        .button-download:hover {
            background-color: #0b7dda;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
        }
        .info {
            color: #666;
            font-size: 14px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>STAFFOO</h1>
        </div>
        
        <div class="content">
            <p style="font-size: 16px;">{{ $description }}</p>
            
            <p class="info">Your invoice is ready for download.</p>
            
            <!-- Download Button -->
            <a href="{{ $download_url }}" class="button button-download" style="color: white;">
                📄 Download Invoice ({{ $filename }})
            </a>
            
            <p class="info" style="font-size: 12px; margin-top: 20px;">
                The link will expire in 30 days. If the button doesn't work, 
                <a href="{{ $download_url }}">click here</a> to download.
            </p>
        </div>
        
        <div class="footer">
            <p>Thank you for using our service.</p>
            <p>Best regards,<br>Staffoo Team</p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© {{ date('Y') }} Staffoo. All rights reserved.</p>
        </div>
    </div>
</body>
</html>