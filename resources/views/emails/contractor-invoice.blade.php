<p>Hi {{ $clientName }},</p>

<p>Please find attached invoice <strong>{{ $invoiceNumber }}</strong> from {{ $contractorName }}.</p>

<p>
    <a href="{{ $paymentLink }}"
       style="background:#0A7C6E;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px;">
        Pay Now
    </a>
</p>

<p>Your job has been accepted. Please proceed to payment via Stripe, which will be hold until the job is completed.</p><br>
<p>Once payment is completed the job will be confirmed automatically.</p>

<p>Thank you,<br>{{ $contractorName }}</p><div style="text-align:center; margin-top:24px;">
<!-- App download badges -->
<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto; padding:20px 0 10px 0;">
<tr>
<td style="padding:0 5px;"><a href="https://apps.apple.com/pk/app/staffoo/id6798964069" target="_blank"><img src="https://apis.staffoo.com.au/uploads/app-store-badge.png" alt="Download on the App Store" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
<td style="padding:0 5px;"><a href="https://play.google.com/store/apps/details?id=com.staffoo" target="_blank"><img src="https://apis.staffoo.com.au/uploads/google-play-badge.png" alt="Get it on Google Play" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
</tr>
</table>
</div>
