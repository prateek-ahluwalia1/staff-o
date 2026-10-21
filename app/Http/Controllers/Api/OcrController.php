<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;

/**
 * Proxies document images to the Google Cloud Vision API for OCR.
 *
 * Kept server-side so the Vision API key is never exposed to the browser.
 * Called from the frontend's src/utils/ocrEngine.js (runGoogleVisionOcr).
 */
class OcrController extends Controller
{
    public function googleVision(Request $request)
    {
        $request->validate([
            'file' => 'required|file|image|max:10240', // 10MB
        ]);

        $apiKey = config('services.google_vision.key');
        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'Google Vision API key is not configured.',
            ], 500);
        }

        $imageBase64 = base64_encode(file_get_contents($request->file('file')->getRealPath()));

        try {
            $response = Http::timeout(25)->post(
                "https://vision.googleapis.com/v1/images:annotate?key={$apiKey}",
                [
                    'requests' => [
                        [
                            'image' => ['content' => $imageBase64],
                            // DOCUMENT_TEXT_DETECTION is tuned for dense text
                            // documents/ID cards and generally outperforms
                            // plain TEXT_DETECTION on this kind of image.
                            'features' => [
                                ['type' => 'DOCUMENT_TEXT_DETECTION'],
                            ],
                            'imageContext' => [
                                'languageHints' => ['en'],
                            ],
                        ],
                    ],
                ]
            );

            if (!$response->successful()) {
                Log::warning('Google Vision OCR request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'OCR provider request failed.',
                    // Surfaced only when APP_DEBUG=true (local/staging) so you
                    // can see Google's exact reason without digging through
                    // logs. Never exposed when APP_DEBUG=false (production).
                    'debug' => config('app.debug') ? [
                        'status' => $response->status(),
                        'body' => $response->json() ?? $response->body(),
                    ] : null,
                ], 502);
            }

            $data = $response->json();

            if (isset($data['responses'][0]['error'])) {
                Log::warning('Google Vision OCR returned an error', $data['responses'][0]['error']);
                return response()->json([
                    'success' => false,
                    'message' => 'OCR provider returned an error.',
                    'debug' => config('app.debug') ? $data['responses'][0]['error'] : null,
                ], 502);
            }

            $text = $data['responses'][0]['fullTextAnnotation']['text'] ?? '';

            return response()->json([
                'success' => true,
                'text' => $text,
            ]);
        } catch (\Throwable $e) {
            Log::error('Google Vision OCR exception: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'success' => false,
                'message' => 'OCR request failed.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
