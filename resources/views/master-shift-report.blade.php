<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>STAFFOO - End Shift Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #2d2d2d;
    background: #fff;
  }

  /* HEADER */
  .page-header {
    display: table;
    width: 100%;
    background: #1b2a4a;
    padding: 14px 20px;
    margin-bottom: 0;
  }
  .page-header .logo-cell {
    display: table-cell;
    vertical-align: middle;
    width: 160px;
  }
  .page-header .logo-cell img {
    height: 38px;
    width: auto;
  }
  .page-header .title-cell {
    display: table-cell;
    vertical-align: middle;
    text-align: right;
  }
  .page-header .title-cell .report-label {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .page-header .title-cell .report-sub {
    font-size: 11px;
    color: #a8bcd4;
    letter-spacing: 1px;
    margin-top: 2px;
  }

  /* Gold accent bar */
  .accent-bar {
    height: 4px;
    background: linear-gradient(to right, #e8a020, #f5c842, #e8a020);
    margin-bottom: 18px;
  }

  /* SHIFT SUMMARY */
  .shift-summary {
    background: #f0f4fb;
    border: 1px solid #c8d4e8;
    border-left: 4px solid #1b2a4a;
    border-radius: 0 4px 4px 0;
    padding: 12px 16px;
    margin-bottom: 20px;
  }
  .shift-summary .summary-title {
    font-size: 11px;
    font-weight: 700;
    color: #1b2a4a;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }
  .shift-summary table { width: 100%; border-collapse: collapse; }
  .shift-summary td { font-size: 12px; padding: 3px 0; color: #444; }
  .shift-summary td .lbl { font-weight: 700; color: #1b2a4a; }
  .badge {
    display: inline-block;
    background: #e8a020;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 10px;
  }

  /* SECTION HEADINGS */
  .sec-heading {
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    background: #2e4a7a;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 5px 10px;
    border-radius: 3px;
    margin: 14px 0 8px 0;
  }

  /* ATTENDANCE CARD */
  .attendance-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
  }
  .attendance-row {
    display: table;
    width: 100%;
    margin-bottom: 8px;
  }
  .attendance-cell {
    display: table-cell;
    width: 33.33%;
    font-size: 12px;
    color: #444;
    padding: 4px;
  }
  .attendance-cell .lbl {
    font-weight: 700;
    color: #1b2a4a;
  }

  /* BREAKS TABLE */
  .breaks-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    margin-bottom: 16px;
  }
  .breaks-table thead tr {
    background: #e8edf8;
  }
  .breaks-table thead th {
    text-align: left;
    padding: 6px 8px;
    font-weight: 700;
    color: #1b2a4a;
    border: 1px solid #c8d4e8;
  }
  .breaks-table tbody td {
    padding: 6px 8px;
    border: 1px solid #d8e0ee;
    color: #444;
    vertical-align: top;
  }

  /* INCIDENT / PATROL BLOCK */
  .report-block {
    border: 1px solid #d0d9ea;
    border-radius: 6px;
    margin-bottom: 26px;
    page-break-inside: avoid;
    overflow: hidden;
  }
  .report-header {
    background: #1b2a4a;
    padding: 8px 16px;
    display: table;
    width: 100%;
  }
  .report-header .report-num {
    display: table-cell;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.5px;
    vertical-align: middle;
  }
  .report-header .report-badge {
    display: table-cell;
    text-align: right;
    vertical-align: middle;
  }
  .report-header .report-badge span {
    background: #e8a020;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 3px;
  }
  .report-body {
    padding: 14px 16px;
  }

  /* INFO GRID */
  .info-grid {
    display: table;
    width: 100%;
    margin-bottom: 8px;
  }
  .info-col {
    display: table-cell;
    width: 50%;
    font-size: 12px;
    color: #444;
    padding: 2px 0;
  }
  .info-col .lbl {
    font-weight: 700;
    color: #1b2a4a;
  }

  .detail-row {
    font-size: 12px;
    color: #444;
    margin-bottom: 12px;
    line-height: 1.5;
    padding: 10px;
    background: #f8fafc;
    border-radius: 8px;
  }
  .detail-row .lbl {
    font-weight: 700;
    color: #1b2a4a;
    display: block;
    margin-bottom: 5px;
  }

  /* DATA TABLES */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    margin-bottom: 8px;
  }
  .data-table thead tr {
    background: #e8edf8;
  }
  .data-table thead th {
    text-align: left;
    padding: 6px 8px;
    font-weight: 700;
    color: #1b2a4a;
    border: 1px solid #c8d4e8;
  }
  .data-table tbody td {
    padding: 6px 8px;
    border: 1px solid #d8e0ee;
    color: #444;
    vertical-align: top;
  }
  .data-table tbody tr:nth-child(even) {
    background: #f6f8fd;
  }
  .no-data {
    font-size: 11px;
    color: #94a3b8;
    font-style: italic;
    padding: 8px;
    background: #f8fafc;
    border-radius: 6px;
    text-align: center;
  }

  /* EMERGENCY SERVICES */
  .emergency-box {
    background: #fff8f0;
    border: 1px solid #f0c878;
    border-left: 4px solid #e8a020;
    border-radius: 0 4px 4px 0;
    padding: 10px 14px;
  }
  .em-grid {
    display: table;
    width: 100%;
    margin-bottom: 5px;
  }
  .em-col {
    display: table-cell;
    width: 50%;
    font-size: 12px;
    color: #444;
    vertical-align: top;
    padding: 2px 0;
  }
  .em-col .lbl {
    font-weight: 700;
    color: #1b2a4a;
  }

  /* PHOTOS */
  .photo-wrapper {
    margin-top: 4px;
  }
  .photo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .photo-cell-wrap {
    width: 140px;
    text-align: center;
  }
  .photo-cell-wrap img {
    width: 128px;
    height: 96px;
    object-fit: cover;
    border: 2px solid #c8d4e8;
    border-radius: 4px;
  }
  .photo-placeholder {
    width: 128px;
    height: 96px;
    border: 2px dashed #c8d4e8;
    border-radius: 4px;
    background: #f6f8fd;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .photo-placeholder-inner {
    font-size: 10px;
    color: #94a3b8;
    font-style: italic;
  }

  /* SIGNATURE */
  .sig-wrap {
    margin-top: 4px;
  }
  .sig-wrap img {
    height: 65px;
    max-width: 220px;
    border: 1px solid #c8d4e8;
    border-radius: 4px;
    background: #fff;
    padding: 4px;
  }
  .sig-placeholder {
    width: 220px;
    height: 65px;
    border: 2px dashed #c8d4e8;
    border-radius: 4px;
    background: #f6f8fd;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sig-placeholder-inner {
    font-size: 10px;
    color: #94a3b8;
    font-style: italic;
  }

  /* FOOTER */
  .page-footer {
    margin-top: 30px;
    border-top: 1px solid #d0d9ea;
    padding-top: 15px;
    text-align: center;
    font-size: 10px;
    color: #888;
    line-height: 1.6;
  }

  @media print {
    body {
      background: white;
    }
    .report-block {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
</style>
</head>
<body>

@php
/* Safe scalar string */
function safeStr($val, $fallback = 'N/A'): string {
    if (is_null($val))   return $fallback;
    if (is_array($val))  return implode(', ', array_filter(array_map('strval', $val), fn($v) => $v !== '')) ?: $fallback;
    if (is_object($val)) return $fallback;
    $s = trim((string) $val);
    return $s !== '' ? $s : $fallback;
}

/* Safe date formatter */
function safeDate($val): string {
    if (empty($val)) return 'N/A';
    try {
        $raw = explode(' ', trim((string)$val))[0];
        if (str_contains($raw, '/'))
            return \Carbon\Carbon::createFromFormat('d/m/Y', $raw)->format('d/m/Y');
        return \Carbon\Carbon::createFromFormat('Y-m-d', $raw)->format('d/m/Y');
    } catch (\Exception $e) { return (string) $val; }
}

// Logo as Base64
$logo  = "https://apis.staffoo.com.au/uploads/staffologo.png";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $logo);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$imageData = curl_exec($ch);
curl_close($ch);

$logoBase64 = base64_encode($imageData);

// Get signature URL
function getSignatureUrl($sig) {
    if (empty($sig)) return '';
    if (filter_var($sig, FILTER_VALIDATE_URL)) return $sig;
    return config('app.url') . '/' . ltrim($sig, '/');

}

// Ensure array helper
function toList($val): array {
    if (empty($val)) return [];
    if (is_string($val)) $val = json_decode($val, true);
    if (is_object($val)) $val = (array) $val;
    if (!is_array($val)) return [];
    if (count($val) > 0 && array_keys($val) !== range(0, count($val) - 1)) return [$val];
    return $val;
}

function toFlat($val): array {
    if (empty($val)) return [];
    if (is_string($val)) $val = json_decode($val, true);
    if (is_object($val)) return (array) $val;
    if (!is_array($val)) return [];
    if (isset($val[0]) && is_array($val[0])) return $val[0];
    return $val;
}
@endphp

{{-- HEADER --}}
<div class="page-header">
  <div class="logo-cell">
    <img src="data:image/png;base64,{{ $logoBase64 }}" alt="Image">
  </div>
  <div class="title-cell">
    <div class="report-label">End Shift Report</div>
  </div>
</div>
<div class="accent-bar"></div>

{{-- SHIFT SUMMARY --}}
<div class="shift-summary">
  <div class="summary-title">Shift Summary</div>
  <table>
    <tr>
      <td width="50%"><span class="lbl">Guard:</span> {{ $staff ?? 'N/A' }}</td>
      <td width="50%"><span class="lbl">Site:</span> {{ $location ?? 'N/A' }}</td>
    </tr>
    <tr>
      <td><span class="lbl">Shift:</span> {{ $shift_start ?? 'N/A' }} - {{ $shift_end ?? 'N/A' }}</td>
      <td><span class="lbl">Total Hours:</span> {{ $total_hours ?? 'N/A' }}</td>
    </tr>
    <tr>
      <td><span class="lbl">Report Date:</span> {{ $report_date ?? date('d/m/Y') }}</td>
      <td><span class="lbl">Status:</span> <span>{{ $status ?? 'COMPLETED' }}</span></td>
    </tr>
</div>

{{-- ATTENDANCE / SIGN IN-OUT --}}
<div class="sec-heading">Attendance Details</div>
<div class="attendance-card">
  <div class="attendance-row">
    <div class="attendance-cell"><span class="lbl">Sign In Time:</span> {{ !empty($guardActivity->signin_time) ? \Carbon\Carbon::parse($guardActivity->sign_in)->format('d/m/Y H:i') : 'N/A' }}</div>
    <div class="attendance-cell"><span class="lbl">Sign In Location:</span> {{ $guardActivity->location ?? 'N/A' }}</div>
    <div class="attendance-cell"><span class="lbl">Sign In Notes:</span> {{ $guardActivity->signin_notes ?? 'N/A' }}</div>
  </div>
  <div class="attendance-row">
    <div class="attendance-cell"><span class="lbl">Sign Out Time:</span> {{ !empty($guardActivity->signout_time) ? \Carbon\Carbon::parse($guardActivity->sign_out)->format('d/m/Y H:i') : 'N/A' }}</div>
    <div class="attendance-cell"><span class="lbl">Sign Out Location:</span> {{ $guardActivity->location ?? 'N/A' }}</div>
    <div class="attendance-cell"><span class="lbl">Sign Out Notes:</span> {{ $guardActivity->signout_notes ?? 'N/A' }}</div>
  </div>
</div>

{{-- FOOT PATROL REPORTS --}}
@if(count($footPatrolReports) > 0)
  <div class="sec-heading">Foot Patrol Reports</div>
  @foreach($footPatrolReports as $index => $patrol)
  @php
    $photoList = is_array($patrol->photo) ? $patrol->photo : [];
    $sig = $patrol->signature ?? '';
  @endphp
  <div class="report-block">
    <div class="report-header">
      <div class="report-num">FOOT PATROL #{{ $index + 1 }}</div>
    </div>
    <div class="report-body">
      <div class="info-grid">
        <div class="info-col"><span class="lbl">Date:</span> {{ safeDate($patrol->date ?? null) }}</div>
        <div class="info-col"><span class="lbl">Time:</span> {{ safeStr($patrol->time ?? null) }}</div>
      </div>
      <div class="info-grid">
        <div class="info-col"><span class="lbl">Site:</span> {{ safeStr($patrol->site_name ?? null) }}</div>
      </div>
      <div class="detail-row">
        <span class="lbl">Patrolling Detail</span>
        {{ safeStr($patrol->patrolling_detail ?? null) }}
      </div>
      
      <div class="sec-heading" style="background: #4a6a8a;">Photos</div>
      <div class="photo-wrapper">
        @if(count($photoList) > 0)
          <div class="photo-row">
            @foreach($photoList as $photo)
            @php
              $photo   = is_array($photo) ? $photo : (array)$photo;
              $imgPath = trim(safeStr($photo['imgPath']   ?? null, ''));
              $imgTs   = safeStr($photo['timestamp']      ?? null, '');
              $imgUrl = !empty($imgPath) ? config('app.url') . '/footpatrol/' . $imgPath : '';
              $ch = curl_init();
              curl_setopt($ch, CURLOPT_URL, $imgUrl);
              curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
              $imageData = curl_exec($ch);
              curl_close($ch);

              $base64 = base64_encode($imageData);
            @endphp
            @if(!empty($base64))
            <div class="photo-cell-wrap">
              <img src="data:image/jpeg;base64,{{ $base64 }}" alt="Patrol Photo">
            </div>
            @endif
            @endforeach
          </div>
        @else
          <div class="photo-row">
            <div class="photo-cell-wrap">
              <div class="photo-placeholder">
                <div class="photo-placeholder-inner">No photos</div>
              </div>
            </div>
          </div>
        @endif
      </div>
      
      <div class="sec-heading" style="background: #4a6a8a;">Signature</div>
      <div class="sig-wrap">
        @if(!empty($sig))
          @php
            $footsigimgUrl  = !empty($sig) ? config('app.url') . '/footpatrol/' . $sig : '';
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $footsigimgUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $imageData = curl_exec($ch);
            curl_close($ch);

            $footsigbase64 = base64_encode($imageData);
          @endphp
          @if(!empty($footsigbase64))
            <img src="data:image/jpeg;base64,{{ $footsigbase64 }}" alt="Signature">
          @else
            <div class="sig-placeholder"><div class="sig-placeholder-inner">Signature N/A</div></div>
          @endif
        @else
          <div class="sig-placeholder"><div class="sig-placeholder-inner">No signature</div></div>
        @endif
      </div>
    </div>
  </div>
  @endforeach
@endif

{{-- INCIDENT REPORTS --}}
@if(count($incidentReports) > 0)
  <div class="sec-heading">Incident Reports</div>
  @foreach($incidentReports as $index => $report)
  @php
    $peopleList   = toList($report->people_involved ?? null);
    $vehicleList  = toList($report->vehicle ?? null);
    $witnessList  = toList($report->wittness ?? null);
    $emergency    = toFlat($report->emergency_services ?? null);
    $photoList    = is_array($report->photo) ? $report->photo : [];
    $sig = $report->signature ?? '';
  @endphp
  <div>
    <div class="report-header">
      <div class="report-num">INCIDENT #{{ $index + 1 }}</div>
      <div class="report-badge"><span>{{ safeStr($report->injury_type ?? null) }}</span></div>
    </div>
    <div class="report-body">
      <div class="info-grid">
        <div class="info-col"><span class="lbl">Date:</span> {{ safeDate($report->incident_date ?? null) }}</div>
        <div class="info-col"><span class="lbl">Time:</span> {{ safeStr($report->incident_time ?? null) }}</div>
      </div>
      <div class="info-grid">
        <div class="info-col"><span class="lbl">Site:</span> {{ safeStr($report->site_name ?? null) }}</div>
      </div>
      <div class="detail-row">
        <span class="lbl">Incident Detail</span>
        {{ safeStr($report->injury_detail ?? null) }}
      </div>
      
      @if(count($peopleList) > 0)
        <div class="sec-heading" style="background: #4a6a8a;">People Involved</div>
        <table class="data-table">
          <thead><tr><th>Name</th><th>Gender</th><th>Phone</th><th>Email</th></tr></thead>
          <tbody>
            @foreach($peopleList as $person)
            <tr>
              <td>{{ safeStr($person['name'] ?? null) }}</td>
              <td>{{ safeStr($person['gender'] ?? null) }}</td>
              <td>{{ safeStr($person['phone'] ?? null) }}</td>
              <td>{{ safeStr($person['email'] ?? null) }}</td>
            </tr>
            @endforeach
          </tbody>
        </table>
      @endif
      
      @if(count($vehicleList) > 0)
        <div class="sec-heading" style="background: #4a6a8a;">Vehicles</div>
        <table class="data-table">
          <thead><tr><th>Make</th><th>Model</th><th>Type</th><th>Registration</th></tr></thead>
          <tbody>
            @foreach($vehicleList as $v)
            <tr>
              <td>{{ safeStr($v['make'] ?? null) }}</td>
              <td>{{ safeStr($v['model'] ?? null) }}</td>
              <td>{{ safeStr($v['vehicle_type'] ?? null) }}</td>
              <td>{{ safeStr($v['vehicle_rander'] ?? null) }}</td>
            </tr>
            @endforeach
          </tbody>
        </table>
      @endif
      
      @if(count($witnessList) > 0)
        <div class="sec-heading" style="background: #4a6a8a;">Witnesses</div>
        <table class="data-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th></tr></thead>
          <tbody>
            @foreach($witnessList as $w)
            <tr>
              <td>{{ safeStr($w['wittness_name'] ?? null) }}</td>
              <td>{{ safeStr($w['wittness_phone'] ?? null) }}</td>
              <td>{{ safeStr($w['wittness_email'] ?? null) }}</td>
            </tr>
            @endforeach
          </tbody>
        </table>
      @endif
      
      @if(!empty($emergency))
        <div class="sec-heading" style="background: #4a6a8a;">Emergency Services</div>
        <div class="emergency-box">
          <div class="em-grid">
            <div class="em-col"><span class="lbl">Type:</span> {{ safeStr($emergency['emergency_type'] ?? null) }}</div>
            <div class="em-col"><span class="lbl">Supervisor:</span> {{ safeStr($emergency['supervisor_name'] ?? null) }}</div>
          </div>
          <div class="em-grid">
            <div class="em-col"><span class="lbl">Detail:</span> {{ safeStr($emergency['emergency_detail'] ?? null) }}</div>
            <div class="em-col"><span class="lbl">Phone:</span> {{ safeStr($emergency['phone'] ?? null) }}</div>
          </div>
        </div>
      @endif
      
      <div class="sec-heading" style="background: #4a6a8a;">Photos</div>
      <div class="photo-wrapper">
        @if(count($photoList) > 0)
          <div class="photo-row">
            @foreach($photoList as $photo)
            @php
               $photo   = is_array($photo) ? $photo : (array)$photo;
              $imgPath = trim(safeStr($photo['imgPath']   ?? null, ''));
              $imgTs   = safeStr($photo['timestamp']      ?? null, '');
              $imgUrl = !empty($imgPath) ? config('app.url') . '/incident/' . $imgPath : '';
              $ch = curl_init();
              curl_setopt($ch, CURLOPT_URL, $imgUrl);
              curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
              $imageData = curl_exec($ch);
              curl_close($ch);

              $base64 = base64_encode($imageData);
            @endphp
            @if(!empty($base64))
            <div class="photo-cell-wrap">
              <img src="data:image/jpeg;base64,{{ $base64 }}" alt="Incident Photo">
            </div>
            @endif
            @endforeach
          </div>
        @else
          <div class="photo-row">
            <div class="photo-cell-wrap">
              <div class="photo-placeholder">
                <div class="photo-placeholder-inner">No photos</div>
              </div>
            </div>
          </div>
        @endif
      </div>
      
      <div class="sec-heading" style="background: #4a6a8a;">Signature</div>
      <div class="sig-wrap">
        @if(!empty($sig))
          @php
            $incsigimgUrl  = !empty($sig) ? config('app.url') . '/incident/' . $sig : '';;
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $incsigimgUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $imageData = curl_exec($ch);
            curl_close($ch);

            $incsigbase64 = base64_encode($imageData);
          @endphp
          @if(!empty($incsigbase64))
            <img src="data:image/jpeg;base64,{{ $incsigbase64 }}" alt="Signature">
          @else
            <div class="sig-placeholder"><div class="sig-placeholder-inner">Signature N/A</div></div>
          @endif
        @else
          <div class="sig-placeholder"><div class="sig-placeholder-inner">No signature</div></div>
        @endif
      </div>
    </div>
  </div>
  @endforeach
@endif

</body>
</html>