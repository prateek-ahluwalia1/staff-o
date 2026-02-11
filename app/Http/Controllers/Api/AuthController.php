<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Customer;
use App\Models\Contractor;
use App\Models\DocumentCategory;
use App\Models\Staff;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function registerCustomer(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed|min:6',
            'phone' => 'nullable',
            'company_name' => 'nullable',
            'address' => 'nullable',
            'city' => 'nullable',
            'country' => 'nullable',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'user_type' => 'customer',
            'is_active' => 0,
        ]);

        Customer::create([
            'user_id' => $user->id,
            'phone' => $data['phone'] ?? null,
            'company_name' => $data['company_name'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'country' => $data['country'] ?? null,
        ]);

        $document_categories = DocumentCategory::where('document_category', 'customer_document')->first();
        
        foreach (json_decode($document_categories->document_type) as $key => $value) {  

            $guard_documents = new Document();
            $guard_documents->user_id = $user->id;
            $guard_documents->document_category = ($document_categories->document_category != '' ? $document_categories->document_category : 'other');
            $guard_documents->document_type = $key;
            $guard_documents->document_name = $value;
            $guard_documents->save();
        }

        return response()->json([
            'token' => $user->createToken('api')->plainTextToken,
            'user' => $user
        ], 201);
    }

    public function registerContractor(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed|min:6',
            'company_name' => 'required',
            'registration_number' => 'nullable',
            'phone' => 'nullable',
            'address' => 'nullable',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'user_type' => 'contractor',
            'is_active' => 0,
        ]);

        Contractor::create([
            'user_id' => $user->id,
            'company_name' => $data['company_name'],
            'registration_number' => $data['registration_number'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
        ]);

        return response()->json([
            'token' => $user->createToken('api')->plainTextToken,
            'user' => $user
        ], 201);
    }

    public function registerStaff(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed|min:6',
            'employee_code' => 'nullable|string',
            'designation' => 'nullable|string',
            'joining_date' => 'nullable|date',
            'salary' => 'nullable|numeric',
        ]);

        $capitalUser = User::where('user_type', 'customer')
            ->where('name', 'Capital Security')
            ->firstOrFail();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'user_type' => 'staff',
            'user_id' => $capitalUser->id,
            'is_active' => 0,

        ]);

        Staff::create([
            'user_id' => $user->id,
            'employee_code' => $data['employee_code'] ?? null,
            'designation' => $data['designation'] ?? null,
            'joining_date' => $data['joining_date'] ?? null,
            'salary' => $data['salary'] ?? null,
        ]);

        return response()->json([
            'message' => 'Staff registered under Capital Security',
            'user' => $user,
            'token' => $user->createToken('api')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Your account is inactive'
            ], 403);
        }

        $token = $user->createToken('api')->plainTextToken;

        $parent = null;
        if ($user->user_type === 'staff' && $user->parent) {
            $parent = [
                'id' => $user->parent->id,
                'name' => $user->parent->name,
                'email' => $user->parent->email,
                'user_type' => $user->parent->user_type,
            ];
        }

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'parent' => $parent,
            ]
        ], 200);
    }

}
