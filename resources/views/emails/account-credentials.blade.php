<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your STAFFOO Login Details</title>
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
                <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                <div style="font-size: 28px; font-weight: 600; color: #0A7C6E;">
                    Your account is ready
                </div>
            </div>

            <!-- Greeting -->
            <div style="font-size: 20px; font-weight: 600; color: #0A7C6E; margin-bottom: 20px;">
                Hi {{ $name }},
            </div>

            <!-- Intro Message -->
            <div style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #0A7C6E;">
                <p style="margin: 0;">Your STAFFOO {{ ucfirst($accountType) }} account has been created. Here are your login details.</p>
            </div>

            <!-- Credentials -->
            <div style="background-color: #F2F9F6; border-radius: 8px; padding: 20px; margin: 0 0 25px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; color: #5a6e7c; font-size: 14px; width: 40%;">Email</td>
                        <td style="padding: 6px 0; font-size: 15px; font-weight: 600; color: #0F2B3D;">{{ $email }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #5a6e7c; font-size: 14px;">Temporary password</td>
                        <td style="padding: 6px 0;">
                            <span style="font-size: 16px; font-weight: 700; color: #0A7C6E; background: #ffffff; display: inline-block; padding: 6px 14px; border-radius: 40px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">{{ $password }}</span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- What this account can do -->
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 0 0 25px 0;">
                <p style="margin: 0; font-size: 15px; color: #0A7C6E;">
                    {{ $typeExplanation }}
                </p>
            </div>

            <!-- Action Required -->
            <div style="background-color: #fef3cd; padding: 20px; border-radius: 8px; margin: 0 0 25px 0;">
                <p style="margin: 0; font-size: 15px; color: #856404;">
                    <strong>🔧 Before you start:</strong><br>
                    Verify your email and change this temporary password once you log in.
                </p>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://staffoo.com.au/login" style="display: inline-block; background-color: #0A7C6E; color: #ffffff !important; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    🚀 Log In
                </a>
            </div>

            <!-- Support Message -->
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #856404; text-align: center;">
                    💡 Need help? Contact us at
                    <a href="mailto:admin@staffoo.com.au" style="color: #1a237e; text-decoration: none; font-weight: 600;">admin@staffoo.com.au</a>
                </p>
            </div>

        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; border-top: 2px solid #e8edf3; color: #6c757d; font-size: 14px;">
            <p style="margin: 0;">
                &copy; {{ date('Y') }} Staffoo. All rights reserved.
            </p>
            <!-- App download badges -->
            <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto; padding:20px 0 10px 0;">
                <tr>
                    <td style="padding:0 5px;"><a href="https://apps.apple.com/pk/app/staffoo/id6798964069" target="_blank"><img src="https://apis.staffoo.com.au/uploads/app-store-badge.png" alt="Download on the App Store" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
                    <td style="padding:0 5px;"><a href="https://play.google.com/store/apps/details?id=com.staffoo" target="_blank"><img src="https://apis.staffoo.com.au/uploads/google-play-badge.png" alt="Get it on Google Play" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
                </tr>
            </table>
            <div style="margin-top: 15px;">
                <a href="https://staffoo.com.au" style="margin: 0 10px; color: #1a237e; text-decoration: none;">Website</a> |
                <a href="mailto:admin@staffoo.com.au" style="margin: 0 10px; color: #1a237e; text-decoration: none;">Support</a> |
                <a href="https://staffoo.com.au/privacy-policy" style="margin: 0 10px; color: #1a237e; text-decoration: none;">Privacy Policy</a>
            </div>
            <div style="margin-top: 15px; font-size: 12px; color: #999;">
                This is an automated message, please do not reply directly to this email.
            </div>
        </div>
    </div>
</body>
</html>
