<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 14px; color: #333; background: #f4f4f4; margin:0; padding:0; }
    .wrapper { max-width: 580px; margin: 30px auto; background: #fff; border-radius: 8px; overflow:hidden;
               box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header  { background: #ffffff; padding: 20px 30px; border-bottom: 3px solid #F0A500; }
    .header img { height: 52px; display: block; }
    .body    { padding: 28px 30px; }
    h2       { color: #1A2E4A; margin-bottom: 8px; }
    p        { line-height: 1.7; color: #555; }
    .invoice-box { background: #F7F9FC; border-left: 4px solid #F0A500;
                   padding: 12px 16px; margin: 18px 0; border-radius: 4px; }
    .invoice-box strong { color: #1A2E4A; }
    .footer  { background: #F7F9FC; padding: 14px 30px; text-align:center;
               font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; }
  </style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo">
  </div>

  <div class="body">
    @if($isAdmin)
      <h2>New Job Invoice – Admin Notification</h2>
      <p>A new job has been created and payment held for <strong>{{ $clientName }}</strong>.</p>
    @else
      <h2>Hi {{ $clientName }},</h2>
      <p>Thank you for booking with Staffoo. Your payment has been successfully held and your shifts are now pending assignment.</p>
    @endif

    <div class="invoice-box">
      <strong>Invoice #:</strong> {{ $invoiceNumber }}<br>
      <strong>Date:</strong> {{ now()->format('d M Y') }}
    </div>

    <p>Please find your detailed invoice attached to this email as a PDF. It includes a full breakdown of your shifts, hours, and payment summary.</p>

    @if(!$isAdmin)
      <p style="color:#6B7280; font-size:12px; margin-top:16px;">
        If you have any questions about this invoice, please contact us at
        <a style="color:#1A2E4A;">admin@staffoo.com.au</a>.
      </p>
    @endif
  </div>

  <div class="footer">
    &copy; {{ date('Y') }} STAFFOO &nbsp;|&nbsp; ABN: 48 613 317 838<br>
    admin@staffoo.com.au
  </div>

</div>
</body>
</html>