<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #222;">
    <p>Hi {{ $name }},</p>
    <p>Your STAFFOO account has been created ({{ ucfirst($accountType) }} account).</p>
    <table style="margin: 16px 0;">
        <tr><td style="padding-right: 12px; color: #555;">Email</td><td><strong>{{ $email }}</strong></td></tr>
        <tr><td style="padding-right: 12px; color: #555;">Temporary password</td><td><strong>{{ $password }}</strong></td></tr>
    </table>
    <p>{{ $typeExplanation }}</p>
    <p>Please log in and change your password, and verify your email to finish activating the account.</p>
    <p>— STAFFOO</p>
</body>
</html>
