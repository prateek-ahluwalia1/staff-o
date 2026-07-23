<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\GetAllGuardDocuments;
use App\Models\Customer;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserEditResource;
use App\Models\Contractor;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Onboarding;
use App\Models\Staff;
use App\Models\Superannuation;
use App\Models\TfnDeclaration;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Validator;
use Twilio\Rest\Client;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class StaffController extends Controller
{
    
private function calculateProfileCompletion(User $user): int
{
    $baseWeight = 50;
    $documentWeight = 50;

    $baseFields = ['name', 'email', 'user_type'];
    
    $staffFields = ['tfn_form', 'super_form', 'onboarding_form'];
    
    $allBaseFields = $baseFields;
    if ($user->user_type === 'staff' && $user->user_id == 1) {
        $allBaseFields = array_merge($baseFields, $staffFields);
    }
    
    $filledBase = 0;
    foreach ($allBaseFields as $field) {
        if (in_array($field, ['tfn_form', 'super_form', 'onboarding_form'])) {
            if ($user->staff && !empty($user->staff->{$field})) {
                $filledBase++;
            }
        } else {
            if (!empty($user->{$field})) {
                $filledBase++;
            }
        }
    }
    
    $baseScore = ($filledBase / count($allBaseFields)) * $baseWeight;

    // Document scoring
    $documents = $user->documents ?? collect();
    $totalDocuments = $documents->count();
    $filledDocuments = 0;
    $documentScore = 0;

    if ($user->user_type === 'staff') {
        if($user->user_id == 1){
            $documentPoints = [
                'passport'              => 70,
                'citizen_ship'          => 70,
                'medicare'              => 25,
                'birth_certificate'     => 25,
                'security_license'      => 40,
                'driver_license_front'  => 70,
                'driver_license_back'   => 0,
                'working_with_children' => 0,
                'first_aid'             => 0,
                'cpr'                   => 0,
                'visa'                  => 0,
            ];

            $totalDocPoints = 0;

            foreach ($documents as $document) {
                $docName = strtolower(str_replace(' ', '_', $document->document_name));

                $hasFile = !empty($document->file);
                $hasValidExpiry = false;

                if (!empty($document->document_expiry)) {
                    if ($document->document_expiry === 'current, pending renewal') {
                        $hasValidExpiry = true;
                    } else {
                        $expiryDate = \Carbon\Carbon::parse($document->document_expiry);
                        $hasValidExpiry = $expiryDate->isFuture();
                    }
                }

                if ($hasFile && $hasValidExpiry) {
                    $totalDocPoints += $documentPoints[$docName] ?? 0;
                }
            }

            $documentScore = min(($totalDocPoints / 100) * $documentWeight, $documentWeight);

            $totalScore = $baseScore + $documentScore;
            $oldStatus = $user->is_active;
            $newStatus = ($baseScore >= $baseWeight && $totalDocPoints >= 100) ? 1 : 0;

            if ($user->is_active !== $newStatus) {
                $user->is_active = $newStatus;
                $user->save();

                if ($newStatus === 1 && $oldStatus != 1) {
                    $notificationData = [
                        'notification_token' => $user->notification_token,
                        'message'            => "Congratulations! Your account is now active.",
                        'title'              => 'Account Activated',
                        'page'               => 'account-verified',
                    ];

                    if (function_exists('send_push_notification')) {
                        send_push_notification($notificationData);
                    }
                }
            }
        }else{
            $securityLicenseDoc = $documents->firstWhere('document_type', 'security_license');
            $firstAidDoc = $documents->firstWhere('document_type', 'first_aid');
            
            $hasSecurityLicenseWithExpiry = $securityLicenseDoc && !empty($securityLicenseDoc->document_expiry);
            $hasFirstAidWithExpiry = $firstAidDoc && !empty($firstAidDoc->document_expiry);
            
            $oldStatus = $user->is_active;
            $newStatus = ($baseScore >= $baseWeight && 
                          $hasSecurityLicenseWithExpiry && 
                          $hasFirstAidWithExpiry) ? 1 : 0;

            if ($user->is_active !== $newStatus) {
                $user->is_active = $newStatus;
                $user->save();
                
            if ($totalDocuments > 0) {
                $filledDocuments = $documents->filter(function ($doc) {
                    // 1. Ensure the document number is not empty
                    if (empty($doc->document_no)) {
                        return false;
                    }
            
                    // 2. Check if the expiry date exists and is in the future
                    if (!empty($doc->document_expiry)) {
                        $expiryDate = \Carbon\Carbon::parse($doc->document_expiry);
                        return $expiryDate->isFuture();
                    }
            
                    // Return false if there is no expiry date but your logic requires one
                    return false; 
                })->count();
            
                $documentScore = ($filledDocuments / $totalDocuments) * $documentWeight;
            }

                if ($newStatus === 1 && $oldStatus != 1) {
                    $notificationData = [
                        'notification_token' => $user->notification_token,
                        'message'            => "Congratulations! Your account is now active.",
                        'title'              => 'Account Activated',
                        'page'               => 'account-verified',
                    ];

                    if (function_exists('send_push_notification')) {
                        send_push_notification($notificationData);
                    }
                }
            }
        }
    } else {
           if ($totalDocuments > 0) {
                $filledDocuments = $documents->filter(function ($doc) {
                    if (empty($doc->document_no)) {
                        return false;
                    }

                    if (!empty($doc->document_expiry)) {
                        $expiryDate = \Carbon\Carbon::parse($doc->document_expiry);
                        return $expiryDate->isFuture();
                    }

                    return false; 
                })->count();

                $documentScore = ($filledDocuments / $totalDocuments) * $documentWeight;
            }

        if ($user->user_type === 'contractor' && in_array(strtolower($user->state), ['victoria', 'queensland'])) {
            $labourHireDoc = $documents->firstWhere('document_type', 'labour_hire');
            if (!$labourHireDoc || empty($labourHireDoc->document_no)) {
                $documentScore = $documentScore * 0.5;
            }
        }
    }

    // Final percentage
    if (in_array($user->user_type, ['contractor', 'staff'])) {
        $percentage = (int) round($baseScore + $documentScore);
    } else {
        $percentage = (int) round($baseScore + 50);
    }

    return min($percentage, 100);
}

    public function createStaff(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email', // Check in users table
            'phone' => 'nullable|string',
            'password' => 'required|min:6|confirmed', // Added confirmed for password confirmation
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gender' => 'nullable|in:male,female,other',
            'address' => 'nullable',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'country' => 'nullable|string',
            'coordinates' => 'nullable|string',
        ], [
            'email.unique' => 'This email address is already taken. Please use a different email.',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        if ($validator->fails()) {
            $firstErrorMessage = $validator->errors()->first();

            return response()->json([
                'success' => false,
                'message' => $firstErrorMessage,
                'code' => 200
            ], 200);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => 'staff',
            'user_id' => $request->user_id,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'country' => $data['state'] ?? null,
            'coordinates' => $data['coordinates'] ?? null,
            'is_active' => 0,
        ]);

        
        $user->staffo_id = 'STAFO' . $user->id;
        $user->save();

        $profileImagePath = null;
        if ($request->hasFile('profile_image')) {
            $profileImagePath = $request->file('profile_image')->store('staff-profiles', 'public');
        }

        $staff = Staff::create([
            'user_id' => $user->id,
            'profile_image' => $profileImagePath ?? $request->profile_image,
            'gender' => $request->gender,
            'staff_document_type' => $request->staff_document_type,
            'security_license_no' => $request->security_license_no
        ]);

        $old_data = Staff::where('user_id', $user->id)->first();

        $capitalUser = User::where('id', $request->user_id)
            ->where('name', 'Capital Security')
            ->firstOrFail();
        if ($capitalUser->name == "Capital Security") {
            $check_old_data_exist = Document::where('user_id', $user->id)->where('document_category', '!=', 'other-doc')->first();
            if ((!isset($old_data)) || (isset($old_data->staff_document_type) && !$check_old_data_exist)) {
                $document_categories = DocumentCategory::where('document_category', $request->staff_document_type)->first();
                if ($document_categories) {
                    foreach (json_decode($document_categories->document_type) as $key => $value) {
                        $guard_documents = new Document();
                        $guard_documents->user_id = $user->id;
                        $guard_documents->document_category = ($document_categories->document_category != '' ? $document_categories->document_category : 'other');
                        $guard_documents->document_type = $key;
                        $guard_documents->document_name = $value;
                        $guard_documents->save();
                    }
                }
            } else {
                if ($old_data->staff_document_type != $request->staff_document_type) {
                    if ($request->has('staff_document_type') && !empty($request->staff_document_type)) {
                        $document_categories = DocumentCategory::where('document_category', $request->staff_document_type)->first();

                        if ($document_categories) {
                            $old_docs = Document::where('user_id', $user->id)
                                ->where('document_category', '!=', 'other-doc')
                                ->get()
                                ->keyBy('document_type');

                            $new_doc_types = json_decode($document_categories->document_type, true);
                            $new_document_category = $document_categories->document_category ?: 'other';

                            $old_doc_types = $old_docs->keys()->toArray();
                            $new_doc_keys = array_keys($new_doc_types);

                            $to_delete_types = array_diff($old_doc_types, $new_doc_keys);

                            $to_add_types = array_diff($new_doc_keys, $old_doc_types);

                            $common_types = array_intersect($old_doc_types, $new_doc_keys);

                            if (!empty($common_types)) {
                                $common_doc_ids = [];
                                foreach ($common_types as $doc_type) {
                                    if ($old_docs->has($doc_type)) {
                                        $common_doc_ids[] = $old_docs[$doc_type]->id;
                                    }
                                }

                                Document::whereIn('id', $common_doc_ids)
                                    ->update(['document_category' => $new_document_category]);
                            }

                            if (!empty($to_delete_types)) {
                                $docs_to_delete = $old_docs->whereIn('document_type', $to_delete_types);

                                foreach ($docs_to_delete as $doc) {
                                    $doc_id = $doc->id;
                                    $doc->delete();
                                }
                            }

                            if (!empty($to_add_types)) {
                                $documents_to_insert = [];

                                foreach ($to_add_types as $doc_type) {
                                    if (!Document::where(['user_id' => $user->id, 'document_type' => $doc_type])->exists()) {
                                        $documents_to_insert[] = [
                                            'user_id' => $user->id,
                                            'document_category' => $new_document_category,
                                            'document_type' => $doc_type,
                                            'document_name' => $new_doc_types[$doc_type],
                                            'created_at' => now(),
                                            'updated_at' => now()
                                        ];
                                    }
                                }

                                if (!empty($documents_to_insert)) {
                                    Document::insert($documents_to_insert);

                                    foreach ($documents_to_insert as $new_doc) {
                                        $saved_doc = Document::where([
                                            'user_id' => $new_doc['user_id'],
                                            'document_type' => $new_doc['document_type']
                                        ])->first();
                                    }
                                }
                            }

                            if (!empty($to_delete_types)) {
                                Document::where('user_id', $user->id)
                                    ->where('document_category', '!=', 'other-doc')
                                    ->whereNull('file')
                                    ->whereIn('document_type', $to_delete_types)
                                    ->delete();
                            }
                        }
                    }
                }
            }
        }

        // Send email verification
        // $this->guardEmailVerifay($request->email, $request->header('Business-Id'), $request->password);

        return response()->json([
            'message' => "Staff registered successfully. Please verify your email.",
            'code' => 200,
            'success' => true,
            'data' => [
                'user' => $user,
                'staff' => $staff
            ]
        ], 200);
    }

    public function updateStaff(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string',
            'email' => 'sometimes|required|email|unique:users,email,' . $userId,
            'phone' => 'nullable|string',
            'password' => 'nullable|min:6|confirmed',
            // 'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gender' => 'nullable|in:male,female,other',
            'is_active' => 'nullable|in:0,1',
            'address' => 'nullable',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'country' => 'nullable|string',
            'coordinates' => 'nullable|string',
        ], [
            'email.unique' => 'This email address is already taken. Please use a different email.',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'code' => 200
            ], 200);
        }

        $user = User::findOrFail($userId);

        $userData = [];

        if ($request->has('name')) {
            $userData['name'] = $request->name;
        }

        if ($request->has('email')) {
            $userData['email'] = $request->email;
        }

        if ($request->has('phone')) {
            $userData['phone'] = $request->phone;
        }

        if ($request->has('password') && !empty($request->password)) {
            $userData['password'] = Hash::make($request->password);
        }

        if ($request->has('is_active')) {
            $userData['is_active'] = $request->is_active;
        }

        if ($request->has('address')) {
            $userData['address'] = $request->address;
        }

        if ($request->has('state')) {
            $userData['state'] = $request->state;
        }

        if ($request->has('city')) {
            $userData['city'] = $request->city;
        }

        if ($request->has('country')) {
            $userData['country'] = $request->country;
        }


        if ($request->has('coordinates')) {
            $userData['coordinates'] = $request->coordinates;
        }

        if (!empty($userData)) {
            $user->update($userData);
        }

        $staff = Staff::firstOrNew(['user_id' => $user->id]);

        if ($request->hasFile('profile_image')) {
            if ($staff->profile_image) {
                Storage::disk('public')->delete($staff->profile_image);
            }

            $profileImagePath = $request->file('profile_image')->store('staff-profiles', 'public');
            $staff->profile_image = $profileImagePath;
        } elseif ($request->has('profile_image') && !$request->hasFile('profile_image')) {
            $staff->profile_image = $request->profile_image;
        }



        if ($request->has('gender')) {
            $staff->gender = $request->gender;
        }

        $staff->save();

        $old_data = Staff::where('user_id', $user->id)->first();

        $capitalUser = User::where('id', $request->user_id)
            ->where('name', 'Capital Security')
            ->firstOrFail();
        if ($capitalUser->name == "Capital Security") {
            $check_old_data_exist = Document::where('user_id', $user->id)->where('document_category', '!=', 'other-doc')->first();
            if ((!isset($old_data)) || (isset($old_data->staff_document_type) && !$check_old_data_exist)) {
                $document_categories = DocumentCategory::where('document_category', $request->staff_document_type)->first();
                if ($document_categories) {
                    foreach (json_decode($document_categories->document_type) as $key => $value) {
                        $guard_documents = new Document();
                        $guard_documents->user_id = $user->id;
                        $guard_documents->document_category = ($document_categories->document_category != '' ? $document_categories->document_category : 'other');
                        $guard_documents->document_type = $key;
                        $guard_documents->document_name = $value;
                        $guard_documents->save();
                    }
                }
            } else {
                if ($old_data->staff_document_type != $request->staff_document_type) {
                    if ($request->has('staff_document_type') && !empty($request->staff_document_type)) {
                        $document_categories = DocumentCategory::where('document_category', $request->staff_document_type)->first();

                        if ($document_categories) {
                            $old_docs = Document::where('user_id', $user->id)
                                ->where('document_category', '!=', 'other-doc')
                                ->get()
                                ->keyBy('document_type');

                            $new_doc_types = json_decode($document_categories->document_type, true);
                            $new_document_category = $document_categories->document_category ?: 'other';

                            $old_doc_types = $old_docs->keys()->toArray();
                            $new_doc_keys = array_keys($new_doc_types);

                            $to_delete_types = array_diff($old_doc_types, $new_doc_keys);

                            $to_add_types = array_diff($new_doc_keys, $old_doc_types);

                            $common_types = array_intersect($old_doc_types, $new_doc_keys);

                            if (!empty($common_types)) {
                                $common_doc_ids = [];
                                foreach ($common_types as $doc_type) {
                                    if ($old_docs->has($doc_type)) {
                                        $common_doc_ids[] = $old_docs[$doc_type]->id;
                                    }
                                }

                                Document::whereIn('id', $common_doc_ids)
                                    ->update(['document_category' => $new_document_category]);
                            }

                            if (!empty($to_delete_types)) {
                                $docs_to_delete = $old_docs->whereIn('document_type', $to_delete_types);

                                foreach ($docs_to_delete as $doc) {
                                    $doc_id = $doc->id;
                                    $doc->delete();
                                }
                            }

                            if (!empty($to_add_types)) {
                                $documents_to_insert = [];

                                foreach ($to_add_types as $doc_type) {
                                    if (!Document::where(['user_id' => $user->id, 'document_type' => $doc_type])->exists()) {
                                        $documents_to_insert[] = [
                                            'user_id' => $user->id,
                                            'document_category' => $new_document_category,
                                            'document_type' => $doc_type,
                                            'document_name' => $new_doc_types[$doc_type],
                                            'created_at' => now(),
                                            'updated_at' => now()
                                        ];
                                    }
                                }

                                if (!empty($documents_to_insert)) {
                                    Document::insert($documents_to_insert);

                                    foreach ($documents_to_insert as $new_doc) {
                                        $saved_doc = Document::where([
                                            'user_id' => $new_doc['user_id'],
                                            'document_type' => $new_doc['document_type']
                                        ])->first();
                                    }
                                }
                            }

                            if (!empty($to_delete_types)) {
                                Document::where('user_id', $user->id)
                                    ->where('document_category', '!=', 'other-doc')
                                    ->whereNull('file')
                                    ->whereIn('document_type', $to_delete_types)
                                    ->delete();
                            }
                        }
                    }
                }
            }
        }

        $user->load('staff');

        return response()->json([
            'success' => true,
            'message' => 'Staff updated successfully.',
            'code' => 200,
            'data' => $user
        ], 200);
    }

    public function getAllGuardDocument(Request $request)
    {
        $guardDocuments = Document::where('user_id', $request->id)->orderBy('document_name', 'asc')->get();
        $grd = GetAllGuardDocuments::collection($guardDocuments);
        return response()->json(['success' => true, 'data' => $grd, 'code' => 200]);
    }

    public function uploadFile(Request $request)
    {
        if ($request->folder == '') {
            $request->folder = 'uploads';
        }
        if ($request->has('upload')) {
            $image = fileUpload($request->upload, '/' . $request->folder . '/');
        } else {
            $image = fileUpload($request->file, '/' . $request->folder . '/');
        }
        if ($image != '') {
            $url = asset('') . $request->folder . '/' . $image;
            if ($request->folder == '') {
                $url = asset('uploads') . '/' . $image;
            }
            return response()->json(array('success' => true, 'path' => $image, 'url' => $url));
        } else {
            return response()->json(array('success' => false, 'path' => '', 'url' => ''));
        }
    }

    public function addGuardDocuments(Request $request)
    {
        $staff_details = Staff::where('user_id', $request->id)->first();
        if ($staff_details && $staff_details->staff_document_type) {

            if (Document::where(['user_id' => $request->id, 'document_type' => $request->document_type])->first()) {
                if ($request->document_type != 'other') {
                    return response()->json(['message' => "This type of document is already exist!", 'success' => false], 404);
                }
            }
            $addDocuments = new Document();
            $addDocuments->user_id = $request->id;
            $addDocuments->document_name = $request->document_name;
            $addDocuments->document_category = $staff_details->staff_document_type;
            $addDocuments->document_expire = $request->document_expire ? dbFormate($request->document_expire) : null;
            $addDocuments->side = (!empty($request->side) && $request->has('side') ? $request->side : '');
            $addDocuments->document_no = (!empty($request->document_no) && $request->has('document_no') ? $request->document_no : '');
            $addDocuments->document_type = (!empty($request->document_type) && $request->has('document_type') ? $request->document_type : '');
            $addDocuments->document_name = (!empty($request->document_name) && $request->has('document_name') ? returnAction($request->document_name) : '');

            if ($request->has('file')) {
                $addDocuments->file = $request->file;
            }
            $addDocuments->save();
            return response()->json(['message' => "Staff Documents Add Successfully!", 'code' => 200, 'success' => true]);
        } else {
            return response()->json(['message' => "Staff Residencial status not updated!", 'success' => false], 404);
        }
    }

    public function updateGuardDocuments(Request $request)
    {

        $updateDocuments = Document::where('id', $request->id)->first();
        $old_data = $updateDocuments;
        $updateDocuments->document_name = $request->document_name;
        $updateDocuments->user_id = $request->user_id;
        if (!empty($request->document_expiry) && $request->document_expiry == 'current, pending renewal') {
            $updateDocuments->document_expiry = $request->document_expiry;
        } else {
            if (str_contains($request->document_expiry, '/')) {
                $formattedExpiry = Carbon::createFromFormat('d/m/Y', $request->document_expiry)->format('Y-m-d');
            } else {
                $formattedExpiry = Carbon::parse($request->document_expiry)->format('Y-m-d');
            }
            $updateDocuments->document_expiry = $formattedExpiry;
        }
        $updateDocuments->document_no = (!empty($request->document_no) && $request->has('document_no') ? $request->document_no : '');
        $updateDocuments->document_type = (!empty($request->document_type) && $request->has('document_type') ? $request->document_type : '');

        if ($request->has('file')) {
            $updateDocuments->file = $request->file;
            $updateDocuments->file = str_replace(url('') . "/" . "staff_documents/", "", $request->file);
        }
        $updateDocuments->save();

        return response()->json(['message' => "Staff Documents Updated Successfully!", 'code' => 200, 'success' => true]);
    }
    
    //  public function documentsPoints(User $user)
    // {
    //     $documentPoints = [
    //         'passport' => 70,
    //         'citizen_ship' => 70,
    //         'medicare' => 25,
    //         'birth_certificate' => 25,
    //         'security_license' => 40,
    //         'driver_license_front' => 70,
    //         'driver_license_back' => 0,
    //         'working_with_children' => 0,
    //         'first_aid' => 0,
    //         'cpr' => 0,
    //         'visa' => 0,
    //     ];

    //     $updateDocuments = Document::where('user_id', $user->id)->first();
        
    //     if (!$updateDocuments) {
    //         return response()->json(['message' => "Document not found!", 'code' => 404, 'success' => false]);
    //     }
        
    //     $allUserDocuments = Document::where('user_id', $user->id)->get();
        
    //     $totalPoints = 0;
    //     $validDocuments = [];
    //     $invalidDocuments = [];
        
    //     foreach ($allUserDocuments as $document) {
    //         $docName = strtolower(str_replace(' ', '_', $document->document_name));
            
    //         $hasFile = !empty($document->file);
    //         $hasValidExpiry = false;
            
    //         if (!empty($document->document_expiry)) {
    //             if ($document->document_expiry == 'current, pending renewal') {
    //                 $hasValidExpiry = true;
    //             } else {
    //                 $expiryDate = \Carbon\Carbon::parse($document->document_expiry);
    //                 $hasValidExpiry = $expiryDate->isFuture();
    //             }
    //         }
            
    //         if ($hasFile && $hasValidExpiry) {
    //             $points = $documentPoints[$docName] ?? 0;
    //             $totalPoints += $points;
                
    //             $validDocuments[] = [
    //                 'document_name' => $document->document_name,
    //                 'points' => $points,
    //                 'expiry' => $document->document_expiry,
    //                 'document_no' => $document->document_no
    //             ];
    //         } else {
    //             $invalidDocuments[] = [
    //                 'document_name' => $document->document_name,
    //                 'reason' => !$hasFile ? 'No file uploaded' : 'Invalid or missing expiry',
    //                 'expiry' => $document->document_expiry ?? 'Not provided'
    //             ];
    //         }
    //     }
        
    //     $accountStatus = $totalPoints >= 100 ? 1 : 0;
        
    //     $user = User::find($user->id);
    //     if ($user) {
    //         $oldStatus = $user->is_active;
    //         $user->is_active = $accountStatus;
    //         $user->save();
            
    //         // Send notification if account becomes active from inactive
    //         if ($totalPoints >= 100 && $oldStatus != 1) {
                 
    //             $notificationData = [
    //                 'notification_token' => $user->notification_token,
    //                 'message' => "Congratulations! Your account is now active with {$totalPoints} verification points.",
    //                 'title' => 'Account Activated',
    //                 'page' => 'account-verified',
    //             ];
                
    //             if (function_exists('send_push_notification')) {
    //                 send_push_notification($notificationData);
    //             }   
    //         }
    //     }
        
    //     return response()->json([
    //         'message' => "Staff Documents Updated Successfully!",
    //         'code' => 200,
    //         'success' => true,
    //         'data' => [
    //             'total_points' => $totalPoints,
    //             'required_points' => 100,
    //             'account_status' => $accountStatus,
    //             'valid_documents' => $validDocuments,
    //             'invalid_documents' => $invalidDocuments,
    //             'points_remaining' => $totalPoints >= 100 ? 0 : (100 - $totalPoints),
    //             'is_verified' => $totalPoints >= 100
    //         ]
    //     ]);
    // }

    public function editUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->user_type === 'customer') {
            $user->load(['customer']);
        } elseif ($user->user_type === 'contractor') {
            $user->load('contractor', 'documents');
        } elseif ($user->user_type === 'staff') {
            $user->load('staff', 'documents');
        }

        $percentage = $this->calculateProfileCompletion($user);
        // $verificationPoints = $this->documentsPoints($user);

        if ($percentage === 100 && (int) $user->is_active !== 1) {
            $user->is_active = 1;
            $user->save();
        }

        $user->profile_completion_percentage = $percentage;

        return response()->json(['success' => true, 'code' => 200, 'data' => $user]);
    }
    
    public function getStaffInfo($id)
    {
        $user = User::findOrFail($id);

        if ($user->user_type === 'customer') {
            $user->load(['customer']);
        } elseif ($user->user_type === 'contractor') {
            $user->load('contractor', 'documents');
        } elseif ($user->user_type === 'staff') {
            $user->load('staff', 'documents');
        }

        $data = new UserEditResource($user);

        return response()->json([
            'success' => true, 
            'code'    => 200, 
            'data'    =>  $data,
        ]);    
    }

    public function updateUser(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $rules = [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
                'password' => 'nullable|confirmed|min:6',
                'is_active' => 'sometimes|boolean',
                'staff_document_type' => 'nullable|string',
                'address' => 'nullable',
                'city' => 'nullable|string',
                'state' => 'nullable|string',
                'country' => 'nullable|string',
                'coordinates' => 'nullable|string',
            ];

            if ($user->user_type === 'customer') {
                $rules = array_merge($rules, [
                    'phone' => 'nullable|string',
                    'bank_details' => 'nullable',
                    'email_otp' => 'nullable|string',
                    'profile_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                ]);
            }

            if ($user->user_type === 'contractor') {
                $rules = array_merge($rules, [
                    'company_name' => 'sometimes|required|string|max:255',
                    'registration_number' => 'nullable|string|max:255',
                    'phone' => 'nullable|string|max:20',
                    'acn' => 'nullable|string',
                    'abn' => 'nullable|string',
                    // 'profile_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                ]);
            }

            if ($user->user_type === 'staff') {
                $rules = array_merge($rules, [
                    // 'profile_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                    'gender' => 'sometimes|nullable|in:male,female,other',
                    'phone' => 'sometimes|nullable|string',
                    'staff_document_type' => 'sometimes|nullable|string',
                    'security_license_no' => 'sometimes|nullable|string',
                    'date_of_birth' => 'sometimes|nullable|string',
                    'origin_country' => 'sometimes|nullable|string'
                ]);
            }

            $data = $request->validate($rules);

            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            $user->update(collect($data)->only([
                'name',
                'email',
                'password',
                'is_active',
                'city',
                'state',
                'country',
                'address',
                'phone',
                'coordinates'
            ])->toArray());

              if (empty($user->staffo_id) || $user->staffo_id == null ){
                    $user->staffo_id = 'STAFO' . $user->id;
                    $user->update();
                }

                if ($user->user_type === 'customer') {
                 $profileData = collect($data)->only([
                    'phone',
                    'company_name',
                    'bank_details',
                ])->toArray();

                if ($request->hasFile('profile_image')) {
                    $profileData['profile_image'] = $request->file('profile_image')->store('staff-profiles', 'public');
                } elseif (array_key_exists('profile_image', $data)) {
                    $profileData['profile_image'] = $data['profile_image'];
                }

                if ($user->customer) {
                    $user->customer->update($profileData);
                } else {
                    $profileData['user_id'] = $user->id;
                    Customer::create($profileData);
                }

                $user->load(['customer']);
            }

            if ($user->user_type === 'contractor') {
                $profileData = collect($data)->only([
                    'company_name',
                    'registration_number',
                    'phone',
                    'abn',
                    'acn',
                ])->toArray();

                 if ($request->hasFile('profile_image')) {
                    $profileData['profile_image'] = $request->file('profile_image')->store('staff-profiles', 'public');
                } elseif (array_key_exists('profile_image', $data)) {
                    $profileData['profile_image'] = $data['profile_image'];
                }

                if ($user->contractor) {
                    $user->contractor->update($profileData);
                } else {
                    $profileData['user_id'] = $user->id;
                    Contractor::create($profileData);
                }
                $user->load('contractor', 'documents');
            }

            if ($user->user_type === 'staff') {
                $staff = Staff::where('user_id', $user->id)->first();

                if (!empty($data['staff_document_type']) && $user->user_id == 1) {
                    $check_old_data_exist = Document::where('user_id', $user->id)
                        ->where('document_category', '!=', 'other-doc')
                        ->first();

                    if (!$staff || !$check_old_data_exist) {
                        $document_categories = DocumentCategory::where('document_category', $request->staff_document_type)->first();
                        if ($document_categories) {
                            foreach (json_decode($document_categories->document_type) as $key => $value) {
                                $guard_documents = new Document();
                                $guard_documents->user_id = $user->id;
                                $guard_documents->document_category = ($document_categories->document_category != '' ? $document_categories->document_category : 'other');
                                $guard_documents->document_type = $key;
                                $guard_documents->document_name = $value;
                                $guard_documents->save();
                            }
                        }
                    }
                    // Case 2: Updating existing documents
                    else if ($staff && $staff->staff_document_type != $request->staff_document_type) {
                        $document_categories = DocumentCategory::where('document_category', $request->staff_document_type)->first();

                        if ($document_categories) {
                            $old_docs = Document::where('user_id', $user->id)
                                ->where('document_category', '!=', 'other-doc')
                                ->get()
                                ->keyBy('document_type');

                            $new_doc_types = json_decode($document_categories->document_type, true);
                            $new_document_category = $document_categories->document_category ?: 'other';

                            $old_doc_types = $old_docs->keys()->toArray();
                            $new_doc_keys = array_keys($new_doc_types);

                            $to_delete_types = array_diff($old_doc_types, $new_doc_keys);
                            $to_add_types = array_diff($new_doc_keys, $old_doc_types);
                            $common_types = array_intersect($old_doc_types, $new_doc_keys);

                            // Update common types
                            if (!empty($common_types)) {
                                $common_doc_ids = [];
                                foreach ($common_types as $doc_type) {
                                    if ($old_docs->has($doc_type)) {
                                        $common_doc_ids[] = $old_docs[$doc_type]->id;
                                    }
                                }

                                Document::whereIn('id', $common_doc_ids)
                                    ->update(['document_category' => $new_document_category]);
                            }

                            // Delete old types that have no files
                            if (!empty($to_delete_types)) {
                                Document::where('user_id', $user->id)
                                    ->where('document_category', '!=', 'other-doc')
                                    ->whereIn('document_type', $to_delete_types)
                                    ->delete();
                            }

                            // Add new types
                            if (!empty($to_add_types)) {
                                $documents_to_insert = [];

                                foreach ($to_add_types as $doc_type) {
                                    if (!Document::where(['user_id' => $user->id, 'document_type' => $doc_type])->exists()) {
                                        $documents_to_insert[] = [
                                            'user_id' => $user->id,
                                            'document_category' => $new_document_category,
                                            'document_type' => $doc_type,
                                            'document_name' => $new_doc_types[$doc_type],
                                            'created_at' => now(),
                                            'updated_at' => now()
                                        ];
                                    }
                                }

                                if (!empty($documents_to_insert)) {
                                    Document::insert($documents_to_insert);
                                }
                            }
                        }
                    }
                }

                // Now update the staff record with ALL data including the document type
                $staffData = collect($data)->only([
                    'gender',
                    'phone',
                    'staff_document_type',
                    'security_license_no',
                    'date_of_birth',
                    'origin_country'
                ])->toArray();

                if ($request->hasFile('profile_image')) {
                    $staffData['profile_image'] = $request->file('profile_image')->store('staff-profiles', 'public');
                } elseif (array_key_exists('profile_image', $data)) {
                    $staffData['profile_image'] = $data['profile_image'];
                }

                if ($staff) {
                    $staff->update($staffData);
                } else {
                    $staffData['user_id'] = $user->id;
                    Staff::create($staffData);
                }

                $user->load(['staff', 'documents']);
            }


            // if ($user->user_type === 'customer') {

            //     $customer = $user->customer;

            //     $newEmail = $request->email ?? $user->email;
            //     // $newPhone = $request->phone ?? optional($customer)->phone;

            //     $emailChanged = $newEmail != $user->email;
            //     // $phoneChanged = $newPhone != optional($customer)->phone;

            //     if ($emailChanged || $customer->verify_profile == 0) {

            //         // If OTP not provided → send OTP
            //         if (!$request->email_otp) {

            //             $emailOtp = rand(100000, 999999);
            //             // $phoneOtp = rand(100000, 999999);

            //             if ($customer) {
            //                 $customer->update([
            //                     'email_otp' => $emailOtp,
            //                     // 'phone_otp' => $phoneOtp,
            //                     'otp_expires_at' => now()->addMinutes(10)
            //                 ]);
            //             }

            //             // Send Email OTP
            //             if ($emailChanged) {
            //                 Mail::raw("Your verification OTP is: $emailOtp", function ($message) use ($newEmail) {
            //                     $message->to($newEmail)
            //                         ->subject('Email Verification OTP');
            //                 });

            //                 return response()->json([
            //                     'success' => false,
            //                     'otp_required' => true,
            //                     'message' => 'OTP sent to email. Please verify to continue.'
            //                 ]);
            //             }

            //             // Send SMS OTP (integrate gateway)
            //             // if ($phoneChanged) {
            //             //     // SMS::send($newPhone, "Your OTP is: $phoneOtp");
            //             // }

            //             return response()->json([
            //                 'success' => true,
            //                 'otp_required' => false,
            //                 'message' => 'User Updated Successfully.'
            //             ]);
            //         }

            //         // Verify OTP
            //         if (!$customer || $customer->otp_expires_at < now()) {
            //             return response()->json([
            //                 'message' => 'OTP expired'
            //             ], 400);
            //         }

            //         if ($request->email_otp != $customer->email_otp) {

            //             return response()->json([
            //                 'message' => 'Invalid OTP'
            //             ], 400);
            //         }

            //         // OTP verified
            //         $customer->update([
            //             'email_otp' => null,
            //             'phone_otp' => null,
            //             'otp_expires_at' => null,
            //             'verify_profile' => 1
            //         ]);
            //     }
            // }

            return response()->json(['success' => true, 'code' => 200, 'data' => $user]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteUser($id)
    {
        try {
            $user = User::findOrFail($id);

            DB::beginTransaction();

            if ($user->user_type === 'customer') {
                if ($user->customer) {
                    $user->customer->delete();
                }
                
            } elseif ($user->user_type === 'contractor') {
                if ($user->contractor) {
                    $user->contractor->delete();
                }
                
                if ($user->documents) {
                    $user->documents()->delete();
                }
                
            } elseif ($user->user_type === 'staff') {
                if ($user->staff) {
                    $user->staff->delete();
                }
                
                if ($user->documents) {
                    $user->documents()->delete();
                }
            }

            $user->tokens()->delete();

            $user->delete();

            DB::commit();

            return response()->json([
                'success' => true, 
                'code' => 200, 
                'message' => 'User deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false, 
                'code' => 500, 
                'message' => 'Failed to delete user: ' . $e->getMessage()
            ], 500);
        }
    }

     public function index(Request $request)
    {
        $query = User::where('id', '!=', Auth::id())
            ->select('id', 'name', 'email', 'phone', 'avatar', 'is_online', 'last_seen');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        }

        if ($request->has('status') && $request->status === 'online') {
            $query->where('is_online', true);
        }

        $users = $query->orderBy('is_online', 'desc')
            ->orderBy('name')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'total' => $users->total(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage()
        ]);
    }

     public function getOnlineUsers()
    {
        $users = User::where('id', '!=', Auth::id())
            ->where('is_online', true)
            ->select('id', 'name', 'email', 'avatar')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
            'count' => $users->count()
        ]);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function updateOnlineStatus(Request $request)
    {
        $request->validate([
            'is_online' => 'required|boolean'
        ]);

        $user = Auth::user();
        $user->is_online = $request->is_online;
        
        if (!$request->is_online) {
            $user->last_seen = now();
        }
        
        $user->save();

        return response()->json([
            'success' => true,
            'is_online' => $user->is_online,
            'last_seen' => $user->last_seen
        ]);
    }
    
    public function tfnDeclarationStore(Request $request)
    {
        $validated = $request->validate([
            'tfn'                => 'nullable|string|max:11',
            'title'              => 'nullable|string|max:10',
            'full_name'         => 'required|string|max:100',
            'previous_name'      => 'nullable|string|max:100',
            'dob'                => 'nullable|string',
            'address'            => 'nullable|string|max:255',
            'basis_of_payment'   => 'nullable|in:full-time,part-time,casual',
            'australian_resident'=> 'nullable|in:yes,no',
            'claim_threshold'    => 'nullable|in:yes,no',
            'help_debt'          => 'nullable|in:yes,no',
            'signature'          => 'nullable|string|max:150',
            'date'               => 'nullable|string',
        ]);

        $record = TfnDeclaration::updateOrCreate(
            ['user_id' => $request->user_id],   // match condition
            [
                ...$validated,
                'user_id'             => $request->user_id,
                'australian_resident' => $request->australian_resident === 'yes',
                'claim_threshold'     => $request->claim_threshold === 'yes',
                'help_debt'           => $request->help_debt === 'yes',
                'signed_date'         => $request->date,
            ]
        );

        $status = $record->wasRecentlyCreated ? 201 : 200;
        $message = $record->wasRecentlyCreated ? 'TFN declaration saved.' : 'TFN declaration updated.';

        return response()->json(['message' => $message, 'data' => $record], $status);
    }

    public function superannuationStore(Request $request)
    {
        $validated = $request->validate([
            'full_name'       => 'required|string|max:200',
            'employee_number' => 'nullable|string|max:50',
            'fund_choice'     => 'nullable|in:own,employer',
            'fund_name'       => 'nullable|string|max:200',
            'fund_abn'        => 'nullable|string|max:20',
            'fund_usi'        => 'nullable|string|max:50',
            'member_account'  => 'nullable|string|max:50',
            'signature'       => 'nullable|string|max:150',
            'date'            => 'nullable|string',
            'super_confirm'  => 'nullable',
        ]);

        $record = Superannuation::updateOrCreate(
            ['user_id' => $request->user_id],   // match condition
            [
                ...$validated,
                'user_id'     => $request->user_id,
                'signed_date' => $request->date,
            ]
        );

        $status = $record->wasRecentlyCreated ? 201 : 200;
        $message = $record->wasRecentlyCreated ? 'Superannuation saved.' : 'Superannuation updated.';

        return response()->json(['message' => $message, 'data' => $record], $status);
    }

    public function onboardingStore(Request $request)
    {
        $validated = $request->validate([
            'full_name'               => 'required|string|max:200',
            'dob'                     => 'nullable|string',
            'address'                 => 'nullable|string|max:255',
            'mobile'                  => 'nullable|string|max:20',
            'email'                   => 'nullable|email|max:150',
            'passport_number'         => 'nullable|string|max:20',
            'passport_country'        => 'nullable|string|max:100',
            'passport_expiry'         => 'nullable|string',
            'passport_doc'            => 'nullable|string',
            'work_rights'             => 'nullable|string',
            'id_checks'               => 'nullable|array',
            'bank_name'               => 'nullable|string|max:100',
            'bsb'                     => 'nullable|string|max:10',
            'account_number'          => 'nullable|string|max:20',
            'tfn'                     => 'nullable|string|max:11',
            'super_fund'              => 'nullable|string|max:200',
            'super_usi'               => 'nullable|string|max:50',
            'super_member'            => 'nullable|string|max:50',
            'security_license'        => 'nullable|string|max:50',
            'security_license_expiry' => 'nullable|string',
            'security_license_doc'    => 'nullable|string',
            'first_aid_cert'          => 'nullable|string|max:50',
            'first_aid_expiry'        => 'nullable|string',
            'first_aid_doc'           => 'nullable|string',
            'signature'               => 'nullable|string|max:150',
            'date'                    => 'nullable|string',
        ]);

        $record = Onboarding::updateOrCreate(
            ['user_id' => $request->user_id],   // match condition
            [
                ...$validated,
                'user_id'     => $request->user_id,
                'signed_date' => $request->date,
            ]
        );

       if ($request->filled(['security_license', 'security_license_expiry', 'security_license_doc'])) {
    
                        // Find the existing document
            $document = Document::where('user_id', $request->user_id)
            ->where('document_type', 'security_license')
            ->first();

            // Only update if it exists
            if ($document) {
            
                if (str_contains($request->security_license_expiry, '/')) {
                    $formattedExpiry = Carbon::createFromFormat('d/m/Y', $request->security_license_expiry)->format('Y-m-d');
                } else {
                    $formattedExpiry = Carbon::parse($request->security_license_expiry)->format('Y-m-d');
                }
                
                $document->update([
                    'document_no'     => $request->security_license,
                    'file'            => $request->security_license_doc,
                    'document_expiry' => $formattedExpiry
                ]);
            }
        }

        if ($request->filled(['passport_number', 'passport_expiry', 'passport_doc'])) {
            
            // Find the existing document
            $document = Document::where('user_id', $request->user_id)
                                ->where('document_type', 'passport')
                                ->first();

            // Only update if it exists
            if ($document) {
                if (str_contains($request->passport_expiry, '/')) {
                    $formattedExpiry = Carbon::createFromFormat('d/m/Y', $request->passport_expiry)->format('Y-m-d');
                } else {
                    $formattedExpiry = Carbon::parse($request->passport_expiry)->format('Y-m-d');
                }
                
                $document->update([
                    'document_no'     => $request->passport_number,
                    'file'            => $request->passport_doc,
                    'document_expiry' => $formattedExpiry
                ]);
            }
        }

        if ($request->filled(['first_aid_cert', 'first_aid_expiry', 'first_aid_doc'])) {
            
            // Find the existing document
            $document = Document::where('user_id', $request->user_id)
                                ->where('document_type', 'first_aid')
                                ->first();

            // Only update if it exists
            if ($document) {
                if (str_contains($request->first_aid_expiry, '/')) {
                    $formattedExpiry = Carbon::createFromFormat('d/m/Y', $request->first_aid_expiry)->format('Y-m-d');
                } else {
                    $formattedExpiry = Carbon::parse($request->first_aid_expiry)->format('Y-m-d');
                }
                
                $document->update([
                    'document_no'     => $request->first_aid_cert,
                    'file'            => $request->first_aid_doc,
                    'document_expiry' => $formattedExpiry
                ]);
            }
        }

        $status = $record->wasRecentlyCreated ? 201 : 200;
        $message = $record->wasRecentlyCreated ? 'Onboarding saved.' : 'Onboarding updated.';

        return response()->json(['success' => true, 'message' => $message, 'data' => $record], $status);
    }
//    public function onboardingStore(Request $request)
// {
//     $validated = $request->validate([
//         'full_name'               => 'required|string|max:200',
//         'dob'                     => 'nullable|string',
//         'address'                 => 'nullable|string|max:255',
//         'mobile'                  => 'nullable|string|max:20',
//         'email'                   => 'nullable|email|max:150',
//         'passport_number'         => 'nullable|string|max:20',
//         'passport_country'        => 'nullable|string|max:100',
//         'passport_expiry'         => 'nullable|string',
//         'passport_doc'            => 'nullable|string',
//         'work_rights'             => 'nullable|string',
//         'id_checks'               => 'nullable|array',
//         'bank_name'               => 'nullable|string|max:100',
//         'bsb'                     => 'nullable|string|max:10',
//         'account_number'          => 'nullable|string|max:20',
//         'tfn'                     => 'nullable|string|max:11',
//         'super_fund'              => 'nullable|string|max:200',
//         'super_usi'               => 'nullable|string|max:50',
//         'super_member'            => 'nullable|string|max:50',
//         'security_license'        => 'nullable|string|max:50',
//         'security_license_expiry' => 'nullable|string',
//         'security_license_doc'    => 'nullable|string',
//         'first_aid_cert'          => 'nullable|string|max:50',
//         'first_aid_expiry'        => 'nullable|string',
//         'first_aid_doc'           => 'nullable|string',
//         'signature'               => 'nullable|string|max:150',
//         'date'                    => 'nullable|string',
//     ]);

//     if ($request->filled(['security_license', 'security_license_expiry', 'security_license_doc'])) {
    
//         // Find the existing document
//         $document = Document::where('user_id', $request->user_id)
//         ->where('document_type', 'security_license')
//         ->first();

//         // Only update if it exists
//         if ($document) {
        
//             if (str_contains($request->security_license_expiry, '/')) {
//                 $formattedExpiry = Carbon::createFromFormat('d/m/Y', $request->security_license_expiry)->format('Y-m-d');
//             } else {
//                 $formattedExpiry = Carbon::parse($request->security_license_expiry)->format('Y-m-d');
//             }
            
//             $document->update([
//                 'document_no'     => $request->security_license,
//                 'file'            => $request->security_license_doc,
//                 'document_expiry' => $formattedExpiry
//             ]);
//         }
//     }

//     if ($request->filled(['passport_number', 'passport_expiry', 'passport_doc'])) {
        
//         // Find the existing document
//         $document = Document::where('user_id', $request->user_id)
//                             ->where('document_type', 'passport')
//                             ->first();

//         // Only update if it exists
//         if ($document) {
//             if (str_contains($request->passport_expiry, '/')) {
//                 $formattedExpiry = Carbon::createFromFormat('d/m/Y', $request->passport_expiry)->format('Y-m-d');
//             } else {
//                 $formattedExpiry = Carbon::parse($request->passport_expiry)->format('Y-m-d');
//             }
            
//             $document->update([
//                 'document_no'     => $request->passport_number,
//                 'file'            => $request->passport_doc,
//                 'document_expiry' => $formattedExpiry
//             ]);
//         }
//     }

//     if ($request->filled(['first_aid_cert', 'first_aid_expiry', 'first_aid_doc'])) {
        
//         // Find the existing document
//         $document = Document::where('user_id', $request->user_id)
//                             ->where('document_type', 'first_aid')
//                             ->first();

//         // Only update if it exists
//         if ($document) {
//             if (str_contains($request->first_aid_expiry, '/')) {
//                 $formattedExpiry = Carbon::createFromFormat('d/m/Y', $request->first_aid_expiry)->format('Y-m-d');
//             } else {
//                 $formattedExpiry = Carbon::parse($request->first_aid_expiry)->format('Y-m-d');
//             }
            
//             $document->update([
//                 'document_no'     => $request->first_aid_cert,
//                 'file'            => $request->first_aid_doc,
//                 'document_expiry' => $formattedExpiry
//             ]);
//         }
//     }

//    // Get all documents from database after updates
//     $documentsCollection = Document::where('user_id', $request->user_id)->get();
//     $documents = $documentsCollection->keyBy('document_type');

//     // Get specific documents
//     $passport = $documents->get('passport');
//     $securityLicense = $documents->get('security_license');
//     $drivingLicense = $documents->get('driver_license_front');
//     $medicare = $documents->get('first_aid');

//     // Check if document is complete
//     function hasCompleteDocument($document) {
//         return $document && 
//             !is_null($document->document_no) && 
//             $document->document_no !== '' &&
//             !is_null($document->document_expiry) && 
//             $document->document_expiry !== '' &&
//             !is_null($document->file) && 
//             $document->file !== '';
//     }

//     // Generate id_checks
//     $idChecks = [
//         'primary_id' => hasCompleteDocument($passport) ? true : false,
//         'drivers_license' => hasCompleteDocument($drivingLicense) ? true : false,
//         'security_license' => hasCompleteDocument($securityLicense) ? true : false,
//         'medicare_or_utility' => hasCompleteDocument($medicare) ? true : false,
//     ];

//     $record = Onboarding::updateOrCreate(
//         ['user_id' => $request->user_id],
//         [
//             ...$validated,
//             'user_id'     => $request->user_id,
//             'signed_date' => $request->date,
//             'id_checks'   => json_encode($idChecks),
//         ]
//     );

//     $status = $record->wasRecentlyCreated ? 201 : 200;
//     $message = $record->wasRecentlyCreated ? 'Onboarding saved.' : 'Onboarding updated.';

//     // Decode id_checks for response
//     $responseData = $record->toArray();
//     if (isset($responseData['id_checks'])) {
//         $responseData['id_checks'] = json_decode($responseData['id_checks'], true);
//     }

//     return response()->json(['success' => true, 'message' => $message, 'data' => $responseData], $status);
// }

    public function hasCompleteDocument($document) {
        return $document && 
            !is_null($document->document_no) && 
            !is_null($document->document_expiry) && 
            !is_null($document->file);
    }
    public function uploadStaffFile(Request $request)
    {
        try {

            // Validate request
            // $request->validate([
            //     'user_id' => 'required|exists:staff,id',
            //     'type' => 'required|in:tfn,super_form,onboarding',
            //     'folder' => 'nullable|string'
            // ]);

            if (empty($request->folder)) {
                switch ($request->type) {
                    case 'tfn':
                        $request->folder = 'TFN';
                        break;
                    case 'super_form':
                        $request->folder = 'Superannuation';
                        break;
                    case 'onboarding':
                        $request->folder = 'Onboarding';
                        break;
                    default:
                        $request->folder = 'uploads';
                }
            }

            // Upload file
            if ($request->has('upload')) {
                $fileName = fileUpload($request->upload, '/' . $request->folder . '/');
            } elseif ($request->has('file')) {
                $fileName = fileUpload($request->file, '/' . $request->folder . '/');
            } else {
                return response()->json([
                    'success' => false, 
                    'message' => 'No file provided'
                ]);
            }

            if ($fileName) {
                // Update staff table based on type
         $staff = Staff::where('user_id', $request->user_id)->first();
                
                if (!$staff) {
                    return response()->json([
                        'success' => false, 
                        'message' => 'Staff not found'
                    ]);
                }

                // Update the appropriate column
                switch ($request->type) {
                    case 'tfn':
                        $staff->tfn_form = $fileName;
                        break;
                    case 'super_form':
                        $staff->super_form = $fileName;
                        break;
                    case 'onboarding':
                        $staff->onboarding_form = $fileName;
                        break;
                }
                
                $staff->save();

                // Generate URL
                $url = asset($request->folder . '/' . $fileName);
                if ($request->folder == 'uploads') {
                    $url = asset('uploads/' . $fileName);
                }

                return response()->json([
                    'success' => true, 
                    'path' => $fileName, 
                    'url' => $url,
                    'message' => ucfirst($request->type) . ' form uploaded successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false, 
                    'path' => '', 
                    'url' => '',
                    'message' => 'File upload failed'
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
    }

    public function getFormData(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'type'    => 'required|in:tfn,superannuation,onboarding',
        ]);

        $userId = $request->user_id;
        $type   = $request->type;

        $record = match($type) {
            'tfn'           => TfnDeclaration::where('user_id', $userId)->first(),
            'superannuation'=> Superannuation::where('user_id', $userId)->first(),
            'onboarding'    => Onboarding::where('user_id', $userId)->first(),
        };

        if (!$record) {
            return response()->json([
                'message' => 'No record found for this user and type.',
                'data'    => null,
                'success' => false
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Success.',
            'type'    => $type,
            'data'    => $record
        ], 200);
    }
    
    function documentsOnlineVerification(Request $request)
    {
        if ($request->has('guard_id')) {
            $guard = DB::table('users')->where('id', $request->guard_id)->select('state', 'name')->first();
            if ($guard->state == 'Queensland') {
                return $this->check_queensland_license($request, $guard->name);
            } else {
                return $this->check_victoria_license($request);
            }
        } else {
            return $this->check_victoria_license($request);
        }
    }
    
    function check_victoria_license($request)
    {
        $url = "https://www.lars.police.vic.gov.au/LARS/LARS.asp?File=/Components/Screens/PSINFP03/PSINFP03.asp?Process=SEARCH";
        // $input_xml = "<XML><HEADER><PROCESS>SEARCH</PROCESS><TIMESTAMP>20211020043340</TIMESTAMP><SECURITYTOKEN>02A42A1B-588D-4EE8-8760-2A81E6221A9A</SECURITYTOKEN></HEADER><PAYLOAD><GNDTLE01 id='idSearchPane'><CONTROL name='dropdownlist'>%</CONTROL><CONTROL name='searchtext'></CONTROL><CONTROL name='SearchCriteriadropdownlist'>X</CONTROL><CONTROL name='SearchAuthNb'>" . $request->license_number . "</CONTROL><CONTROL name='Index'></CONTROL><CONTROL name='Page'>1</CONTROL></GNDTLE01></PAYLOAD></XML>";
        
        $input_xml = "<XML><HEADER><PROCESS>SEARCH</PROCESS><TIMESTAMP>20260612123337</TIMESTAMP><SECURITYTOKEN>5EBA2312-7715-44DD-9449-82B571E499AC</SECURITYTOKEN></HEADER><PAYLOAD><GNDTLE01 id='idSearchPane'><CONTROL name='dropdownlist'>%</CONTROL><CONTROL name='searchtext'></CONTROL><CONTROL name='SearchCriteriadropdownlist'>X</CONTROL><CONTROL name='SearchAuthNb'>Z1942240S</CONTROL><CONTROL name='Index'></CONTROL><CONTROL name='Page'>1</CONTROL></GNDTLE01></PAYLOAD></XML>";            // new here
        $headers = array(
            "Content-type: text/xml",
            "Content-length: " . strlen($input_xml),
            "Connection: close",
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $input_xml);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $data = curl_exec($ch);
        curl_close($ch);
        
        if (strpos($data, 'No Results Found')) {
            return response()->json(['success' => false, 'message' => 'Sorry! Your license is not valid according to LRD Victoria Database. 1']);
        } else {
            return [$data];
            $data = explode('ALT="Spacer"/></td></tr><tr valign=\'top\' RecordKey=\'', $data);
            if (isset($data[1])) {
                $data = explode('bgcolor=\'white\' row=\'1\'  onmouseover="PSINFE04_fMouseOver(this);"  onmouseout="PSINFE04_fMouseOut(this);"  ondblclick="fDetails();"  onclick="PSINFE04_fMouseClick(this);">', $data[1]);

                $data = str_replace('</tr><tr style=\'font-size:4px\'><td align=\'right\' bgcolor=\'#BDC3D6\' colspan=\'6\'>&nbsp;</td></tr></table>
                    </td></tr><tr style=\'font-size:4px\'><td align=\'right\' bgcolor=\'#BDC3D6\' colspan=\'6\'>&nbsp;</td></tr></table>
                    </td></tr><tr style=\'font-size:4px\'><td align=\'right\' bgcolor=\'#BDC3D6\' colspan=\'6\'>&nbsp;</td></tr></table>', '', $data[1]);
                $data = str_replace('</tr></table>', '', $data);
                $data = str_replace('</td>', '', $data);
                $data = str_replace('&nbsp;', '', $data);
                $data = explode('<td>', $data);
                if (isset($data[4])) {
                    return response()->json(['success' => true, 'message' => 'Congrats! Your License is valid and verified from the LRD Victoria Database.', 'expiry' => $data[4]]);
                } else {
                    return response()->json(['success' => false, 'message' => 'Sorry! Your license is not valid according to LRD Victoria Database. 2']);
                }
            } else {
                return response()->json(['success' => false, 'message' => 'Sorry! Your license is not valid according to LRD Victoria Database. 3']);
            }
        }
    }

    function check_queensland_license($request, $name)
    {
        $url = "https://ftlr.fairtrading.qld.gov.au/home/search?LicenceNumber=" . $request->license_number . "&GivenName=&LastName=&CompanyName=&MasterType=";
            // new here
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

        $result = curl_exec($ch);
        curl_close($ch);
        $result = json_decode($result, true);
        if (count($result) > 0) {
            if ($result[0]['licenceNumber'] == $request->license_number) {
                $expiry = date('d/m/Y', strtotime($result[0]['expiryDateStr']));
                return response()->json(['success' => true, 'message' => 'Congrats! Your License is valid and verified from the LRD Queensland Database.', 'expiry' => $expiry]);
            } else {
                return response()->json(['success' => false, 'message' => 'Sorry! Your license is not valid according to LRD Queensland Database.', 'name' => strtolower($name)]);
            }
        } else {
            return response()->json(['success' => false, 'message' => 'Sorry! Your license is not valid according to LRD Queensland Database.']);
        }
    }

    public function updatePolicyAccepted($userId)
    {
        try {
            $staff = Staff::where('user_id', $userId)->first();
            
            if (!$staff) {
                return response()->json(['success' => false, 'message' => 'Staff not found for this user_id']);
            }
            
            $staff->is_policy_accepted = 1;
            $staff->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Staff status updated successfully',
                'data' => $staff
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update staff status',
                'error' => $e->getMessage()
            ]);
        }
    }
    
    public function updateCurrentCoordinates(Request $request, $userId)
    {
        try {
            $user = User::find($userId);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ]);
            }
    
            $user->current_coordinates = $request->current_coordinates;
            $user->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Coordinates updated successfully',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update coordinates',
                'error' => $e->getMessage()
            ]);
        }
    }
}
