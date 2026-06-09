<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>STAFFOO - Your Invoice is Ready</title>

    <style>
        body{
            margin:0;
            padding:0;
            background:#f0f7fa;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color:#333333;
        }

        .wrapper{
            width:100%;
            padding:30px 0;
            background:#f0f7fa;
        }

        .container{
            max-width:650px;
            margin:0 auto;
            background:#ffffff;
            border-radius:24px;
            overflow:hidden;
            box-shadow:0 12px 35px rgba(0,0,0,0.05);
        }

        /* Top brand decoration */
        .brand-strip{
            background: linear-gradient(135deg, #0F2B3D 0%, #1B4F6E 100%);
            height:6px;
            font-size:0;
            line-height:0;
        }

        .header{
            background: linear-gradient(135deg, #0F2B3D 0%, #1B4F6E 100%);
            padding:40px 30px;
            text-align:center;
        }

        .logo{
            max-height:70px;
            margin-bottom:15px;
            display:inline-block;
        }

        .header h1{
            margin:0;
            color:#ffffff;
            font-size:32px;
            font-weight:600;
            letter-spacing:1px;
        }

        .header p{
            color:#cbd5e1;
            margin-top:10px;
            font-size:15px;
        }

        .content{
            padding:40px 35px;
            text-align:center;
        }

        .content h2{
            color:#0F2B3D;
            margin-bottom:15px;
            font-size:26px;
            font-weight:600;
        }

        .content p{
            font-size:15px;
            line-height:1.6;
            color:#5A6872;
        }

        /* Invoice Details Card */
        .invoice-details{
            background: linear-gradient(135deg, #F8FCFE 0%, #F0F7FA 100%);
            border-radius:16px;
            padding:25px;
            margin:25px 0;
            border:1px solid #E2E8F0;
        }

        .detail-row{
            display:flex;
            justify-content:space-between;
            padding:12px 0;
            border-bottom:1px solid #E2E8F0;
        }

        .detail-row:last-child{
            border-bottom:none;
        }

        .detail-label{
            font-weight:600;
            color:#1B4F6E;
            font-size:14px;
        }

        .detail-value{
            color:#0F2B3D;
            font-size:14px;
            font-weight:500;
        }

        .invoice-box{
            background:#F8FAFC;
            border:2px dashed #00A37E;
            border-radius:12px;
            padding:20px;
            margin:20px 0;
            text-align:center;
        }

        .invoice-label{
            margin:0;
            color:#00A37E;
            font-size:12px;
            font-weight:600;
            text-transform:uppercase;
            letter-spacing:1px;
        }

        .invoice-name{
            font-size:18px;
            font-weight:bold;
            color:#0F2B3D;
            word-break:break-all;
            margin:10px 0 0 0;
        }

        .btn{
            display:inline-block;
            background: linear-gradient(105deg, #00A37E 0%, #018F6E 100%);
            color:#ffffff !important;
            text-decoration:none;
            padding:14px 35px;
            border-radius:60px;
            font-weight:600;
            font-size:16px;
            margin-top:20px;
            box-shadow:0 6px 14px rgba(0,163,126,0.25);
            transition: all 0.2s ease;
        }

        .btn:hover{
            background: linear-gradient(105deg, #018F6E 0%, #006B51 100%);
            transform:translateY(-2px);
        }

        .notice{
            margin-top:25px;
            font-size:12px;
            color:#8DA1AE;
            background:#F8FAFC;
            padding:12px;
            border-radius:8px;
        }

        .support{
            margin-top:35px;
            padding-top:25px;
            border-top:2px solid #E2E8F0;
            text-align:center;
        }

        .support p{
            margin:8px 0;
            font-size:14px;
            color:#5A6872;
        }

        .support a{
            color:#00A37E;
            text-decoration:none;
            font-weight:600;
        }

        .footer{
            background:#F9FCFD;
            padding:30px 35px;
            text-align:center;
            border-top:1px solid #EAF0F4;
        }

        .footer p{
            margin:8px 0;
            color:#7A8B9B;
            font-size:13px;
        }

        .footer a{
            color:#00A37E;
            text-decoration:none;
        }

        .social-links{
            margin-top:15px;
        }

        .social-links a{
            margin:0 10px;
            color:#1B4F6E;
            font-size:20px;
            text-decoration:none;
        }

        .footer-links{
            margin-top:15px;
        }

        .footer-links a{
            color:#00A37E;
            text-decoration:none;
            font-size:12px;
            margin:0 8px;
        }

        .footer-links span{
            color:#C8D6DE;
        }

        @media only screen and (max-width: 600px) {
            .content{
                padding:30px 20px;
            }
            .header{
                padding:30px 20px;
            }
            .header h1{
                font-size:24px;
            }
            .content h2{
                font-size:22px;
            }
            .btn{
                padding:12px 25px;
                font-size:14px;
            }
        }
    </style>
</head>

<body>

<div class="wrapper">

    <div class="container">

        <!-- Top brand decoration -->
        <div class="brand-strip"></div>

        <div class="header">
            <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="STAFFOO" class="logo">
        </div>

        <div class="content">

            <h2>✨ Your Invoice is Ready</h2>

            <p>
                {{ $description }}
            </p>

            <div class="invoice-box">
                <p class="invoice-label">📄 Invoice File</p>
                <p class="invoice-name">
                    {{ $filename }}
                </p>
            </div>

            <a href="{{ $download_url }}" class="btn">
                📥 Download Invoice
            </a>

            <div class="notice">
                <p style="margin:0;">
                    🔒 If the button above does not work, copy and paste the following link into your browser:
                </p>
                <p style="word-break:break-all;font-size:12px; margin-top:8px;">
                    {{ $download_url }}
                </p>
            </div>

            <div class="support">
                <p style="font-weight:600; color:#0F2B3D;">💬 Need Assistance?</p>
                <p>
                    If you have any questions regarding this invoice, please contact our support team.
                </p>
                <p>
                    📧 <a href="mailto:support@staffoo.com.au">support@staffoo.com.au</a>
                </p>
                <p>
                    🌐 <a href="https://staffoo.com.au">https://staffoo.com.au</a>
                </p>
            </div>

        </div>

        <div class="footer">

            <p style="font-weight:600; color:#1B4F6E;">
                Thank you for choosing STAFFOO
            </p>

            <div class="footer-links">
                <a href="https://staffoo.com.au/about-us">About Us</a>
                <span>|</span>
                <a href="https://staffoo.com.au/privacy-policy">Privacy Policy</a>
                <span>|</span>
                <a href="https://staffoo.com.au/terms-of-use">Terms of Service</a>
            </div>

            <p style="font-size:11px; margin-top:15px;">
                This is an automated email. Please do not reply directly to this message.
            </p>

            <p style="font-size:11px;">
                © {{ date('Y') }} STAFFOO Pty Ltd. All Rights Reserved.
            </p>

        </div>

    </div>

</div>

</body>
</html>