<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Customer;
use App\Models\Contractor;
use App\Models\DocumentCategory;
use App\Models\Staff;
use App\Models\Document;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

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
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'country' => 'nullable|string',
            'coordinates' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'user_type' => 'customer',
            'is_active' => 0,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'country' => $data['country'] ?? null,
            'coordinates' => $data['coordinates'] ?? null,
        ]);

        Customer::create([
            'user_id' => $user->id,
            'phone' => $data['phone'] ?? null,
            'company_name' => $data['company_name'] ?? null,
        ]);

        // $document_categories = DocumentCategory::where('document_category', 'customer_document')->first();

        // foreach (json_decode($document_categories->document_type) as $key => $value) {  

        //     $guard_documents = new Document();
        //     $guard_documents->user_id = $user->id;
        //     $guard_documents->document_category = ($document_categories->document_category != '' ? $document_categories->document_category : 'other');
        //     $guard_documents->document_type = $key;
        //     $guard_documents->document_name = $value;
        //     $guard_documents->save();
        // }

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
            'address' => 'nullable',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'country' => 'nullable|string',
            'coordinates' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'user_type' => 'contractor',
            'is_active' => 0,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'country' => $data['country'] ?? null,
            'coordinates' => $data['coordinates'] ?? null,
        ]);

        Contractor::create([
            'user_id' => $user->id,
            'company_name' => $request->company_name,
            'registration_number' => $request->registration_number ?? null,
            'phone' => $request->phone ?? null,
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
            'address' => 'nullable|string',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Optional: if uploading image
            'gender' => 'nullable|in:male,female,other',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'country' => 'nullable|string',
            'coordinates' => 'nullable|string',
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
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'country' => $data['state'] ?? null,
            'coordinates' => $data['coordinates'] ?? null,
            'is_active' => 0,
        ]);

        $profileImagePath = null;
        if ($request->hasFile('profile_image')) {
            $profileImagePath = $request->file('profile_image')->store('staff-profiles', 'public');
        }

        $staff = Staff::create([
            'user_id' => $user->id,
            'profile_image' => $profileImagePath ?? $data['profile_image'] ?? null,
            'gender' => $data['gender'] ?? null,
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

        $user = User::where('email', $request->email)->first();

        if (! $user->is_active) {
            return response()->json([
                'message' => 'User Not Found.'
            ], 403);
        }
        if ($user->user_type === 'customer') {
            $user->load(['customer']);
        } elseif ($user->user_type === 'contractor') {
            $user->load('contractor', 'documents');
        } elseif ($user->user_type === 'staff') {
            $user->load('staff', 'documents');
        }

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

    public function storeNotificationToken(Request $request)
    {
        $user = User::where('id', $request->id)->first();
        if ($user) {
            $user->notification_token = $request->notification_token;
            $user->update();
            return response()->json(['success' => true, 'msg' => 'notification token create successfully!']);
        } else {
            return response()->json(['success' => true, 'msg' => 'admin not found!']);
        }
    }

     public function handleGoogleCallback(Request $request)
    {
        // ── Step 1: Validate ─────────────────────────────────────────
        $request->validate([
            'credential' => 'required|string',
            'user_type'  => 'required|in:customer,staff,contractor',
        ]);

        try {
            // ── Step 2: Verify Google access token (ya29...) ─────────
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $request->credential,
            ])->get('https://www.googleapis.com/oauth2/v3/userinfo');

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Google token.',
                ], 401);
            }

            $google = $response->json();
            // $google contains: sub, name, email, picture

            // ── Step 3: Check if email already exists ─────────────────
            $existingUser = User::where('email', $google['email'])->first();

            if ($existingUser) {
                // ════════════════════════════════════════
                // LOGIN — email found in DB
                // ════════════════════════════════════════
                $existingUser->update([
                    'google_id' => $google['sub'],
                    'avatar'    => $google['picture'] ?? $existingUser->avatar,
                ]);

                $existingUser->tokens()->delete();
                $token = $existingUser->createToken('api')->plainTextToken;

                return response()->json([
                    'success' => true,
                    'is_new'  => false,
                    'message' => 'Logged in successfully.',
                    'token'   => $token,
                    'user'    => $existingUser,
                ], 200);
            }

            // ════════════════════════════════════════
            // REGISTER — email not found, create user
            // ════════════════════════════════════════
            $userType = $request->user_type;

            if ($userType === 'customer') {
                return $this->registerCustomerViaGoogle($google);
            }

            if ($userType === 'contractor') {
                return $this->registerContractorViaGoogle($google);
            }

            if ($userType === 'staff') {
                return $this->registerStaffViaGoogle($google);
            }

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed. ' . $e->getMessage(),
            ], 500);
        }
    }

    // ────────────────────────────────────────────────────────────────
    // PRIVATE: Register Customer via Google
    // Mirrors your registerCustomer() — no password needed
    // ────────────────────────────────────────────────────────────────
    private function registerCustomerViaGoogle(array $google)
    {
        $user = User::create([
            'name'      => $google['name'],
            'email'     => $google['email'],
            'google_id' => $google['sub'],
            'avatar'    => $google['picture'] ?? null,
            'password'  => null,
            'user_type' => 'customer',
            'is_active' => 0,
            'address'   => null,
            'city'      => null,
            'state'     => null,
            'country'   => null,
            'coordinates' => null,
        ]);

        Customer::create([
            'user_id'      => $user->id,
            'phone'        => null,
            'company_name' => null,
        ]);

        return response()->json([
            'success' => true,
            'is_new'  => true,
            'message' => 'Customer registered successfully.',
            'token'   => $user->createToken('api')->plainTextToken,
            'user'    => $user,
        ], 201);
    }

    // ────────────────────────────────────────────────────────────────
    // PRIVATE: Register Contractor via Google
    // Mirrors your registerContractor() — creates Document records
    // ────────────────────────────────────────────────────────────────
    private function registerContractorViaGoogle(array $google)
    {
        $user = User::create([
            'name'      => $google['name'],
            'email'     => $google['email'],
            'google_id' => $google['sub'],
            'avatar'    => $google['picture'] ?? null,
            'password'  => null,
            'user_type' => 'contractor',
            'is_active' => 0,
            'address'   => null,
            'city'      => null,
            'state'     => null,
            'country'   => null,
            'coordinates' => null,
        ]);

        Contractor::create([
            'user_id'             => $user->id,
            'company_name'        => null,
            'registration_number' => null,
            'phone'               => null,
        ]);

        // Create document placeholders — same as your registerContractor()
        $document_categories = DocumentCategory::where('document_category', 'contractor_document')->first();

        if ($document_categories) {
            foreach (json_decode($document_categories->document_type) as $key => $value) {
                $document = new Document();
                $document->user_id            = $user->id;
                $document->document_category  = $document_categories->document_category ?: 'other';
                $document->document_type      = $key;
                $document->document_name      = $value;
                $document->save();
            }
        }

        return response()->json([
            'success' => true,
            'is_new'  => true,
            'message' => 'Contractor registered successfully.',
            'token'   => $user->createToken('api')->plainTextToken,
            'user'    => $user,
        ], 201);
    }

    // ────────────────────────────────────────────────────────────────
    // PRIVATE: Register Staff via Google
    // Mirrors your registerStaff() — links to Capital Security user
    // ────────────────────────────────────────────────────────────────
    private function registerStaffViaGoogle(array $google)
    {
        // Same logic as your registerStaff() — link to Capital Security
        $capitalUser = User::where('user_type', 'customer')
            ->where('name', 'Capital Security')
            ->first();

        if (!$capitalUser) {
            return response()->json([
                'success' => false,
                'message' => 'Capital Security account not found.',
            ], 404);
        }

        $user = User::create([
            'name'      => $google['name'],
            'email'     => $google['email'],
            'google_id' => $google['sub'],
            'avatar'    => $google['picture'] ?? null,
            'password'  => null,
            'user_type' => 'staff',
            'user_id'   => $capitalUser->id,
            'is_active' => 0,
            'address'   => null,
            'city'      => null,
            'state'     => null,
            'country'   => null,
            'coordinates' => null,
        ]);

        $staff = Staff::create([
            'user_id'       => $user->id,
            'profile_image' => null,
            'gender'        => null,
            'phone'         => null,
        ]);

        return response()->json([
            'success' => true,
            'is_new'  => true,
            'message' => 'Staff registered under Capital Security.',
            'token'   => $user->createToken('api')->plainTextToken,
            'user'    => $user,
            'staff'   => $staff,
        ], 201);
    }
}
