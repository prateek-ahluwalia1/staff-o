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
            'company_name' => $request->company_name,
            'registration_number' => $request->registration_number ?? null,
            'phone' => $request->phone ?? null,
            'address' => $request->address ?? null,
            'city' => $request->city ?? null,
        ]);

        $document_categories = DocumentCategory::where('document_category', 'contractor_document')->first();
        
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

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Access token not provided',
                'code' => 400
            ], 400);
        }

        try {
            JWTAuth::setToken($token)->invalidate();
            $customer = Customer::where('auth_token', $token)->first();
            if ($customer) {
                $customer->auth_token = null;
                $customer->save();
            }
            return response()->json([
                'success' => true,
                'message' => 'Customer logged out successfully',
                'code' => 200
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired token',
                'code' => 401
            ], 401);
        }
    }

    public function registerStaff(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed|min:6',
            // New validation rules
            'address' => 'nullable|string',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Optional: if uploading image
            'gender' => 'nullable|in:male,female,other',
            'city' => 'nullable|string',
            'phone' => 'nullable|string',
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

        $profileImagePath = null;
        if ($request->hasFile('profile_image')) {
            $profileImagePath = $request->file('profile_image')->store('staff-profiles', 'public');
        }

        $staff = Staff::create([
            'user_id' => $user->id,
            'address' => $data['address'] ?? null,
            'profile_image' => $profileImagePath ?? $data['profile_image'] ?? null,
            'gender' => $data['gender'] ?? null,
            'city' => $data['city'] ?? null,
            'phone' => $data['phone'] ?? null,
        ]);

        return response()->json([
            'message' => 'Staff registered under Capital Security',
            'data' => [
                'user' => $user,
                'staff' => $staff,
            ],
            'token' => $user->createToken('api')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->with(['staff'])->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // if (! $user->is_active) {
        //     return response()->json([
        //         'message' => 'Your account is inactive'
        //     ], 403);
        // }

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
                'data' => $user,
                'parent' => $parent,
            ]
        ], 200);
    }

}
