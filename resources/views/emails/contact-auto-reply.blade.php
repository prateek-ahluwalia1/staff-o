{{-- resources/views/emails/contact-auto-reply.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting Us</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f3f4f6;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            color: white;
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 700;
        }
        .header p {
            color: rgba(255, 255, 255, 0.95);
            font-size: 18px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 24px;
            color: #059669;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .message-card {
            background-color: #f0fdf4;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            border-left: 4px solid #10b981;
        }
        .info-box {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            border: 1px solid #e5e7eb;
        }
        .info-row {
            display: flex;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .info-label {
            width: 100px;
            font-weight: 600;
            color: #4b5563;
        }
        .info-value {
            flex: 1;
            color: #1f2937;
        }
        .contact-card {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
        }
        .contact-card h3 {
            color: #2563eb;
            margin-bottom: 15px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .contact-detail {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .contact-detail a {
            color: #2563eb;
            text-decoration: none;
        }
        .contact-detail a:hover {
            text-decoration: underline;
        }
        .expectations-list {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            list-style: none;
        }
        .expectations-list li {
            margin-bottom: 12px;
            padding-left: 28px;
            position: relative;
        }
        .expectations-list li:before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .button {
            display: inline-block;
            background-color: #059669;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.3s;
            box-shadow: 0 2px 4px rgba(5, 150, 105, 0.3);
        }
        .button:hover {
            background-color: #047857;
        }
        .signature {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px dashed #d1d5db;
        }
        .team-name {
            font-size: 20px;
            color: #059669;
            font-weight: 700;
            margin: 10px 0;
        }
        .footer {
            background-color: #f9fafb;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .social-links {
            margin-bottom: 15px;
        }
        .social-links a {
            color: #6b7280;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }
        .social-links a:hover {
            color: #059669;
        }
        .footer p {
            color: #6b7280;
            font-size: 13px;
            margin: 5px 0;
        }
        hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 20px 0;
        }
        .quote {
            font-style: italic;
            color: #4b5563;
            background-color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>✨ Thank You!</h1>
            <p>We've received your message and will respond shortly</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Dear {{ $name }},
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for reaching out to <strong>{{ $appName }}</strong>. We have successfully received your inquiry and our team will review it promptly.
            </p>

            <div class="message-card">
                <h3 style="color: #059669; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    📝 Your Message Summary
                </h3>
                <p><strong>Subject:</strong> {{ $subject }}</p>
                <p><strong>Type:</strong> {{ $inquiryType }}</p>
                <p><strong>Submitted:</strong> {{ $submittedAt }}</p>
                @if($contactMessage)
                <div class="quote">
                    "{{ $contactMessage }}"
                </div>
                @endif
            </div>

            <div class="info-box">
                <h3 style="color: #059669; margin-bottom: 15px;">📋 Submission Details</h3>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">{{ $name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ $email }}</span>
                </div>
                @if($phone)
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">{{ $phone }}</span>
                </div>
                @endif
                @if($company)
                <div class="info-row">
                    <span class="info-label">Company:</span>
                    <span class="info-value">{{ $company }}</span>
                </div>
                @endif
            </div>

            <h3 style="color: #1f2937; margin: 30px 0 15px 0;">⏳ What happens next?</h3>
            
            <ul class="expectations-list">
                <li><strong>Review (24-48 hours):</strong> Our team will review your inquiry and assign it to the appropriate department</li>
                <li><strong>Response:</strong> You'll receive a personalized response from one of our specialists</li>
                <li><strong>Resolution:</strong> We'll work with you to address your questions or concerns</li>
            </ul>

            <div class="contact-card">
                <h3>📞 Need immediate assistance?</h3>
                
                <div class="contact-detail">
                    <span>📧</span>
                    <a href="mailto:{{ $supportEmail }}">{{ $supportEmail }}</a>
                </div>
                
                @if($supportPhone && $supportPhone != 'Not available')
                <div class="contact-detail">
                    <span>📱</span>
                    <a href="tel:{{ $supportPhone }}">{{ $supportPhone }}</a>
                </div>
                @endif
                
                <div class="contact-detail">
                    <span>⏰</span>
                    <span>{{ $supportHours }}</span>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="{{ $appUrl }}" class="button" target="_blank">
                    Visit Our Website →
                </a>
            </div>

            <div class="signature">
                <p>Best regards,</p>
                <div class="team-name">{{ $teamName }}</div>
                <p style="color: #6b7280; margin-top: 5px;">{{ $appName }}</p>
            </div>
        </div>

        <div class="footer">
            <div class="social-links">
                <a href="#">Facebook</a> •
                <a href="#">Twitter</a> •
                <a href="#">LinkedIn</a> •
                <a href="#">Instagram</a>
            </div>
            <p>This is an automated response. Please do not reply to this email.</p>
            <p>&copy; {{ $year }} {{ $appName }}. All rights reserved.</p>
            <p style="font-size: 11px; margin-top: 10px;">{{ $appUrl }}</p>
        </div>
    </div>
</body>
</html>