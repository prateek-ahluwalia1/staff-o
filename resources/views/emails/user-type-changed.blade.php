<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Account Type Updated</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">

    <h2>Hi {{ $userName }},</h2>

    <p>
        Your account type has been updated from
        <strong>{{ ucfirst($oldType) }}</strong>
        to
        <strong>{{ ucfirst($newType) }}</strong>.
    </p>

    <p>To start using your account under the new role, please complete the following steps:</p>

    <ol>
        @foreach ($profileSteps as $step)
            <li style="margin-bottom: 12px;">
                <strong>{{ $step['title'] }}</strong>
                @if (!empty($step['required']))
                    <span style="color: #d9534f;">(required)</span>
                @endif
                <br>
                <span>{{ $step['description'] }}</span>
                <br>
                <a href="{{ rtrim(config('app.frontend_url', config('app.url')), '/') . $step['route'] }}">
                    Go to step
                </a>
            </li>
        @endforeach
    </ol>

    <p>
        <a href="{{ $loginUrl }}"
           style="display:inline-block;padding:10px 18px;background:#0d6efd;color:#fff;text-decoration:none;border-radius:4px;">
            Log in to your account
        </a>
    </p>

    <p>If you did not request this change, please contact support immediately.</p>

    <p>Thanks,<br>{{ config('app.name') }}</p>

</body>
</html>