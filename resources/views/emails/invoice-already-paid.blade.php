<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Payment Already Held</title>
<style>
    body { font-family: Arial, Helvetica, sans-serif; background:#F3F4F6; margin:0; padding:0; }
    .wrapper { max-width: 480px; margin: 60px auto; padding: 32px; background:#fff; border:1px solid #E5E7EB; border-radius:10px; text-align:center; }
    .icon { width:56px; height:56px; margin:0 auto 16px; border-radius:50%; background:#ECFDF5; color:#065F46; font-size:28px; line-height:56px; }
    h1 { font-size:19px; color:#111827; margin:0 0 8px; }
    p { font-size:14px; color:#6B7280; line-height:1.6; margin:0 0 6px; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="icon">&#10003;</div>
    <h1>Payment Already Processed</h1>
    <p>
        @if($invoiceNumber)
            Invoice {{ $invoiceNumber }} has already been paid/held.
        @else
            This invoice has already been paid/held.
        @endif
    </p>
    <p>No further action is needed — the job has already been confirmed.</p>
</div>
</body>
</html>