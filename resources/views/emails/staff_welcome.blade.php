<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Staffoo</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7fa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 30px 0 20px 0;
            border-bottom: 2px solid #e8edf3;
        }
        .logo {
            max-width: 180px;
            height: auto;
        }
        .content {
            padding: 30px 20px;
            color: #333333;
        }
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #0a7c6e;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 25px;
        }
        .credentials-box {
            background-color: #f8f9fa;
            border-left: 4px solid #0a7c6e;
            padding: 20px;
            margin: 25px 0;
            border-radius: 6px;
        }
        .credentials-box p {
            margin: 8px 0;
            font-size: 15px;
        }
        .credentials-box strong {
            color: #0a7c6e;
        }
        .highlight {
            background-color: #e8edf3;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
        }
        .cta-section {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            background-color: #0a7c6e;
            color: #ffffff !important;
            padding: 14px 35px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        .btn:hover {
            background-color: #0a7c6e;
        }
        .footer {
            text-align: center;
            padding: 20px;
            border-top: 2px solid #e8edf3;
            color: #6c757d;
            font-size: 14px;
        }
        .footer a {
            color: #0a7c6e;
            text-decoration: none;
        }
        .social-links {
            margin-top: 15px;
        }
        .social-links a {
            margin: 0 10px;
            color: #6c757d;
            text-decoration: none;
        }
        .support {
            margin-top: 15px;
            font-size: 13px;
        }
        @media only screen and (max-width: 480px) {
            .container {
                padding: 15px;
            }
            .greeting {
                font-size: 20px;
            }
            .content {
                padding: 20px 15px;
            }
            .btn {
                padding: 12px 25px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header with Logo -->
       <div class="header" style="text-align: center; padding: 30px 0 20px 0; border-bottom: 2px solid #e8edf3;">
            <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo" style="max-width: 180px; height: auto; display: inline-block;">
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Welcome to Staffoo, {{ $name }}! 👋
            </div>

            @if($user_type != 'customer')
            <div class="message">
                <p>We're excited to have you on board! Your company <strong>{{ $company_name }}</strong> is registered on Staffoo.</p>
                <p>Staffoo is your all-in-one security workforce management solution designed to make your work life easier and more efficient.</p>
            </div>
            @endif
            
            <!-- Account Details -->
            <div class="credentials-box">
                <h3 style="margin-top: 0; color: #1a237e; font-size: 16px;">🔑 Your Login Details</h3>
                <p><strong>Email:</strong> {{ $email }}</p>
                <p><strong>Password:</strong> <span class="highlight">{{ $password }}</span></p>
            </div>

            <!-- Call to Action -->
            <div class="cta-section">
                <a href="https://play.google.com/store/apps/details?id=com.staffoo" class="btn">📲 Download Staffoo App</a>
            </div>

            <div class="message" style="margin-top: 25px;">
                <p style="font-style: italic; color: #555;">
                    "Your security is our priority. We're here to support you every step of the way."
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0;">
                &copy; {{ date('Y') }} Staffoo. All rights reserved.
            </p>
            <div class="social-links">
                <a href="https://staffoo.com.au">Website</a> |
                <a href="mailto:admin@staffoo.com.au">Support</a> |
                <a href="https://staffoo.com.au/privacy-policy">Privacy Policy</a>
            </div>
            <div class="support">
                <p style="margin: 5px 0;">
                    Need help? Contact us at 
                    <a href="mailto:admin@staffoo.com.au">admin@staffoo.com.au</a>
                </p>
                <p style="margin: 5px 0; font-size: 12px; color: #999;">
                    This is an automated message, please do not reply directly to this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>