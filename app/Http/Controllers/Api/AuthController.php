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
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\StaffOnboardingMail;
use Vonage\Client;
use Vonage\Client\Credentials\Basic;
use Vonage\SMS\Message\SMS;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed|min:6',
            'phone' => 'nullable',
            'user_type' => 'required|string',
        ]); 
        
        if($data['user_type'] == 'staff'){
            $capitalUser = User::where('user_type', 'customer')
            ->where('name', 'Capital Security')
            ->firstOrFail();
        }else{
            $capitalUser = null;
        }
        
        $otp = rand(100000, 999999);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'user_type' => $data['user_type'],
            'is_active' => 0,
            'user_id' => $capitalUser->id ?? $capitalUser,
            'phone' => $data['phone'] ?? null,
            'phone_otp' => $otp,
            'agora_uid' => rand(100000, 999999),
            'is_online' => false,
            'last_seen' => now(),
            'phone_verified' => 0,
            'email_verified' => 0
        ]);

        
        $user->staffo_id = 'STAFO' . $user->id;
        $user->save();

        // $this->sendOTP($user->phone, $otp);
        $this->EmailVerify($request->email);

        if($data['user_type'] == 'customer'){
            Customer::create([
                'user_id' => $user->id,
                'phone' => $data['phone'] ?? null,
            ]);
        }elseif($data['user_type'] == 'contractor'){
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
        }else{
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
        
        return response()->json([
            'token' => $user->createToken('api')->plainTextToken,
            'user' => $user
        ], 201);
    }

    public function sendOTP($phone, $otp)
    {
        try {
            if (empty($phone)) {
                \Log::error('OTP Error: Phone is null');
                return false;
            }

            $phone = $this->formatPhone($phone);

            $basic  = new Basic(env('VONAGE_KEY'), env('VONAGE_SECRET'));
            $client = new Client($basic);

            $response = $client->sms()->send(
                new SMS(
                    $phone,
                    env('VONAGE_BRAND'),
                    "Your verification OTP is: $otp"
                )
            );

            $message = $response->current();

            if ($message->getStatus() != 0) {
                \Log::error('Vonage Error: ' . $message->getErrorText());
                return false;
            }

            return true;

        } catch (\Exception $e) {
            \Log::error('Vonage Exception: ' . $e->getMessage());
            return false;
        }
    }

    public function verifyPhone(Request $request)
    {
        $request->validate([
            'phone' => 'required',
            'otp' => 'required'
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->phone_otp != $request->otp) {
            return response()->json(['message' => 'Invalid OTP'], 400);
        }

        if (now()->gt($user->phone_otp_expires_at)) {
            return response()->json(['message' => 'OTP expired'], 400);
        }

        $user->update([
            'phone_verified' => 1,
            'phone_otp' => null,
            'phone_otp_expires_at' => null,
        ]);

        return response()->json(['message' => 'Phone verified']);
    }
    
    public function EmailVerify($email)
   {
        $guard = User::where('email', $email)->first();
        if($guard){
            $otp = Str::random(6);
            $guard->email_otp = $otp;
            $guard->save();
            $this->isEmailVarifay($guard->email, $otp);
        }
    }

    
    function isEmailVarifay($email,$token){
        $data = [
            'token' => $token,
            'email' => $email,
            'title' => "Staff Verify Email",
        ];
        
        Mail::send('emails.isEmailVerify', $data, function($token)use($data){
            $token->from('no-reply@thescouts.com.au', 'Staffoo')
            ->to($data['email']);
            $token->subject("Staff Verify Email");
        });
    }

    //    public function EmailVerification($email,$token)
    // { 
    //     $guard = User::where('email', $email)->first();

    //     if($guard){
    //         if($guard->email_otp == $token){
    //             $guard->is_email_approved = 1;
    //             $guard->email_otp = null;
    //             $guard->save();
    //             return view('guard-welcome', ['guard' => $guard]);
    //         }else{
    //             return response()->json(['message' => "Your Otp Expired!" ,  'code' => 404, 'success' => false]);
    //         }
    //     }else{
    //         return response()->json(['message' => "Staff Not Found!" ,  'code' => 404, 'success' => false]);
    //     }
    // }
    public function EmailVerification($email, $token)
    { 
        $user = User::where('email', $email)->first();

        if ($user) {
            if ($user->email_otp == $token) {

                $user->is_email_approved = 1;
                $user->email_otp = null;
                $user->save();

                if ($user->user_type === 'staff') {
                    Mail::to($user->email)->send(new StaffOnboardingMail());
                }

                return view('guard-welcome', ['guard' => $user]);

            } else {
                return response()->json([
                    'message' => "Your OTP Expired!",
                    'success' => false
                ], 404);
            }
        } else {
            return response()->json([
                'message' => "User Not Found!",
                'success' => false
            ], 404);
        }
    }
    // public function registerContractor(Request $request)
    // {
    //     $data = $request->validate([
    //         'name' => 'required|string',
    //         'email' => 'required|email|unique:users',
    //         'password' => 'required|confirmed|min:6',
    //         'address' => 'nullable',
    //         'city' => 'nullable|string',
    //         'state' => 'nullable|string',
    //         'country' => 'nullable|string',
    //         'coordinates' => 'nullable|string',
    //     ]);

    //     $user = User::create([
    //         'name' => $data['name'],
    //         'email' => $data['email'],
    //         'password' => Hash::make($data['password']),
    //         'user_type' => 'contractor',
    //         'is_active' => 0,
    //         'address' => $data['address'] ?? null,
    //         'city' => $data['city'] ?? null,
    //         'state' => $data['state'] ?? null,
    //         'country' => $data['country'] ?? null,
    //         'coordinates' => $data['coordinates'] ?? null,
    //         'agora_uid' => rand(100000, 999999),
    //         'is_online' => false,
    //         'last_seen' => now()
    //     ]);

    //     $user->staffo_id = 'STAFO' . $user->id;
    //     $user->save();

    //     Contractor::create([
    //         'user_id' => $user->id,
    //         'company_name' => $request->company_name,
    //         'registration_number' => $request->registration_number ?? null,
    //         'phone' => $request->phone ?? null,
    //     ]);

    //     $document_categories = DocumentCategory::where('document_category', 'contractor_document')->first();

    //     foreach (json_decode($document_categories->document_type) as $key => $value) {

    //         $guard_documents = new Document();
    //         $guard_documents->user_id = $user->id;
    //         $guard_documents->document_category = ($document_categories->document_category != '' ? $document_categories->document_category : 'other');
    //         $guard_documents->document_type = $key;
    //         $guard_documents->document_name = $value;
    //         $guard_documents->save();
    //     }

    //     return response()->json([
    //         'token' => $user->createToken('api')->plainTextToken,
    //         'user' => $user
    //     ], 201);
    // }

    // public function registerStaff(Request $request)
    // {
    //     $data = $request->validate([
    //         'name' => 'required|string',
    //         'email' => 'required|email|unique:users',
    //         'password' => 'required|confirmed|min:6',
    //         'address' => 'nullable|string',
    //         'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    //         'gender' => 'nullable|in:male,female,other',
    //         'city' => 'nullable|string',
    //         'state' => 'nullable|string',
    //         'country' => 'nullable|string',
    //         'coordinates' => 'nullable|string',
    //         'phone' => 'nullable|string',
    //     ]);

    //     $capitalUser = User::where('user_type', 'customer')
    //         ->where('name', 'Capital Security')
    //         ->firstOrFail();

    //     $user = User::create([
    //         'name' => $data['name'],
    //         'email' => $data['email'],
    //         'password' => Hash::make($data['password']),
    //         'user_type' => 'staff',
    //         'user_id' => $capitalUser->id,
    //         'address' => $data['address'] ?? null,
    //         'city' => $data['city'] ?? null,
    //         'state' => $data['state'] ?? null,
    //         'country' => $data['state'] ?? null,
    //         'coordinates' => $data['coordinates'] ?? null,
    //         'is_active' => 0,
    //         'agora_uid' => rand(100000, 999999),
    //         'is_online' => false,
    //         'last_seen' => now()
    //     ]);

    //     $user->staffo_id = 'STAFO' . $user->id;
    //     $user->save();

    //     $profileImagePath = null;
    //     if ($request->hasFile('profile_image')) {
    //         $profileImagePath = $request->file('profile_image')->store('staff-profiles', 'public');
    //     }

    //     $staff = Staff::create([
    //         'user_id' => $user->id,
    //         'profile_image' => $profileImagePath ?? $data['profile_image'] ?? null,
    //         'gender' => $data['gender'] ?? null,
    //         'phone' => $data['phone'] ?? null,
    //     ]);

    //     return response()->json([
    //         'message' => 'Staff registered under Capital Security',
    //         'data' => [
    //             'user' => $user,
    //             'staff' => $staff,
    //         ],
    //         'token' => $user->createToken('api')->plainTextToken,
    //     ], 201);
    // }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'message' => 'User Not Found.'
            ], 401);
        }

        if ($user->is_email_approved == 0) {
            return response()->json([
                'message' => 'Please verify your email first'
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

        $user->update(['is_online' => true, 'last_seen' => now()]);
        
        $user->tokens()->delete();

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
            // 'user_type'  => 'required|in:customer,staff,contractor',
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
            $userType = $request->user_type;

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
            }else{
                if (isset($userType) && $userType === 'customer') {
                    return $this->registerCustomerViaGoogle($google);
                }

                if (isset($userType) && $userType === 'contractor') {
                    return $this->registerContractorViaGoogle($google);
                }

                if (isset($userType) && $userType === 'staff') {
                    return $this->registerStaffViaGoogle($google);
                }

                 return response()->json([
                    'success' => false,
                    'message' => 'User not found.',
                 ], 401);
            }

            // ════════════════════════════════════════
            // REGISTER — email not found, create user
            // ════════════════════════════════════════

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

    public function logout($id)
    {
        try {
            // Find user by ID from URL parameter
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
            
            // Update user status
            $user->update([
                'is_online' => false,
                'last_seen' => now(),
                'notification_token' => null
            ]);
            
            // Delete all user tokens
            $user->tokens()->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
