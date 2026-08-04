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

</body>
</html>