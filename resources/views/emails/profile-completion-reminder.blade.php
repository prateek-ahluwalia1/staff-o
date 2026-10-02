<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Profile</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0B1E33 0%, #0A7C6E 100%); color: #fff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .progress-container { background: #e9ecef; border-radius: 10px; height: 24px; overflow: hidden; margin: 20px 0; }
        .progress-bar { background: linear-gradient(90deg, #0A7C6E, #0B1E33); height: 100%; color: #fff; text-align: center; line-height: 24px; font-size: 13px; font-weight: bold; transition: width 0.3s; }
        .missing-list { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .missing-list h3 { margin-top: 0; color: #856404; font-size: 16px; }
        .missing-list ul { margin: 10px 0; padding-left: 20px; }
        .missing-list li { margin: 5px 0; color: #856404; }
        .btn { display: inline-block; background: linear-gradient(135deg, #0B1E33 0%, #0A7C6E 100%); color: #fff !important; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        .highlight { color: #0A7C6E; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👋 Complete Your Profile</h1>
        </div>
        <div class="content">
            <p>Hi <strong>{{ $user->name }}</strong>,</p>

            <p>We noticed that your profile is still incomplete. To unlock all features and activate your account, please take a few minutes to complete the remaining steps.</p>

            <p>Your current profile completion:</p>
            <div class="progress-container">
                <div class="progress-bar" style="width: {{ $percentage }}%;">
                    {{ $percentage }}%
                </div>
            </div>

            @if(!empty($missingItems))
                <div class="missing-list">
                    <h3>📋 Missing Items:</h3>
                    <ul>
                        @foreach($missingItems as $item)
                            <li>{{ $item }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            @if($userType === 'staff')
                <p>As a <span class="highlight">Staff member</span>, you need to complete:</p>
                <ul>
                    <li>All personal information fields</li>
                    <li>Required documents (TFN, Super, Onboarding forms)</li>
                    <li>Valid document expiry dates</li>
                </ul>
            @elseif($userType === 'contractor')
                <p>As a <span class="highlight">Contractor</span>, you need to complete:</p>
                <ul>
                    <li>All personal information fields</li>
                    <li>Upload required documents with valid expiry dates</li>
                    @if(in_array(strtolower($user->state ?? ''), ['victoria', 'queensland']))
                        <li>Upload your Labour Hire document</li>
                    @endif
                    <li>Set your state charge rates</li>
                </ul>
            @else
                <p>Please complete all required fields to activate your account.</p>
            @endif

            <center>
                <a href="https://staffoo.com.au" class="btn">Complete My Profile →</a>
            </center>

            <p style="font-size: 13px; color: #6c757d; margin-top: 30px;">
                If you've already completed these steps, please disregard this email. It may take a few minutes for our system to update.
            </p>
        </div>
        <div class="footer">
<!-- App download badges -->
<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto; padding:20px 0 10px 0;">
<tr>
<td style="padding:0 5px;"><a href="https://apps.apple.com/pk/app/staffoo/id6798964069" target="_blank"><img src="https://apis.staffoo.com.au/uploads/app-store-badge.png" alt="Download on the App Store" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
<td style="padding:0 5px;"><a href="https://play.google.com/store/apps/details?id=com.staffoo" target="_blank"><img src="https://apis.staffoo.com.au/uploads/google-play-badge.png" alt="Get it on Google Play" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
</tr>
</table>
            <p>© {{ date('Y') }} STAFFOO. All rights reserved.</p>
            <p>This is an automated reminder. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>