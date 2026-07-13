<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Fields Example</title>

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <!-- FontAwesome added for the eye icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
        integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    <style>
        body {
            background: linear-gradient(to bottom, #6C757D, #EEF9FC);
            color: white;
            min-height: 100vh;
        }

        .card {
            background-color: #EEF9FC;
        }

        /* Wrapper to keep the eye icon aligned perfectly with the input */
        .input-wrapper {
            position: relative;
        }

        .password-toggle {
            position: absolute;
            top: 50%;
            right: 15px;
            transform: translateY(-50%);
            cursor: pointer;
            color: #ccc;
            z-index: 10;
        }

        .error-text {
            display: none;
            /* Hidden by default */
            font-size: 0.85em;
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

                            <div class="logo-container pb-5">
                                <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Logo" class="w-50"
                                    style="height: auto;">
                            </div>

                            <div id="messageContainer"></div>

                            <form id="passwordResetForm" novalidate>

                                <p class="text-black-50 mb-5">Reset Your Password</p>

                                <div class="form-outline form-white mb-4">
                                    <input type="hidden" name="token" value="{{ $token }}" id="token"
                                        class="form-control form-control-lg" />
                                </div>

                                <div class="form-outline text-black-50 form-white mb-4 text-left">
                                    <label class="form-label font-weight-bold" for="password">Password</label>

                                    <!-- Error message placed ABOVE the input -->
                                    <div class="text-danger font-weight-bold mb-2 error-text" id="passwordError">
                                        Password must contain at least 8 characters, including an uppercase letter, a
                                        lowercase letter, a number, and a special character.
                                    </div>

                                    <div class="input-wrapper">
                                        <input id="password" type="password" name="password" required minlength="8"
                                            autocomplete="new-password" class="form-control form-control-lg" />
                                        <i class="fa-solid fa-eye password-toggle"></i>
                                    </div>
                                </div>

                                <div class="form-outline text-black-50 form-white mb-4 text-left">
                                    <label class="form-label font-weight-bold" for="confirmPassword">Confirm
                                        Password</label>

                                    <!-- Error message placed ABOVE the input -->
                                    <div class="text-danger font-weight-bold mb-2 error-text" id="matchError">
                                        Passwords do not match.
                                    </div>

                                    <div class="input-wrapper">
                                        <input id="confirmPassword" type="password" name="password_confirmation"
                                            required minlength="8" autocomplete="new-password"
                                            class="form-control form-control-lg" />
                                        <i class="fa-solid fa-eye password-toggle"></i>
                                    </div>
                                </div>

                                <button type="submit" class="btn btn-outline-dark btn-lg px-5 mt-3">Reset
                                    Password</button>

                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    <script>
        $(document).ready(function () {

            // Password visibility toggle logic
            $('.password-toggle').click(function () {
                var input = $(this).siblings('input');
                if (input.attr('type') === 'password') {
                    input.attr('type', 'text');
                    $(this).removeClass('fa-eye').addClass('fa-eye-slash');
                } else {
                    input.attr('type', 'password');
                    $(this).removeClass('fa-eye-slash').addClass('fa-eye');
                }
            });

            // Form submission logic
            $('#passwordResetForm').on('submit', function (e) {
                // 1. STOP default form submission immediately
                e.preventDefault();

                var token = $('#token').val();
                var password = $('#password').val();
                var confirmPassword = $('#confirmPassword').val();

                // Regex for: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
                var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
                var isValid = true;

                // Reset visual validation states
                $('#password').removeClass('is-invalid');
                $('#confirmPassword').removeClass('is-invalid');
                $('#passwordError').hide();
                $('#matchError').hide();

                // 2. Validate Password Strength
                if (!passwordRegex.test(password)) {
                    $('#password').addClass('is-invalid');
                    $('#passwordError').show();
                    isValid = false;
                }

                // 3. Validate Password Match
                if (password !== confirmPassword) {
                    $('#confirmPassword').addClass('is-invalid');
                    $('#matchError').show();
                    isValid = false;
                }

                // 4. Stop execution if validation failed
                if (!isValid) {
                    return false; // Crucial: forces the script to halt here
                }

                // 5. If validation passes, proceed with AJAX
                $.ajax({
                    type: 'POST',
                    // Use Double Quotes around the blade directive to prevent JS syntax errors!
                    url: "{{ route('password.update') }}",
                    data: {
                        _token: "{{ csrf_token() }}",
                        token: token,
                        password: password,
                        password_confirmation: confirmPassword
                    },
                    success: function (response) {
                        $('#messageContainer').html('<div class="alert alert-success text-black-50" role="alert">Password has been successfully reset.</div>');

                        $('#passwordResetForm').prop('disabled', true);

                        setTimeout(function () {
                            $('#passwordResetForm').hide();

                            var loginButton = $('<button class="btn btn-info">Login</button>');
                            loginButton.click(function () {
                                window.location.href = 'https://staffoo.com.au/login';
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