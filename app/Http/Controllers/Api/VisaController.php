<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VsureService;
use Illuminate\Http\Request;

class VisaController extends Controller
{
    protected $vsure;

    public function __construct(VsureService $vsure)
    {
        $this->vsure = $vsure;
    }

    // ✅ Create Visa Check
    public function create(Request $request)
    {
        $request->validate([
            'passport' => 'required',
            'country' => 'required',
            'family_name' => 'required',
            'given_name' => 'required',
            'dob' => 'required|date'
        ]);

        $data = [
            "jurisdiction" => "AUS",
            "environment" => "sandbox", // dynamic
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

        return response()->json($response);
    }

    // ✅ Get Visa Result
    public function result($id)
    {
        $response = $this->vsure->appgetVisaResult($id);

        return response()->json($response);
    }
}