<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Password Reset</title>
</head>

<body style="margin: 100px; text-align: center;">
    <h1>You have requested to reset your password</h1>
    <br>
    <p>
        We received a request to reset your password. Click the button below to create a new password for your account.
    </p>
    <a href="{{ route('password.reset.form', ['token' => $token]) }}" style="background-color: #4CAF50; /* Green */
                                            border: none;
                                            color: white;
                                            padding: 15px 32px;
                                            text-align: center;
                                            text-decoration: none;
                                            display: inline-block;
                                            font-size: 16px;
                                            margin: 4px 2px;
                                            cursor: pointer;
                                            border-radius: 8px;">Reset Password</a>
</body>

</html>
