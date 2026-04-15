<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\GetAllGuardDocuments;
use App\Models\Customer;
use App\Http\Controllers\Controller;
use App\Models\Contractor;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Validator;
use Twilio\Rest\Client;
use Illuminate\Support\Facades\Mail;

class StaffController extends Controller
{
    private function calculateProfileCompletion(User $user): int
    {
        $baseFields = ['name', 'email', 'user_type'];
        $baseWeight = 50;
        $documentWeight = 50;

        $filledBase = 0;
        foreach ($baseFields as $field) {
            if (!empty($user->{$field})) {
                $filledBase++;
            }
        }
        $baseScore = ($filledBase / count($baseFields)) * $baseWeight;

        $totalDocuments = $user->documents ? $user->documents->count() : 0;
        $filledDocuments = 0;
        if ($totalDocuments > 0) {
            $filledDocuments = $user->documents->filter(function ($doc) {
                return !empty($doc->document_no);
            })->count();
        }

        $documentScore = 0;
        if ($totalDocuments > 0) {
            $documentScore = ($filledDocuments / $totalDocuments) * $documentWeight;
        }
        if($user->user_type == 'contractor'){
        $percentage = (int) round($baseScore + $documentScore);
        }elseif($user->user_type == 'staff' && $user->user_id == 1){
        $percentage = (int) round($baseScore + $documentScore);
        }else{
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
            'staff_document_type' => $request->staff_document_type
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
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
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
            $updateDocuments->document_expiry = !empty($request->document_expiry) ? dbFormate($request->document_expiry) : '';
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

        if ($percentage === 100 && (int) $user->is_active !== 1) {
            $user->is_active = 1;
            $user->save();
        }

        $user->profile_completion_percentage = $percentage;

        return response()->json(['success' => true, 'code' => 200, 'data' => $user]);
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
                    'company_name' => 'nullable|string',
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
                    'profile_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                ]);
            }

            if ($user->user_type === 'staff') {
                $rules = array_merge($rules, [
                    'profile_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                    'gender' => 'sometimes|nullable|in:male,female,other',
                    'phone' => 'sometimes|nullable|string',
                    'staff_document_type' => 'sometimes|nullable|string',
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

                if (!empty($data['staff_document_type']) && $user->user_id = 1) {
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
                                    ->whereNull('file')
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
                    'staff_document_type'  // This will now be saved
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


            if ($user->user_type === 'customer') {

                $customer = $user->customer;

                $newEmail = $request->email ?? $user->email;
                // $newPhone = $request->phone ?? optional($customer)->phone;

                $emailChanged = $newEmail != $user->email;
                // $phoneChanged = $newPhone != optional($customer)->phone;

                if ($emailChanged || $customer->verify_profile == 0) {

                    // If OTP not provided → send OTP
                    if (!$request->email_otp) {

                        $emailOtp = rand(100000, 999999);
                        // $phoneOtp = rand(100000, 999999);

                        if ($customer) {
                            $customer->update([
                                'email_otp' => $emailOtp,
                                // 'phone_otp' => $phoneOtp,
                                'otp_expires_at' => now()->addMinutes(10)
                            ]);
                        }

                        // Send Email OTP
                        if ($emailChanged) {
                            Mail::raw("Your verification OTP is: $emailOtp", function ($message) use ($newEmail) {
                                $message->to($newEmail)
                                    ->subject('Email Verification OTP');
                            });

                            return response()->json([
                                'success' => false,
                                'otp_required' => true,
                                'message' => 'OTP sent to email. Please verify to continue.'
                            ]);
                        }

                        // Send SMS OTP (integrate gateway)
                        // if ($phoneChanged) {
                        //     // SMS::send($newPhone, "Your OTP is: $phoneOtp");
                        // }

                        return response()->json([
                            'success' => true,
                            'otp_required' => false,
                            'message' => 'User Updated Successfully.'
                        ]);
                    }

                    // Verify OTP
                    if (!$customer || $customer->otp_expires_at < now()) {
                        return response()->json([
                            'message' => 'OTP expired'
                        ], 400);
                    }

                    if ($request->email_otp != $customer->email_otp) {

                        return response()->json([
                            'message' => 'Invalid OTP'
                        ], 400);
                    }

                    // OTP verified
                    $customer->update([
                        'email_otp' => null,
                        'phone_otp' => null,
                        'otp_expires_at' => null,
                        'verify_profile' => 1
                    ]);
                }
            }

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
}
