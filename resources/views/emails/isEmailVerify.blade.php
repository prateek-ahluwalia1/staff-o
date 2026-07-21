<!DOCTYPE html>
<html>
<head>
    <title>STAFFOO - Verify Your Email</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f0f7fa; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <!-- MAIN CONTAINER -->
    <table style="width:100%; background-color:#f0f7fa; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0;" cellpadding="0" cellspacing="0" border="0">
        <tbody>
            <tr>
                <td align="center" style="paddinHg:30px 15px;">
                    <!-- CENTERED CARD (max-width 600px) -->
                    <table style="max-width:600px; width:100%; background-color:#ffffff; border-radius:24px; box-shadow:0 12px 35px rgba(0,0,0,0.05); border-collapse:collapse; overflow:hidden; mso-table-lspace:0; mso-table-rspace:0;" cellpadding="0" cellspacing="0" border="0">
                        <tbody>
                            <!-- Top brand wave / header decoration (optional but fresh) -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #0F2B3D 0%, #1B4F6E 100%); height:8px; font-size:0; line-height:0;">&nbsp;</td>
                            </tr>
                            
                            <!-- Logo Section : updated with your new logo path -->
                            <tr>
                                <td style="padding: 32px 32px 16px 32px; text-align: center;">
                                    <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="STAFFOO Logo" width="150" height="50" style="display:block; border:0; width:150px; height:auto; margin:0 auto;">
                                </td>
                            </tr>

                            <!-- Hero / Greeting -->
                            <tr>
                                <td style="padding: 0 32px 12px 32px; text-align: center;">
                                    <h1 style="color:#0F2B3D; font-weight:600; font-size:28px; margin:0 0 8px 0; letter-spacing:-0.3px;">Verify your email address</h1>
                                    <p style="color:#5A6872; font-size:16px; line-height:1.5; margin:0;">You're almost there to unlock all STAFFOO features.</p>
                                                                                                         
                                </td>
                            </tr>

                            <!-- Divider style (soft) -->
                            <tr>
                                <td style="padding: 0 32px;">
                                    <hr style="border:0; height:1px; background:#E2E8F0; margin:12px 0 20px 0;">
                                </td>
                            </tr>

                            <!-- Email and verification message -->
                            <tr>
                                <td style="padding: 0 32px 12px 32px; text-align: center;">
                                    <table style="background-color:#F8FCFE; border-radius:20px; padding:16px 20px; width:100%; border-collapse:collapse; mso-table-lspace:0; mso-table-rspace:0;" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="text-align:center;">
                                                <p style="font-size:14px; font-weight:500; color:#1F5E7E; margin:0 0 6px 0; letter-spacing:0.3px;">VERIFICATION REQUEST FOR</p>
                                                <p style="font-size:20px; font-weight:600; color:#0F2B3D; margin:0; background:#FFFFFF; display:inline-block; padding:6px 18px; border-radius:40px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
                                                    {{$email}}
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Call To Action Button (modern, rounded, gradient style) -->
                            <tr>
                               <td style="padding: 24px 32px 12px 32px; text-align: center;">
                                    <a href="{{ config('app.url') . '/api/email-verification/' . $email . '/' . $token }}"
                                    target="_blank"
                                    style="background-color: #00A37E; color: #ffffff; padding: 14px 32px; border-radius: 60px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; text-align: center; font-family: Arial, sans-serif;">
                                        Verify Email
                                    </a>
                                </td>
                            </tr>

                            <!-- New Registration text + welcome message -->
                            <tr>
                                <td style="padding: 16px 32px 12px 32px;">
                                    <table style="background:#F2F9F6; border-radius:20px; width:100%; border-collapse:collapse;" cellpadding="0" cellspacing="0">
                                        <tr>
                                           @if($userType == "customer")
                                            <td style="padding: 20px 24px;">
                                                <p style="font-size:15px; font-weight:600; color:#006B51; margin:0 0 8px 0; display:flex; align-items:center; gap:8px;">
                                                    Ready to elevate your team?
                                                </p>
                                                <p style="font-size:14px; color:#2D4A5E; line-height:1.5; margin:0 0 10px 0;">
                                                    Thanks for signing up with <strong>STAFFOO</strong>
                                                    Once your email is verified, you'll be able to:
                                                </p>
                                                <ul style="margin:6px 0 0 20px; padding-left:0; color:#2C5A6E; font-size:14px; line-height:1.6;">
                                                    <li>Create and assign shifts instantly.</li>
                                                    <li>Track attendance and performance metrics.</li>
                                                    <li>Access real-time analytics and payroll insights.</li>
                                                </ul>
                                            </td>
                                            @endif
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Extra security note + support -->
                            <tr>
                                <td style="padding: 8px 32px 20px 32px; text-align: center;">
                                    <p style="font-size:13px; color:#6A7F8F; margin:0;">
                                        Need help? <a href="https://staffoo.com.au/contact-us" style="color:#00A37E; text-decoration:none; font-weight:500;">Contact support</a> or visit our <a href="https://staffoo.com.au/contact-us" style="color:#00A37E; text-decoration:none;">Help Center</a>
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer with social / company info -->
                            <tr>
                                <td style="background-color:#F9FCFD; border-top:1px solid #EAF0F4; padding:24px 32px 28px 32px; text-align: center;">
                                    <table style="width:100%; border-collapse:collapse;" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="text-align:center;">
                                                <p style="font-weight:600; margin:0 0 12px 0; color:#1B4F6E; font-size:15px;">STAFFOO — Smarter workforce, better results</p>
                                                <p style="font-size:12px; color:#8DA1AE; margin:0 0 10px 0;">
                                                    © {{ date('Y') }} STAFFOO All rights reserved.
                                                </p>
                                                <div style="margin-top: 12px;">
                                                    <a href="https://staffoo.com.au/about-us" style="color:#00A37E; text-decoration:none; font-size:12px; margin:0 8px;">About</a> 
                                                    <span style="color:#C8D6DE;">|</span> 
                                                    <a href="https://staffoo.com.au/privacy-policy" style="color:#00A37E; text-decoration:none; font-size:12px; margin:0 8px;">Privacy</a>
                                                    <span style="color:#C8D6DE;">|</span>
                                                    <a href="https://staffoo.com.au/terms-of-use" style="color:#00A37E; text-decoration:none; font-size:12px; margin:0 8px;">Terms</a>
                                                </div>
                                                <!-- tiny app badge hint (optional) -->
                                                <p style="font-size:11px; color:#A8BBC9; margin-top:18px; margin-bottom:0;">
                                                     Manage shifts, track time and grow with STAFFOO
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <table style="max-width:600px; width:100%; margin-top:16px;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="text-align:center; font-size:11px; color:#92A6B3; padding:10px 10px 0px;">
                                <p>This is an automated email. Please do not reply to this message.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>