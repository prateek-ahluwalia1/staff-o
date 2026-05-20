<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Fields Example</title>
    <!-- Include Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <style>
        .password-field {
            position: relative; /* Allows positioning of the icon next to the input */
            }

            .password-toggle {
            position: absolute;
            top: 70%;
            right: 10px; /* Adjust right padding as needed */
            transform: translateY(-50%); /* Center the icon vertically */
            cursor: pointer;
            color: #ccc; /* Adjust color as needed */
            }
        body {
            background: linear-gradient(to bottom, #6c757d, #EEF9FC);
            color: white;
        }

        .card {
            background-color: #EEF9FC;
        }
    </style>
</head>

<body>

        <section class="vh-100 gradient-custom">
        <div class="container py-5 h-100">
            <div class="row d-flex justify-content-center align-items-center h-100">
            <div class="col-12 col-md-8 col-lg-6 col-xl-5">
                <div class="card text-white" style="border-radius: 1rem;">
                <div class="card-body p-5 text-center">

                    <div class="logo-container d-flex justify-content-center pb-5">
                    <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Logo" width="150" height="50">
                    </div>

                    <div id="messageContainer"></div>

                    <form id="passwordResetForm">

                    <p class="text-black-50 mb-5">Reset Your Password</p>

                    <div class="form-outline form-white mb-4">
                        <input type="hidden" name="token" value="{{ $token }}" id="token"
                        class="form-control form-control-lg" />
                    </div>

                    <div class="form-outline text-black-50 form-white mb-4 password-field">
                    <label class="form-label" for="password">Password</label>
                    <input id="password" type="password" name="password" required autocomplete="new-password" class="form-control form-control-lg" />
                    <i class="fas fa-eye-slash password-toggle"></i>
                    </div>

                    <div class="form-outline text-black-50 form-white mb-4 password-field">
                    <label class="form-label" for="confirmPassword">Confirm Password</label>
                    <input id="confirmPassword" type="password" name="password_confirmation" required autocomplete="new-password" class="form-control form-control-lg" />
                    <i class="fas fa-eye-slash password-toggle"></i>
                    </div>

                    <button type="submit" class="btn btn-outline-dark btn-lg px-5">Reset Password</button>

                    </form>

                </div>
                </div>
            </div>
            </div>
        </div>
        </section>

    <!-- Include Bootstrap JS (optional) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>

    <script>
        $(document).ready(function () {
            $('.password-toggle').click(function () {
                $(this).siblings('input').attr('type', $(this).hasClass('fa-eye') ? 'password' : 'text');
                $(this).toggleClass('fa-eye fa-eye-slash');
            });
            $('#passwordResetForm').submit(function (event) {
                event.preventDefault();
                var token = $('#token').val();
                var password = $('#password').val();
                var confirmPassword = $('#confirmPassword').val();

                if (password !== confirmPassword) {
                    $('#confirmPassword').addClass('is-invalid');
                    return;
                }

                $.ajax({
                    type: 'POST',
                    url: '{{ route('password.update') }}',
                    data: {
                        _token: '{{ csrf_token() }}',
                        token: token,
                        password: password,
                        password_confirmation: confirmPassword
                    },
                    success: function (response) {
                        $('#messageContainer').html('<div class="alert text-black-50" role="alert">Password has been successfully reset.</div>');

                        $('#passwordResetForm').prop('disabled', true);

                        setTimeout(function () {
                        $('#passwordResetForm').hide();

                        var loginButton = $('<button class="btn btn-info">Login</button>');
                        loginButton.click(function () {
                            window.location.href = 'https://app.staffoo.com.au/login';
                        });
                        $('#messageContainer').after(loginButton);

                        }, 1000);
                    },
                    error: function (xhr, status, error) {
                        if (xhr.status === 404) {
                                $('#messageContainer').html('<div class="alert alert-danger" role="alert">' + xhr.responseJSON.message + '</div>');
                                $('#passwordResetForm').hide();
                            } else {
                                $('#messageContainer').html('<div class="alert alert-danger" role="alert">An unexpected error occurred. Please try again later.</div>');
                            }
                    }
                    });
            });
        });
    </script>

</body>

</html>
