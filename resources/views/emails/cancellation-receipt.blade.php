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
    .receipt-box { background: #F7F9FC; border-left: 4px solid #F0A500;
                   padding: 12px 16px; margin: 18px 0; border-radius: 4px; }
    .receipt-box strong { color: #1A2E4A; }
    .summary-table { width: 100%; border-collapse: collapse; margin: 18px 0; }
    .summary-table th { background: #1A2E4A; color: #fff; padding: 8px 12px; text-align: left; font-size: 13px; }
    .summary-table td { padding: 8px 12px; border-bottom: 1px solid #E5E7EB; font-size: 13px; }
    .summary-table tr:last-child td { border-bottom: none; }
    .highlight-row td { background: #FFF8EC; font-weight: bold; }
    .refund-row td { background: #ECFDF5; color: #065F46; font-weight: bold; }
    .no-refund-row td { background: #FEF3C7; color: #92400E; }
    .fee-row td { background: #FEF2F2; color: #991B1B; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
    .badge-fee  { background: #FEE2E2; color: #991B1B; }
    .badge-free { background: #D1FAE5; color: #065F46; }
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
    <h2>Hi {{ $clientName }},</h2>
    <p>Your job booking has been cancelled. Please find the cancellation summary below.</p>

    <div class="receipt-box">
      <strong>Receipt #:</strong> {{ $receiptNumber }}<br>
      <strong>Date:</strong> {{ now()->format('d M Y') }}<br>
      <strong>Reference:</strong> {{ $paymentIntentId }}
    </div>

    <!-- Payment Summary -->
    <table class="summary-table">
      <thead>
        <tr><th colspan="2">Payment Summary</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Amount Originally Charged</td>
          <td><strong>A${{ number_format($totalCharged, 2) }}</strong></td>
        </tr>
        <tr class="fee-row">
          <td>Cancellation Fee (4-hour minimum)</td>
          <td><strong>A${{ number_format($cancellationFee, 2) }}</strong></td>
        </tr>
        @if($refundAmount > 0)
        <tr class="refund-row">
          <td>Refund to Original Payment Method</td>
          <td><strong>A${{ number_format($refundAmount, 2) }}</strong></td>
        </tr>
        @else
        <tr class="no-refund-row">
          <td>Refund</td>
          <td><strong>No refund due</strong></td>
        </tr>
        @endif
      </tbody>
    </table>

    @if($refundAmount > 0)
    <p>A refund of <strong>A${{ number_format($refundAmount, 2) }}</strong> has been issued to your original payment method. Please allow 5–10 business days for the refund to appear.</p>
    @else
    <p>No refund is applicable as the cancellation fee covers the full amount charged.</p>
    @endif

    <!-- Cancellation Details Per Job -->
    @if(!empty($cancellationDetails))
    <table class="summary-table" style="margin-top: 24px;">
      <thead>
        <tr><th colspan="4">Cancellation Details</th></tr>
        <tr style="background:#2d4a6e;">
          <th>Job #</th>
          <th>Region</th>
          <th>Notice Given</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        @foreach($cancellationDetails as $detail)
        <tr>
          <td>#{{ $detail['job_id'] }}</td>
          <td>{{ ucfirst($detail['region']) }}</td>
          <td>{{ $detail['hours_until_shift'] }} hr(s)</td>
          <td>
            @if($detail['fee_applied'])
              <span class="badge badge-fee">Fee Applied</span>
            @else
              <span class="badge badge-free">No Fee</span>
            @endif
          </td>
        </tr>
        @endforeach
      </tbody>
    </table>
    @endif

    <p style="color:#6B7280; font-size:12px; margin-top:20px;">
      Cancellation policy: Jobs cancelled less than 2 hours before shift start (Metro) or less than 4 hours (Regional) are subject to a minimum 4-hour charge.<br><br>
      If you have any questions, please contact us at <a style="color:#1A2E4A;">admin@staffoo.com.au</a>.
    </p>
  </div>

  <div class="footer">
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto; padding:20px 0 10px 0;">
      <tr>
        <td style="padding:0 5px;"><a href="https://apps.apple.com/pk/app/staffoo/id6798964069" target="_blank"><img src="https://apis.staffoo.com.au/uploads/app-store-badge.png" alt="Download on the App Store" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
        <td style="padding:0 5px;"><a href="https://play.google.com/store/apps/details?id=com.staffoo" target="_blank"><img src="https://apis.staffoo.com.au/uploads/google-play-badge.png" alt="Get it on Google Play" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
      </tr>
    </table>
    &copy; {{ date('Y') }} STAFFOO &nbsp;|&nbsp; ABN: 48 613 317 838<br>
    admin@staffoo.com.au
  </div>

</div>
</body>
</html>
