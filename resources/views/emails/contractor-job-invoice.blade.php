<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Job Invoice</title>
</head>
<body style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">

    <h2>Job Confirmation / Invoice</h2>

    <p>The following job has been accepted and staffed by a resource partner.</p>

    <h3>Resource Partner (Contractor) Details</h3>
    <table cellpadding="6" cellspacing="0" border="0">
        <tr>
            <td><strong>Name:</strong></td>
            <td>{{ $invoiceData['contractor_name'] ?? '-' }}</td>
        </tr>
        @if(!empty($invoiceData['contractor_company']))
        <tr>
            <td><strong>Company:</strong></td>
            <td>{{ $invoiceData['contractor_company'] }}</td>
        </tr>
        @endif
        @if(!empty($invoiceData['contractor_abn']))
        <tr>
            <td><strong>ABN:</strong></td>
            <td>{{ $invoiceData['contractor_abn'] }}</td>
        </tr>
        @endif
        @if(!empty($invoiceData['contractor_email']))
        <tr>
            <td><strong>Email:</strong></td>
            <td>{{ $invoiceData['contractor_email'] }}</td>
        </tr>
        @endif
        @if(!empty($invoiceData['contractor_phone']))
        <tr>
            <td><strong>Phone:</strong></td>
            <td>{{ $invoiceData['contractor_phone'] }}</td>
        </tr>
        @endif
    </table>

    <h3>Job Details</h3>
    <table cellpadding="6" cellspacing="0" border="0">
        <tr>
            <td><strong>Guard Assigned:</strong></td>
            <td>{{ $invoiceData['guard_name'] ?? '-' }}</td>
        </tr>
        <tr>
            <td><strong>Site Address:</strong></td>
            <td>{{ $invoiceData['roster']->address ?? '-' }}</td>
        </tr>
        <tr>
            <td><strong>Start:</strong></td>
            <td>{{ $invoiceData['roster']->start ?? '-' }}</td>
        </tr>
        <tr>
            <td><strong>End:</strong></td>
            <td>{{ $invoiceData['roster']->end ?? '-' }}</td>
        </tr>
        <tr>
            <td><strong>Hours:</strong></td>
            <td>{{ $invoiceData['roster']->hours ?? '-' }}</td>
        </tr>
    </table>

    <p style="margin-top: 24px; font-size: 12px; color: #888;">
        This job was fulfilled by a resource partner, not Staffoo staff directly.
        All billing correspondence for this shift should reference the contractor above.
    </p>

<div style="text-align:center; margin-top:24px;">
<!-- App download badges -->
<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto; padding:20px 0 10px 0;">
<tr>
<td style="padding:0 5px;"><a href="https://apps.apple.com/pk/app/staffoo/id6798964069" target="_blank"><img src="https://apis.staffoo.com.au/uploads/app-store-badge.png" alt="Download on the App Store" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
<td style="padding:0 5px;"><a href="https://play.google.com/store/apps/details?id=com.staffoo" target="_blank"><img src="https://apis.staffoo.com.au/uploads/google-play-badge.png" alt="Get it on Google Play" width="120" height="41" style="display:block; border:0; width:120px; height:auto;"></a></td>
</tr>
</table>
</div>
</body>
</html>