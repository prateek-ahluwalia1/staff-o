<?php

namespace App\Http\Controllers\Api;

use App\Services\YeastarService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class CallController extends Controller
{
    public function __construct(protected YeastarService $pbx) {}

    /**
     * Click-to-Call: rings agent extension, then dials customer
     * POST /api/call/dial
     * Body: { "caller": "1001", "callee": "0412345678" }
     */
    public function dial(Request $request): JsonResponse
    {
        $request->validate([
            'caller' => 'required|string',  // Agent extension
            'callee' => 'required|string',  // Customer number
        ]);

        $result = $this->pbx->clickToCall($request->caller, $request->callee);
        return response()->json($result);
    }

    /**
     * List all active calls
     * GET /api/call/active
     */
    public function activeCalls(): JsonResponse
    {
        return response()->json($this->pbx->getActiveCalls());
    }

    /**
     * Hang up a call
     * POST /api/call/hangup
     * Body: { "call_id": "xxx" }
     */
    public function hangup(Request $request): JsonResponse
    {
        $request->validate(['call_id' => 'required|string']);
        return response()->json($this->pbx->hangupCall($request->call_id));
    }

    /**
     * Transfer a call
     * POST /api/call/transfer
     * Body: { "call_id": "xxx", "transfer_to": "1002" }
     */
    public function transfer(Request $request): JsonResponse
    {
        $request->validate([
            'call_id'     => 'required|string',
            'transfer_to' => 'required|string',
        ]);
        return response()->json(
            $this->pbx->transferCall($request->call_id, $request->transfer_to)
        );
    }

    /**
     * Hold / Unhold
     * POST /api/call/hold   or   POST /api/call/unhold
     */
    public function hold(Request $request): JsonResponse
    {
        $request->validate(['call_id' => 'required|string']);
        return response()->json($this->pbx->holdCall($request->call_id));
    }

    public function unhold(Request $request): JsonResponse
    {
        $request->validate(['call_id' => 'required|string']);
        return response()->json($this->pbx->unholdCall($request->call_id));
    }

    /**
     * Call history / CDR
     * GET /api/call/records
     */
    public function records(Request $request): JsonResponse
    {
        return response()->json($this->pbx->getCallRecords($request->all()));
    }

    /**
     * Extension status
     * GET /api/extension/{ext}/status
     */
    public function extensionStatus(string $extension): JsonResponse
    {
        return response()->json($this->pbx->getExtensionStatus($extension));
    }
}