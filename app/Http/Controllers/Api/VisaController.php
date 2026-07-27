<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisaDetails;
use App\Services\VsureService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VisaController extends Controller
{
    protected $vsure;

    public function __construct(VsureService $vsure)
    {
        $this->vsure = $vsure;
    }

    public function create(Request $request)
    {
        $request->validate([
            'passport' => 'required',
            'country' => 'required',
            'family_name' => 'required',
            'given_name' => 'required',
            'dob' => 'required|date',
        ]);

        $data = [
            "jurisdiction" => "AUS",
            "environment" => "live",
            "mode" => "fastcheck",
            "visa_check_schema" => "australia",
            "australia" => [
                "visa_check_type" => "work"
            ],
            "document" => [
                "type" => "passport",
                "identifier" => $request->passport,
                "country" => strtoupper($request->country),
                "family_name" => strtoupper($request->family_name),
                "given_name" => strtoupper($request->given_name),
                "date_of_birth" => $request->dob
            ]
        ];

        $response = $this->vsure->createVisaCheck($data);

        if (isset($response['error'])) {
            return response()->json([
                'success' => false,
                'code' => 500,
                'message' => $response['message'],
                'data' => $response['error'] ?? null
            ], 500);
        }

        // Save to database with document fields
        $savedData = $this->saveVisaDetails($response, $request);

        return response()->json([
            'success' => true,
            'code' => 200,
            'data' => $response,
            'saved' => $savedData
        ]);
    }

    public function visaExpiryCheck(Request $request)
    {
        $request->validate([
            'passport' => 'required',
            'country' => 'required',
            'family_name' => 'required',
            'given_name' => 'required',
            'dob' => 'required|date',
        ]);

        $data = [
            "jurisdiction" => "AUS",
            "environment" => "live",
            "mode" => "fastcheck",
            "visa_check_schema" => "australia",
            "australia" => [
                "visa_check_type" => "work"
            ],
            "document" => [
                "type" => "passport",
                "identifier" => $request->passport,
                "country" => strtoupper($request->country),
                "family_name" => strtoupper($request->family_name),
                "given_name" => strtoupper($request->given_name),
                "date_of_birth" => $request->dob
            ]
        ];

        $guard = DB::table('documents')->where('document_type', 'passport')->where('document_no', $request->passport)->first();
        $response = $this->vsure->createVisaCheck($data);

        if (isset($response['error'])) {
            return response()->json([
                'success' => false,
                'code' => 500,
                'message' => $response['message'],
                'data' => $response['error'] ?? null
            ], 500);
        }

        $savedData = $this->saveVisaDetails($response, $request);

        if($guard->document_category == 'bridging_visa'){
        $show_document = true;
        $work_entitlement = $response['json']['data']['visa']['australia']['work_entitlement'] ?? null;
        $expiry_date = $response['json']['data']['visa']['australia']['expiry_date'] ?? null;
        }else{
        $show_document = false;
        $work_entitlement = $response['json']['data']['visa']['australia']['work_entitlement'] ?? null;
        $expiry_date = $response['json']['data']['visa']['australia']['expiry_date'] ?? null;
        }

        return response()->json([
            'success' => true,
            'code' => 200,
            'expiry' => $expiry_date,
            'work_entitlement' => $work_entitlement,
            'show_document' => $show_document,
        ]);
    }

    private function saveVisaDetails($response, $request = null)
    {
        try {
            $guard = DB::table('documents')->where('document_type', 'passport')->where('document_no', $request->passport)->first();
            
            if (!$guard) {
                Log::error('Guard not found.');
                return ['success' => false, 'message' => 'Guard not found'];
            }

            $documentData = $this->extractDocumentData($response);
            
            $isSuccess = isset($response) && $response['json']['data']['status'] == 'completed';
            
            $delete =  VisaDetails::where('user_id', $guard->user_id)->delete();
            
            $insertData = [
                'user_id' => $guard->user_id,
                'details' => json_encode($response),
                'is_correct' => $isSuccess ? 1 : 0,
                
                'passport_number' => $request ? $request->passport : $documentData['identifier'],
                'passport_country' => $request ? strtoupper($request->country) : $documentData['country'],
                'given_name' => $request ? strtoupper($request->given_name) : $documentData['given_name'],
                'family_name' => $request ? strtoupper($request->family_name) : $documentData['family_name'],
                'date_of_birth' => $request ? $request->dob : $documentData['date_of_birth'],
                'check_date' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ];

            // Insert into database
            $inserted = DB::table('visa_details')->insert($insertData);

            if ($inserted) {
                Log::info('Visa details saved for guard ID: ' . $guard->user_id);
                return [
                    'success' => true,
                    'message' => 'Visa details saved successfully',
                    'user_id' => $guard->id,
                    'is_correct' => $isSuccess,
                    'document' => [
                        'passport' => $insertData['passport_number'],
                        'country' => $insertData['passport_country'],
                        'given_name' => $insertData['given_name'],
                        'family_name' => $insertData['family_name'],
                        'dob' => $insertData['date_of_birth']
                    ]
                ];
            }

            return ['error' => 'Failed to save visa details'];

        } catch (\Exception $e) {
            Log::error('Error saving visa details: ' . $e->getMessage());
            return [
                'error' => 'Error saving visa details',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Extract document data from response
     */
    private function extractDocumentData($response)
    {
        $documentData = [
            'identifier' => null,
            'country' => null,
            'given_name' => null,
            'family_name' => null,
            'date_of_birth' => null
        ];

        try {
            if (isset($response['json']['data']['document'])) {
                $doc = $response['json']['data']['document'];
                $documentData['identifier'] = $doc['identifier'] ?? null;
                $documentData['country'] = $doc['country'] ?? null;
                $documentData['given_name'] = $doc['given_name'] ?? null;
                $documentData['family_name'] = $doc['family_name'] ?? null;
                $documentData['date_of_birth'] = $doc['date_of_birth'] ?? null;
            }
        } catch (\Exception $e) {
            Log::error('Error extracting document data: ' . $e->getMessage());
        }

        return $documentData;
    }

    public function result($id)
    {
        set_time_limit(120);

        $response = $this->vsure->pollVisaResult($id);

        return response()->json([
            'success' => true,
            'code'    => 200,
            'data'    => $response
        ]);
    }
}