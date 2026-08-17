<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>STAFFOO - Foot Patrol Report</title>
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
    background: #ffffff;
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
    color: #0a7c6e;
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
    border-left: 4px solid #0a7c6e;
    border-radius: 0 4px 4px 0;
    padding: 12px 16px;
    margin-bottom: 20px;
  }
  .shift-summary .summary-title {
    font-size: 11px;
    font-weight: 700;
    color: #0a7c6e;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }
  .shift-summary table { width: 100%; border-collapse: collapse; }
  .shift-summary td { font-size: 12px; padding: 3px 0; color: #444; }
  .shift-summary td .lbl { font-weight: 700; color: #0a7c6e; }
  .badge {
    display: inline-block;
    background: #e8a020;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 10px;
  }

  /* PATROL BLOCK */
  .patrol-block {
    border: 1px solid #d0d9ea;
    border-radius: 6px;
    margin-bottom: 26px;
    page-break-inside: avoid;
    overflow: hidden;
  }
  .patrol-header {
    background: #0a7c6e;
    padding: 8px 16px;
    display: table;
    width: 100%;
  }
  .patrol-header .patrol-num {
    display: table-cell;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.5px;
    vertical-align: middle;
  }
  .patrol-body { padding: 14px 16px; }

  /* Info grid */
  .info-grid { display: table; width: 100%; margin-bottom: 8px; }
  .info-col  { display: table-cell; width: 50%; font-size: 12px; color: #444; padding: 2px 0; }
  .info-col .lbl { font-weight: 700; color: #0a7c6e; }

  .detail-row { 
    font-size: 12px; 
    color: #444; 
    margin-bottom: 12px; 
    line-height: 1.5; 
    padding: 10px;
    background: #f8fafc;
    border-radius: 8px;
  }
  .detail-row .lbl { font-weight: 700; color: #0a7c6e; display: block; margin-bottom: 5px; }

  /* SECTION HEADINGS */
  .sec-heading {
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    background: #0a7c6e;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 5px 10px;
    border-radius: 3px;
    margin: 14px 0 8px 0;
  }

  /* PHOTOS */
  .photo-wrapper { margin-top: 4px; }
  .photo-row { display: flex; flex-wrap: wrap; gap: 12px; }
  .photo-cell-wrap {
    width: 140px;
    vertical-align: top;
    text-align: center;
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
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .photo-placeholder-inner {
    font-size: 10px;
    color: #bbb;
    font-style: italic;
  }

  /* SIGNATURE */
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
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sig-placeholder-inner {
    font-size: 10px;
    color: #bbb;
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
    .patrol-block {
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

/* Build photo URL from path */
function photoUrl(string $imgPath): string {
    if (empty($imgPath)) return '';
    if (str_starts_with($imgPath, 'http')) return $imgPath;
    return 'https://apis.staffoo.com.au/footpatrol/' . ltrim($imgPath, '/');
}

// Logo as Base64 (STAFFOO Logo)
  $logo  = "https://apis.staffoo.com.au/uploads/staffologo.png";
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $logo);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $imageData = curl_exec($ch);
  curl_close($ch);

  $logobase64 = base64_encode($imageData);

// Get signature URL
function getSignatureUrl($sig) {
    if (empty($sig)) return '';
    if (filter_var($sig, FILTER_VALIDATE_URL)) return $sig;
    return 'https://apis.staffoo.com.au/footpatrol/' . ltrim($sig, '/');
}
@endphp

{{-- HEADER --}}
<div class="page-header">
  <div class="logo-cell">
    <img src="data:image/png;base64,{{ $logobase64 }}" alt="Image">
  </div>
  <div class="title-cell">
    <div class="report-label">Foot Patrol Report</div>
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
      <td><span class="lbl">Total Patrols:</span> <span class="badge">{{ $total ?? 0 }}</span></td>
    </tr>
  </table>
</div>

{{-- LOOP EACH PATROL --}}
@foreach($reports as $index => $report)

@php
  $photoList = is_array($report->photo) ? $report->photo : [];
  $sig = $report->signature ?? '';
  $sigUrl = getSignatureUrl($sig);
@endphp

<div class="patrol-block">
  <div class="patrol-header">
    <div class="patrol-num">PATROL #{{ $index + 1 }}</div>
  </div>
  <div class="patrol-body">

    {{-- Date / Time --}}
    <div class="info-grid">
      <div class="info-col"><span class="lbl">Date:</span> {{ safeDate($report->date ?? null) }}</div>
      <div class="info-col"><span class="lbl">Time:</span> {{ safeStr($report->time ?? null) }}</div>
    </div>

    {{-- Detail --}}
    <div class="detail-row">
      <span class="lbl">Patrolling Detail</span>
      {{ safeStr($report->patrolling_detail ?? null) }}
    </div>

    {{-- Photos --}}
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

    {{-- Signature --}}
    <div class="sec-heading">Signature</div>
    <div class="sig-wrap">
      @if(!empty($sigUrl))
        @php
        $sigimgUrl  = !empty($imgPath) ? photoUrl($sigUrl) : '';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $sigimgUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $imageData = curl_exec($ch);
        curl_close($ch);

        $sigbase64 = base64_encode($imageData);
      @endphp
        @if(!empty($sigbase64))
          <img src="data:image/jpeg;base64,{{ $sigbase64 }}" alt="Signature">
        @else
          <div class="sig-placeholder">
            <div class="sig-placeholder-inner">Signature not available</div>
          </div>
        @endif
      @else
        <div class="sig-placeholder">
          <div class="sig-placeholder-inner">No signature captured</div>
        </div>
      @endif
    </div>

  </div>
</div>

@endforeach

{{-- FOOTER --}}
<div class="page-footer">
  
</div>

</body>
</html>