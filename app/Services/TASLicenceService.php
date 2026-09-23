<?php

namespace App\Http\Controllers;

use App\Services\TASLicenceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TASLicenceController extends Controller
{
    public function __construct(private TASLicenceService $service) {}

    public function search(Request $request): JsonResponse
    {
        $request->validate(['licence_number' => 'required|string']);

        $results = $this->service->searchByLicenceNumber($request->licence_number);

        if (empty($results)) {
            return response()->json([
                'success' => false,
                'message' => 'No licence found.',
                'data'    => [],
            ], 404);
        }

        return response()->json(['success' => true, 'data' => $results]);
    }
}