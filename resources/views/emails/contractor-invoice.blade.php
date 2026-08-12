<p>Hi {{ $clientName }},</p>

<p>Please find attached invoice <strong>{{ $invoiceNumber }}</strong> from {{ $contractorName }}.</p>

<p>
    <a href="{{ $paymentLink }}"
       style="background:#0A7C6E;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px;">
        Pay Now
    </a>
</p>

<p>your job has been accepted. Please proceed to payment via Stripe, which will be hold until the job is completed.</p><br>
<p>Once payment is completed the job will be confirmed automatically.</p>

<p>Thank you,<br>{{ $contractorName }}</p>