<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; margin:0; padding:0; background:#F3F4F6; }
    .wrapper { max-width: 660px; margin: 0 auto; padding: 24px; }

    .logo-band { background:#FFFFFF; padding:18px 22px; text-align:center; border:1px solid #E5E7EB; border-bottom:none; border-radius:10px 10px 0 0; }
    .logo-band img { height:40px; }

    .header {
        background: linear-gradient(120deg, #0B1E33 0%, #0A7C6E 100%);
        padding:22px 24px;
    }
    .header h1 { color:#fff; font-size:19px; margin:0 0 4px; }
    .header p { color:#CBD5E1; font-size:12.5px; margin:0; }

    .body { background:#F9FAFB; border:1px solid #E5E7EB; border-top:none; padding:22px; border-radius:0 0 10px 10px; }

    .meta { margin-bottom:16px; line-height:1.8; background:#FFFFFF; border:1px solid #E5E7EB; border-radius:8px; padding:14px 16px; }
    .meta strong { color:#111827; }

    .notes-box {
        background:#FFFFFF; border:1px solid #E5E7EB; border-left:4px solid #0A7C6E; border-radius:6px;
        padding:12px 14px; margin-bottom:18px; color:#374151; font-size:13px;
    }

    .state-block { margin-bottom: 28px; }
    .state-title-row { padding: 4px 2px 12px; }
    .state-title { font-size:15px; font-weight:bold; color:#0A7C6E; }
    .state-sub { font-size:11px; color:#6B7280; }

    .card-table { width:100%; border-collapse: separate; border-spacing: 8px; }
    .card {
        background:#FFFFFF; border:1px solid #E5E7EB; border-radius:10px; padding:12px 14px;
        vertical-align: top;
    }
    .card-title { font-size:12.5px; font-weight:bold; color:#111827; margin-bottom:8px; }
    .card-row { font-size:11px; color:#6B7280; padding:3px 0; }
    .card-row .icon { color:#0A7C6E; margin-right:4px; }
    .card-value { font-size:14px; font-weight:bold; color:#111827; }
    .card-value .dollar { color:#0A7C6E; }

    .footer-note { font-size:13px; color:#6B7280; margin-top: 8px; }
    .footer { text-align:center; color:#9CA3AF; font-size:11px; margin-top:18px; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="logo-band">
        <img src="https://apis.staffoo.com.au/uploads/staffologo.png" alt="Staffoo Logo">
    </div>
    <div class="header">
        <h1>Request Rate Update</h1>
        <p>New proposed charge rates submitted for admin review &amp; approval.</p>
    </div>
    <div class="body">
        <div class="meta">
            <strong>Resource Partner:</strong> {{ $contractorName }} ({{ $contractorEmail }})<br>
            <strong>States Requested:</strong> {{ collect($stateBlocks)->pluck('state')->map(fn($s) => strtoupper($s))->implode(', ') }}
        </div>

        @if(!empty($notes))
            <div class="notes-box">
                <strong>Notes from contractor:</strong><br>
                {{ $notes }}
            </div>
        @endif

        @foreach ($stateBlocks as $block)
            @php
                // Group the flat rateRows (label/value pairs) into
                // [ 'Mon–Fri Day' => ['metro' => 12.00, 'regional' => 12.00], ... ]
                // by parsing "Default Metro X" / "Default Regional X" labels.
                //
                // Saturday/Sunday/Public Holiday are collapsed into ONE card each
                // (Day rate only — Night rate for these three is intentionally dropped).
                // Mon–Fri stays split into separate Day and Night cards.
                $categories = [];
                foreach ($block['rateRows'] as $row) {
                    if (!str_starts_with($row['label'], 'Default')) {
                        continue;
                    }
                    $isMetro = str_contains($row['label'], 'Metro');
                    $type = $isMetro ? 'metro' : 'regional';
                    $category = trim(str_replace(['Default Metro', 'Default Regional'], '', $row['label']));

                    $collapsed = false;
                    foreach (['Saturday', 'Sunday', 'Public Holiday'] as $collapsedBase) {
                        if (str_starts_with($category, $collapsedBase)) {
                            if (str_ends_with($category, 'Night')) {
                                $collapsed = true; // skip Night entries for these three
                                break;
                            }
                            $category = $collapsedBase; // "Saturday Day" -> "Saturday"
                            break;
                        }
                    }
                    if ($collapsed) {
                        continue;
                    }

                    $categories[$category][$type] = $row['value'];
                }
                $categoryChunks = array_chunk($categories, 3, true);
            @endphp

            <div class="state-block">
                <div class="state-title-row">
                    <div class="state-title">{{ strtoupper($block['state']) }}{{ !empty($block['title']) ? ' — ' . $block['title'] : '' }}</div>
                    <div class="state-sub">Proposed rates for this state</div>
                </div>

                @foreach ($categoryChunks as $chunk)
                    <table class="card-table">
                        <tr>
                            @foreach ($chunk as $categoryName => $values)
                                <td class="card" width="{{ (int)(100 / count($chunk)) }}%">
                                    <div class="card-title">{{ $categoryName }}</div>
                                    <div class="card-row"><span class="icon">&#9679;</span>METRO</div>
                                    <div class="card-value"><span class="dollar">$</span>{{ number_format($values['metro'] ?? 0, 2) }}</div>
                                    <div style="height:8px;"></div>
                                    <div class="card-row"><span class="icon">&#9650;</span>REGIONAL</div>
                                    <div class="card-value"><span class="dollar">$</span>{{ number_format($values['regional'] ?? 0, 2) }}</div>
                                </td>
                            @endforeach
                            @for ($i = count($chunk); $i < 3; $i++)
                                <td width="{{ (int)(100/3) }}%"></td>
                            @endfor
                        </tr>
                    </table>
                @endforeach
            </div>
        @endforeach

        <p class="footer-note">
            Please review this request in the admin panel and accept or reject it.
        </p>
    </div>
    <div class="footer">
        This is an automated notification from STAFFOO.
    </div>
</div>
</body>
</html>