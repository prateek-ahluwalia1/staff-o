<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staffoo Account Status</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        
        <!-- Header with Logo -->
        <div style="text-align: center; padding: 30px 0 20px 0; border-bottom: 2px solid #e8edf3;">
            <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo" style="max-width: 180px; height: auto; display: inline-block;">
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px; color: #333333;">
            
            <!-- Status Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 48px; margin-bottom: 10px;">{{ $status_icon }}</div>
                <div style="font-size: 28px; font-weight: 600; color: {{ $status_color }};">
                    Account {{ ucfirst($status) }}
                </div>
                <div style="font-size: 16px; color: #666; margin-top: 10px;">
                    Staffoo ID: <strong>{{ $staffo_id }}</strong>
                </div>
            </div>

            <!-- Greeting -->
            <div style="font-size: 20px; font-weight: 600; color: #1a237e; margin-bottom: 20px;">
                Hi {{ $name }},
            </div>

            <!-- Status Message -->
            <div style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid {{ $status_color }};">
                <p style="margin: 0;">{{ $status_message }}</p>
            </div>

            @if($status === 'inactive')
                <!-- Issues List -->
                <div style="margin: 25px 0;">
                    <h3 style="color: #dc3545; font-size: 16px; margin-bottom: 15px;">📋 Issues to Resolve:</h3>
                    
                    @foreach($issues as $issue)
                        <div style="background-color: #fff5f5; padding: 12px 15px; margin-bottom: 10px; border-radius: 6px; border-left: 3px solid #dc3545;">
                            <p style="margin: 0; font-size: 14px; color: #333;">
                                <strong>{{ ucfirst($issue['type']) }}:</strong> {{ $issue['message'] }}
                            </p>
                        </div>
                    @endforeach
                </div>

                <!-- Action Required -->
                <div style="background-color: #fef3cd; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 15px; color: #856404;">
                        <strong>🔧 Action Required:</strong><br>
                        Please update your profile and upload all required documents to reactivate your account.
                    </p>
                </div>
            @else
                <!-- Active Account Features -->
                <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 15px; color: #0A7C6E;">
                        <strong>🎉 What you can do now:</strong>
                    </p>
                    <ul style="padding-left: 20px; color: #0A7C6E; line-height: 1.8;">
                        <li>✓ View and manage your work shifts</li>
                        <li>✓ Stay updated with company announcements</li>
                    </ul>
                </div>
            @endif

            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://staffoo.com.au/login" style="display: inline-block; background-color: #0A7C6E; color: #ffffff !important; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    @if($status === 'active')
                        🚀 Go to Dashboard
                    @else
                        📝 Update Profile
                    @endif
                </a>
            </div>

            @if($status === 'inactive')
                <!-- Support Message -->
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #856404; text-align: center;">
                        💡 Need help? Contact us at 
                        <a href="mailto:admin@staffoo.com.au" style="color: #1a237e; text-decoration: none; font-weight: 600;">admin@staffoo.com.au</a>
                    </p>
                </div>
            @endif

        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; border-top: 2px solid #e8edf3; color: #6c757d; font-size: 14px;">
            <p style="margin: 0;">
                &copy; {{ date('Y') }} Staffoo. All rights reserved.
            </p>
            <div style="margin-top: 15px;">
                <a href="https://staffoo.com" style="margin: 0 10px; color: #1a237e; text-decoration: none;">Website</a> |
                <a href="mailto:support@staffoo.com" style="margin: 0 10px; color: #1a237e; text-decoration: none;">Support</a> |
                <a href="https://staffoo.com/privacy" style="margin: 0 10px; color: #1a237e; text-decoration: none;">Privacy Policy</a>
            </div>
            <div style="margin-top: 15px; font-size: 12px; color: #999;">
                This is an automated message, please do not reply directly to this email.
            </div>
        </div>
    </div>
</body>
</html>