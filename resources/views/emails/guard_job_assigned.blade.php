<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staffoo New Job Assignment</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">

        <!-- Header with Logo -->
        <div style="text-align: center; padding: 30px 0 20px 0; border-bottom: 2px solid #e8edf3;">
            <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo" style="max-width: 180px; height: auto; display: inline-block;">
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px; color: #333333;">

            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 48px; margin-bottom: 10px;">📅</div>
                <div style="font-size: 28px; font-weight: 600; color: #0A7C6E;">
                    New Job Assignment
                </div>
            </div>

            <!-- Greeting -->
            <div style="font-size: 20px; font-weight: 600; color: #0A7C6E; margin-bottom: 20px;">
                Hi {{ $guard_name }},
            </div>

            <!-- Message -->
            <div style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #0A7C6E;">
                <p style="margin: 0;">
                    You have been assigned a new shift by <strong>{{ $contractor_name }}</strong>. Please review the job details below and make sure to arrive on time.
                </p>
            </div>

            <!-- Job Details -->
            <div style="margin: 25px 0;">
                <h3 style="color: #0A7C6E; font-size: 16px; margin-bottom: 15px;">📋 Job Details:</h3>

                <div style="background-color: #eef7f6; padding: 15px 18px; margin-bottom: 10px; border-radius: 6px; border-left: 3px solid #0A7C6E;">
                    <p style="margin: 0; font-size: 14px; color: #333;">
                        <strong>Site:</strong> {{ $site_name }}
                    </p>
                </div>

                <div style="background-color: #eef7f6; padding: 15px 18px; margin-bottom: 10px; border-radius: 6px; border-left: 3px solid #0A7C6E;">
                    <p style="margin: 0; font-size: 14px; color: #333;">
                        <strong>Start Time:</strong> {{ $start_time }}
                    </p>
                </div>

                <div style="background-color: #eef7f6; padding: 15px 18px; margin-bottom: 10px; border-radius: 6px; border-left: 3px solid #0A7C6E;">
                    <p style="margin: 0; font-size: 14px; color: #333;">
                        <strong>End Time:</strong> {{ $end_time }}
                    </p>
                </div>

                <div style="background-color: #eef7f6; padding: 15px 18px; margin-bottom: 10px; border-radius: 6px; border-left: 3px solid #0A7C6E;">
                    <p style="margin: 0; font-size: 14px; color: #333;">
                        <strong>Contractor:</strong> {{ $contractor_name }}
                    </p>
                </div>
            </div>

            <!-- Info Box -->
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-size: 15px; color: #0A7C6E;">
                    <strong>💡 Reminder:</strong><br>
                    Please ensure you complete the required rest period before your shift and arrive at the site on time.
                </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://staffoo.com.au" style="display: inline-block; background-color: #0A7C6E; color: #ffffff !important; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    🚀 View My Shifts
                </a>
            </div>

            <!-- Support -->
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #856404; text-align: center;">
                    💬 Need help? Contact us at
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
                    <td style="padding:0 5px;">
                        <a href="https://apps.apple.com/pk/app/staffoo/id6798964069" target="_blank">
                            <img src="https://apis.staffoo.com.au/uploads/app-store-badge.png" alt="Download on the App Store" width="120" height="41" style="display:block; border:0; width:120px; height:auto;">
                        </a>
                    </td>
                    <td style="padding:0 5px;">
                        <a href="https://play.google.com/store/apps/details?id=com.staffoo" target="_blank">
                            <img src="https://apis.staffoo.com.au/uploads/google-play-badge.png" alt="Get it on Google Play" width="120" height="41" style="display:block; border:0; width:120px; height:auto;">
                        </a>
                    </td>
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