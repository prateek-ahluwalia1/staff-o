<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class ReportPdfService
{
    // ─── Convert remote image URL to base64 ──────────────────────────

    protected function imageToBase64(string $url): string
    {
        try {
            if (empty($url)) return '';

            $response = Http::timeout(15)->get($url);
            if ($response->failed()) return '';

            $ext = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
            $mimeMap = [
                'jpg'  => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png'  => 'image/png',
                'gif'  => 'image/gif',
                'webp' => 'image/webp',
            ];
            $mimeType = $mimeMap[$ext] ?? 'image/jpeg';

            return 'data:' . $mimeType . ';base64,' . base64_encode($response->body());
        } catch (\Exception $e) {
            return '';
        }
    }

    // ─── Process photos array → add base64 to each photo ─────────────

    protected function processPhotos($raw): array
    {
        if (empty($raw)) return [];

        $photos = is_array($raw) ? $raw : json_decode($raw, true);
        if (!is_array($photos)) return [];

        foreach ($photos as &$photo) {
            if (!empty($photo['imgPath'])) {
                $photo['base64'] = $this->imageToBase64($photo['imgPath']);
            } else {
                $photo['base64'] = '';
            }
        }

        return $photos;
    }

    // ─── Process signature → convert to base64 ───────────────────────

    protected function processSignature($raw): array
    {
        if (empty($raw) || $raw === 'N/A') {
            return ['url' => '', 'base64' => ''];
        }

        $decoded = json_decode($raw, true);

        if (is_array($decoded)) {
            $url = $decoded[0]['imgPath'] ?? ($decoded['imgPath'] ?? '');
        } else {
            $url = $raw;
        }

        return [
            'url'    => $url,
            'base64' => $url ? $this->imageToBase64($url) : '',
        ];
    }

    // ─── Safe JSON decode helper ──────────────────────────────────────

    protected function decodeJson($raw, bool $singleObject = false): array
    {
        if (empty($raw)) return [];

        $decoded = is_array($raw) ? $raw : json_decode($raw, true);

        if (!is_array($decoded)) return [];

        if ($singleObject && !isset($decoded[0])) {
            return [$decoded];
        }

        return $decoded;
    }

    // ─── Generate Foot Patrol PDF ─────────────────────────────────────

    public function generateFootPatrolPdf(array $data): string
    {
        $patrols = $data['patrols']->map(function ($patrol) {
            $patrol->processed_photos    = $this->processPhotos($patrol->photo);
            $patrol->processed_signature = $this->processSignature($patrol->signature);
            return $patrol;
        });

        $data['patrols'] = $patrols;

        $pdf = Pdf::loadView('foot_patrol', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled'      => true,
                'defaultFont'          => 'sans-serif',
                'dpi'                  => 150,
            ]);

        $filename  = 'footpatrol_' . $data['roster_id'] . '_' . $data['guard_id'] . '_' . now()->format('Ymd_His') . '.pdf';
        $directory = 'footpatrol';
        $path      = "{$directory}/{$filename}";

        Storage::disk('public')->makeDirectory($directory);
        Storage::disk('public')->put($path, $pdf->output());

        return Storage::disk('public')->url($path);
    }

    // ─── Generate Incident Report PDF ────────────────────────────────

    public function generateIncidentPdf(array $data): string
    {
        $incidents = $data['incidents']->map(function ($incident) {
            $incident->processed_photos    = $this->processPhotos($incident->photo);
            $incident->processed_signature = $this->processSignature($incident->signature);
            $incident->decoded_people      = $this->decodeJson($incident->people_involved);
            $incident->decoded_vehicles    = $this->decodeJson($incident->vehicle);
            $incident->decoded_witnesses   = $this->decodeJson($incident->wittness);
            $incident->decoded_ems         = $this->decodeJson($incident->emergency_services, true);
            return $incident;
        });

        $data['incidents'] = $incidents;

        $pdf = Pdf::loadView('incident_report', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled'      => true,
                'defaultFont'          => 'sans-serif',
                'dpi'                  => 150,
            ]);

        $filename  = 'incident_' . $data['roster_id'] . '_' . $data['guard_id'] . '_' . now()->format('Ymd_His') . '.pdf';
        $directory = 'incident';
        $path      = "{$directory}/{$filename}";

        Storage::disk('public')->makeDirectory($directory);
        Storage::disk('public')->put($path, $pdf->output());

        return Storage::disk('public')->url($path);
    }
}