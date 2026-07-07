<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #2d2d2d;
    background: #fff;
  }

  /* ═══════════════════════════════
     HEADER
  ═══════════════════════════════ */
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

  /* ── Gold accent bar ── */
  .accent-bar {
    height: 4px;
    background: linear-gradient(to right, #e8a020, #f5c842, #e8a020);
    margin-bottom: 18px;
  }

  /* ═══════════════════════════════
     SHIFT SUMMARY
  ═══════════════════════════════ */
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

  /* ═══════════════════════════════
     INCIDENT BLOCK
  ═══════════════════════════════ */
  .incident-block {
    border: 1px solid #d0d9ea;
    border-radius: 6px;
    margin-bottom: 26px;
    page-break-inside: avoid;
    overflow: hidden;
  }
  .incident-header {
    background: #1b2a4a;
    padding: 8px 16px;
    display: table;
    width: 100%;
  }
  .incident-header .inc-num {
    display: table-cell;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.5px;
    vertical-align: middle;
  }
  .incident-header .inc-badge {
    display: table-cell;
    text-align: right;
    vertical-align: middle;
  }
  .incident-header .inc-badge span {
    background: #e8a020;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 3px;
    letter-spacing: 0.5px;
  }
  .incident-body { padding: 14px 16px; }

  /* ── Info grid ── */
  .info-grid { display: table; width: 100%; margin-bottom: 8px; }
  .info-col  { display: table-cell; width: 50%; font-size: 12px; color: #444; padding: 2px 0; }
  .info-col .lbl { font-weight: 700; color: #1b2a4a; }

  .detail-row { font-size: 12px; color: #444; margin-bottom: 12px; line-height: 1.5; }
  .detail-row .lbl { font-weight: 700; color: #1b2a4a; }

  /* ═══════════════════════════════
     SECTION HEADINGS
  ═══════════════════════════════ */
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

  /* ═══════════════════════════════
     DATA TABLES
  ═══════════════════════════════ */
  .data-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 4px; }
  .data-table thead tr { background: #e8edf8; }
  .data-table thead th {
    text-align: left;
    padding: 6px 8px;
    font-weight: 700;
    color: #1b2a4a;
    border: 1px solid #c8d4e8;
    white-space: nowrap;
  }
  .data-table tbody td {
    padding: 6px 8px;
    border: 1px solid #d8e0ee;
    color: #444;
    vertical-align: top;
    word-break: break-word;
  }
  .data-table tbody tr:nth-child(even) { background: #f6f8fd; }
  .no-data { font-size: 11px; color: #aaa; font-style: italic; padding: 4px 2px; }

  /* ═══════════════════════════════
     EMERGENCY SERVICES BOX
  ═══════════════════════════════ */
  .emergency-box {
    background: #fff8f0;
    border: 1px solid #f0c878;
    border-left: 4px solid #e8a020;
    border-radius: 0 4px 4px 0;
    padding: 10px 14px;
  }
  .em-grid { display: table; width: 100%; margin-bottom: 5px; }
  .em-col  { display: table-cell; width: 50%; font-size: 12px; color: #444; vertical-align: top; padding: 2px 0; }
  .em-col .lbl { font-weight: 700; color: #1b2a4a; }

  /* ═══════════════════════════════
     PHOTOS
  ═══════════════════════════════ */
  .photo-wrapper { margin-top: 4px; }
  .photo-row { display: table; width: 100%; }
  .photo-cell-wrap {
    display: table-cell;
    width: 140px;
    vertical-align: top;
    padding-right: 12px;
    padding-bottom: 8px;
  }
  .photo-cell-wrap img {
    width: 128px;
    height: 96px;
    object-fit: cover;
    border: 2px solid #c8d4e8;
    border-radius: 4px;
    display: block;
  }
  .photo-ts {
    font-size: 9px;
    color: #888;
    text-align: center;
    margin-top: 3px;
    font-style: italic;
  }
  .photo-placeholder {
    width: 128px;
    height: 96px;
    border: 2px dashed #c8d4e8;
    border-radius: 4px;
    background: #f6f8fd;
    display: table;
  }
  .photo-placeholder-inner {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    font-size: 10px;
    color: #bbb;
    font-style: italic;
  }

  /* ═══════════════════════════════
     SIGNATURE
  ═══════════════════════════════ */
  .sig-wrap { margin-top: 4px; }
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
    display: table;
  }
  .sig-placeholder-inner {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    font-size: 10px;
    color: #bbb;
    font-style: italic;
  }

  /* ═══════════════════════════════
     FOOTER
  ═══════════════════════════════ */
  .page-footer {
    margin-top: 30px;
    border-top: 1px solid #d0d9ea;
    padding-top: 10px;
    display: table;
    width: 100%;
  }
  .footer-left {
    display: table-cell;
    vertical-align: middle;
  }
  .footer-left img { height: 22px; opacity: 0.6; }
  .footer-right {
    display: table-cell;
    text-align: right;
    vertical-align: middle;
    font-size: 10px;
    color: #888;
    line-height: 1.6;
  }
</style>
</head>
<body>

@php
/* ── Safe scalar string ── */
function safeStr($val, $fallback = 'N/A'): string {
    if (is_null($val))   return $fallback;
    if (is_array($val))  return implode(', ', array_filter(array_map('strval', $val), fn($v) => $v !== '')) ?: $fallback;
    if (is_object($val)) return $fallback;
    $s = trim((string) $val);
    return $s !== '' ? $s : $fallback;
}

/* ── Ensure list (array of rows) ── */
function toList($val): array {
    if (empty($val)) return [];
    if (is_string($val)) $val = json_decode($val, true);
    if (is_object($val)) $val = (array) $val;
    if (!is_array($val)) return [];
    if (count($val) > 0 && array_keys($val) !== range(0, count($val) - 1)) return [$val];
    return $val;
}

/* ── Ensure flat key->value (emergency_services) ── */
function toFlat($val): array {
    if (empty($val)) return [];
    if (is_string($val)) $val = json_decode($val, true);
    if (is_object($val)) return (array) $val;
    if (!is_array($val)) return [];
    if (isset($val[0]) && is_array($val[0])) return $val[0];
    return $val;
}

/* ── Safe date formatter ── */
function safeDate($val): string {
    if (empty($val)) return 'N/A';
    try {
        $raw = explode(' ', trim((string)$val))[0];
        if (str_contains($raw, '/'))
            return \Carbon\Carbon::createFromFormat('d/m/Y', $raw)->format('d/m/Y');
        return \Carbon\Carbon::createFromFormat('Y-m-d', $raw)->format('d/m/Y');
    } catch (\Exception $e) { return (string) $val; }
}

/* ── Build photo URL from imgPath ── */
function photoUrl(string $imgPath): string {
    if (str_starts_with($imgPath, 'http')) return $imgPath;
    // Change this to your actual storage path
    return asset('https://apis.staffoo.com.au/incident/' . $imgPath);
}
@endphp
 @php
        $logo  = "https://apis.staffoo.com.au/uploads/staffologo.png";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $logo);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $imageData = curl_exec($ch);
        curl_close($ch);

        $logobase64 = base64_encode($imageData);
      @endphp

{{-- ══════════════════════════════════════════════════════
     HEADER
══════════════════════════════════════════════════════ --}}
<div class="page-header">
  <div class="logo-cell">
    <img src="data:image/png;base64,{{ $logobase64 }}" alt="Image">
  </div>
  <div class="title-cell">
    <div class="report-label">Incident Report</div>
  </div>
</div>
<div class="accent-bar"></div>

{{-- ══════════════════════════════════════════════════════
     SHIFT SUMMARY
══════════════════════════════════════════════════════ --}}
<div class="shift-summary">
  <div class="summary-title">&#9632; Shift Summary</div>
  <table>
    <tr>
      <td width="50%"><span class="lbl">Guard:</span> {{ $staff ?? 'N/A' }}</td>
      <td width="50%"><span class="lbl">Site:</span> {{ $location ?? 'N/A' }}</td>
    </tr>
    <tr>
      <td><span class="lbl">Shift:</span> {{ $shift_start }} &mdash; {{ $shift_end }}</td>
      <td><span class="lbl">Total Incidents:</span> <span class="badge">{{ $total }}</span></td>
    </tr>
  </table>
</div>

{{-- ══════════════════════════════════════════════════════
     INCIDENTS LOOP
══════════════════════════════════════════════════════ --}}
@foreach($reports as $index => $report)

@php
  $peopleList  = toList($report->people_involved     ?? null);
  $vehicleList = toList($report->vehicle             ?? null);
  $witnessList = toList($report->wittness            ?? null);
  $emergency   = toFlat($report->emergency_services  ?? null);
  $photoList   = toList($report->photo               ?? null);
  $sig         = is_array($report->signature ?? null) ? '' : trim((string)($report->signature ?? ''));
@endphp

<div class="incident-block">

  {{-- Incident Header --}}
  <div class="incident-header">
    <div class="inc-num">INCIDENT #{{ $index + 1 }}</div>
    <div class="inc-badge"><span>{{ safeStr($report->injury_type ?? null) }}</span></div>
  </div>

  <div class="incident-body">

    {{-- Basic Info --}}
    <div class="info-grid">
      <div class="info-col"><span class="lbl">Date:</span> {{ safeDate($report->incident_date ?? null) }}</div>
      <div class="info-col"><span class="lbl">Time:</span> {{ safeStr($report->incident_time ?? null) }}</div>
    </div>
    <div class="info-grid">
      <div class="info-col"><span class="lbl">Injury Type:</span> {{ safeStr($report->injury_type ?? null) }}</div>
      <div class="info-col"><span class="lbl">Site:</span> {{ safeStr($report->site_name ?? null) }}</div>
    </div>
    <div class="detail-row">
      <span class="lbl">Detail:</span> {{ safeStr($report->injury_detail ?? null) }}
    </div>

    {{-- ── People Involved ── --}}
    <div class="sec-heading">People Involved</div>
    @if(count($peopleList) > 0)
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th><th>Gender</th><th>Phone</th><th>Email</th>
            <th>Body Type</th><th>Hair</th><th>Height</th><th>Weight</th><th>Marks</th>
          </tr>
        </thead>
        <tbody>
          @foreach($peopleList as $person)
          @php $person = is_array($person) ? $person : (array)$person; @endphp
          <tr>
            <td>{{ safeStr($person['name']     ?? null) }}</td>
            <td>{{ safeStr($person['gender']   ?? null) }}</td>
            <td>{{ safeStr($person['phone']    ?? null) }}</td>
            <td>{{ safeStr($person['email']    ?? null) }}</td>
            <td>{{ safeStr($person['bodyType'] ?? null) }}</td>
            <td>{{ safeStr($person['hair']     ?? null) }}</td>
            <td>{{ safeStr($person['height']   ?? null) }}</td>
            <td>{{ safeStr($person['weight']   ?? null) }}</td>
            <td>{{ safeStr($person['marks']    ?? null) }}</td>
          </tr>
          @endforeach
        </tbody>
      </table>
    @else
      <p class="no-data">No people involved recorded.</p>
    @endif

    {{-- ── Vehicles ── --}}
    <div class="sec-heading">Vehicles</div>
    @if(count($vehicleList) > 0)
      <table class="data-table">
        <thead>
          <tr><th>Make</th><th>Model</th><th>Type</th><th>Registration</th></tr>
        </thead>
        <tbody>
          @foreach($vehicleList as $v)
          @php $v = is_array($v) ? $v : (array)$v; @endphp
          <tr>
            <td>{{ safeStr($v['make']           ?? null) }}</td>
            <td>{{ safeStr($v['model']          ?? null) }}</td>
            <td>{{ safeStr($v['vehicle_type']   ?? null) }}</td>
            <td>{{ safeStr($v['vehicle_rander'] ?? null) }}</td>
          </tr>
          @endforeach
        </tbody>
      </table>
    @else
      <p class="no-data">No vehicles recorded.</p>
    @endif

    {{-- ── Witnesses ── --}}
    <div class="sec-heading">Witnesses</div>
    @if(count($witnessList) > 0)
      <table class="data-table">
        <thead>
          <tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>More Info</th></tr>
        </thead>
        <tbody>
          @foreach($witnessList as $w)
          @php $w = is_array($w) ? $w : (array)$w; @endphp
          <tr>
            <td>{{ safeStr($w['wittness_name']     ?? null) }}</td>
            <td>{{ safeStr($w['wittness_phone']    ?? null) }}</td>
            <td>{{ safeStr($w['wittness_email']    ?? null) }}</td>
            <td>{{ safeStr($w['wittness_address']  ?? null) }}</td>
            <td>{{ safeStr($w['witness_more_info'] ?? null) }}</td>
          </tr>
          @endforeach
        </tbody>
      </table>
    @else
      <p class="no-data">No witnesses recorded.</p>
    @endif

    {{-- ── Emergency Services ── --}}
    <div class="sec-heading">Emergency Services</div>
    @if(!empty($emergency))
      <div class="emergency-box">
        <div class="em-grid">
          <div class="em-col"><span class="lbl">Type:</span> {{ safeStr($emergency['emergency_type']   ?? null) }}</div>
          <div class="em-col"><span class="lbl">Supervisor:</span> {{ safeStr($emergency['supervisor_name'] ?? null) }}</div>
        </div>
        <div class="em-grid">
          <div class="em-col"><span class="lbl">Detail:</span> {{ safeStr($emergency['emergency_detail'] ?? null) }}</div>
          <div class="em-col"><span class="lbl">Position:</span> {{ safeStr($emergency['position']       ?? null) }}</div>
        </div>
        <div class="em-grid">
          <div class="em-col"><span class="lbl">Phone:</span> {{ safeStr($emergency['phone']   ?? null) }}</div>
          <div class="em-col"><span class="lbl">Email:</span> {{ safeStr($emergency['email']   ?? null) }}</div>
        </div>
        @if(!empty($emergency['address']))
        <div class="em-grid">
          <div class="em-col"><span class="lbl">Address:</span> {{ safeStr($emergency['address'] ?? null) }}</div>
          <div class="em-col"></div>
        </div>
        @endif
      </div>
    @else
      <p class="no-data">No emergency services recorded.</p>
    @endif

    {{-- ── Photos ── --}}
    <div class="sec-heading">Photos</div>
      <div class="photo-wrapper">
        @if(count($photoList) > 0)
          <div class="photo-row">
            @foreach($photoList as $photo)
            @php
              $photo   = is_array($photo) ? $photo : (array)$photo;
              $imgPath = trim(safeStr($photo['imgPath']   ?? null, ''));
              $imgTs   = safeStr($photo['timestamp']      ?? null, '');
              $imgUrl  = !empty($imgPath) ? photoUrl($imgPath) : '';
              $ch = curl_init();
              curl_setopt($ch, CURLOPT_URL, $imgUrl);
              curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
              $imageData = curl_exec($ch);
              curl_close($ch);

              $base64 = base64_encode($imageData);
            @endphp
            @if(!empty($imgUrl))
            <div class="photo-cell-wrap">
              <img src="data:image/png;base64,{{ $base64 }}" alt="Image">
              @if($imgTs !== 'N/A' && !empty($imgTs))
              <div class="photo-ts">{{ $imgTs }}</div>
              @endif
            </div>
            @endif
            @endforeach
          </div>
        @else
          <div class="photo-placeholder">
            <div class="photo-placeholder-inner">No photos uploaded</div>
          </div>
        @endif
      </div>

    {{-- ── Signature ── --}}
    <div class="sec-heading">Signature</div>
    <div class="sig-wrap">
      @if(!empty($sig))
       @php
        $sigimgUrl  = !empty($imgPath) ? photoUrl($sig) : '';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $sigimgUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $imageData = curl_exec($ch);
        curl_close($ch);

        $sigbase64 = base64_encode($imageData);
      @endphp
        <img src="data:image/png;base64,{{ $base64 }}" alt="Image">
      @else
        <div class="sig-placeholder">
          <div class="sig-placeholder-inner">No signature captured</div>
        </div>
      @endif
    </div>

  </div>{{-- /incident-body --}}
</div>{{-- /incident-block --}}

@endforeach

{{-- ══════════════════════════════════════════════════════
     FOOTER
══════════════════════════════════════════════════════ --}}
<div class="page-footer">
  <div style="text-align: center;">
    
  </div>
</div>

</body>
</html>