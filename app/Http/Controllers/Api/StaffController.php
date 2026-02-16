<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\GetAllGuardDocuments;
use App\Models\Customer;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Validator;

class StaffController extends Controller
{
   
    public function createStaff(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email', // Check in users table
            'phone' => 'nullable|string',
            'password' => 'required|min:6|confirmed', // Added confirmed for password confirmation
            'address' => 'nullable|string',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gender' => 'nullable|in:male,female,other',
            'city' => 'nullable|string',
            // 'user_id' is not needed as we'll get it from the authenticated user or set automatically
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
            'is_active' => 0,
        ]);

        $profileImagePath = null;
        if ($request->hasFile('profile_image')) {
            $profileImagePath = $request->file('profile_image')->store('staff-profiles', 'public');
        }

        $staff = Staff::create([
            'user_id' => $user->id,
            'address' => $request->address,
            'profile_image' => $profileImagePath ?? $request->profile_image,
            'gender' => $request->gender,
            'city' => $request->city,
        ]);
        $old_data = Staff::where('user_id', $user->id)->first();

        $capitalUser = User::where('id', $request->user_id)
            ->where('name', 'Capital Security')
            ->firstOrFail();
        if($capitalUser->name == "Capital Security")
        {
            $check_old_data_exist = Document::where('user_id', $user->id)->where('document_category', '!=', 'other-doc')->first();
            if((!isset($old_data)) || (isset($old_data->staff_document_type) && !$check_old_data_exist)){
                $document_categories = DocumentCategory::where('document_category', $request->staff_document_type)->first();
                if($document_categories){
                    foreach (json_decode($document_categories->document_type) as $key => $value) {  
                        $guard_documents = new Document();
                        $guard_documents->user_id = $user->id;
                        $guard_documents->document_category = ($document_categories->document_category != '' ? $document_categories->document_category : 'other');
                        $guard_documents->document_type = $key;
                        $guard_documents->document_name = $value;
                        $guard_documents->save();
                    }
                }
            }else{
                if($old_data->staff_document_type != $request->staff_document_type){
                    if($request->has('staff_document_type') && !empty($request->staff_document_type)){
                        $document_categories = DocumentCategory::where('document_category', $request->staff_document_type)->first();
                        
                        if($document_categories){
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
                            
                            if(!empty($common_types)) {
                                $common_doc_ids = [];
                                foreach($common_types as $doc_type) {
                                    if($old_docs->has($doc_type)) {
                                        $common_doc_ids[] = $old_docs[$doc_type]->id;
                                    }
                                }
                                
                                Document::whereIn('id', $common_doc_ids)
                                            ->update(['document_category' => $new_document_category]);
                                
                            }
                            
                            if(!empty($to_delete_types)) {
                                $docs_to_delete = $old_docs->whereIn('document_type', $to_delete_types);
                                
                                foreach($docs_to_delete as $doc) {
                                    $doc_id = $doc->id;
                                    $doc->delete();
                                }
                            }
                            
                            if(!empty($to_add_types)) {
                                $documents_to_insert = [];
                                
                                foreach($to_add_types as $doc_type) {
                                    if(!Document::where(['user_id' => $user->id, 'document_type' => $doc_type])->exists()) {
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
                                
                                if(!empty($documents_to_insert)) {
                                    Document::insert($documents_to_insert);
                                    
                                    foreach($documents_to_insert as $new_doc) {
                                        $saved_doc = Document::where([
                                            'user_id' => $new_doc['user_id'],
                                            'document_type' => $new_doc['document_type']
                                        ])->first();
                                        
                                    }
                                }
                            }
                            
                            if(!empty($to_delete_types)) {
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
            'address' => 'nullable|string',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gender' => 'nullable|in:male,female,other',
            'city' => 'nullable|string',
            'is_active' => 'nullable|in:0,1',
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

        if ($request->has('address')) {
            $staff->address = $request->address;
        }
        
        if ($request->has('gender')) {
            $staff->gender = $request->gender;
        }
        
        if ($request->has('city')) {
            $staff->city = $request->city;
        }

        $staff->save();

        $old_data = Staff::where('user_id', $user->id)->first();

        $capitalUser = User::where('id', $request->user_id)
            ->where('name', 'Capital Security')
            ->firstOrFail();
        if($capitalUser->name == "Capital Security")
        {
            $check_old_data_exist = Document::where('user_id', $user->id)->where('document_category', '!=', 'other-doc')->first();
            if((!isset($old_data)) || (isset($old_data->staff_document_type) && !$check_old_data_exist)){
                $document_categories = DocumentCategory::where('document_category', $request->staff_document_type)->first();
                if($document_categories){
                    foreach (json_decode($document_categories->document_type) as $key => $value) {  
                        $guard_documents = new Document();
                        $guard_documents->user_id = $user->id;
                        $guard_documents->document_category = ($document_categories->document_category != '' ? $document_categories->document_category : 'other');
                        $guard_documents->document_type = $key;
                        $guard_documents->document_name = $value;
                        $guard_documents->save();
                    }
                }
            }else{
                if($old_data->staff_document_type != $request->staff_document_type){
                    if($request->has('staff_document_type') && !empty($request->staff_document_type)){
                        $document_categories = DocumentCategory::where('document_category', $request->staff_document_type)->first();
                        
                        if($document_categories){
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
                            
                            if(!empty($common_types)) {
                                $common_doc_ids = [];
                                foreach($common_types as $doc_type) {
                                    if($old_docs->has($doc_type)) {
                                        $common_doc_ids[] = $old_docs[$doc_type]->id;
                                    }
                                }
                                
                                Document::whereIn('id', $common_doc_ids)
                                            ->update(['document_category' => $new_document_category]);
                                
                            }
                            
                            if(!empty($to_delete_types)) {
                                $docs_to_delete = $old_docs->whereIn('document_type', $to_delete_types);
                                
                                foreach($docs_to_delete as $doc) {
                                    $doc_id = $doc->id;
                                    $doc->delete();
                                }
                            }
                            
                            if(!empty($to_add_types)) {
                                $documents_to_insert = [];
                                
                                foreach($to_add_types as $doc_type) {
                                    if(!Document::where(['user_id' => $user->id, 'document_type' => $doc_type])->exists()) {
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
                                
                                if(!empty($documents_to_insert)) {
                                    Document::insert($documents_to_insert);
                                    
                                    foreach($documents_to_insert as $new_doc) {
                                        $saved_doc = Document::where([
                                            'user_id' => $new_doc['user_id'],
                                            'document_type' => $new_doc['document_type']
                                        ])->first();
                                        
                                    }
                                }
                            }
                            
                            if(!empty($to_delete_types)) {
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
       return response()->json([ 'success' => true, 'data' => $grd , 'code' => 200 ]);
    }

    public function uploadFile(Request $request)
    {
        if ($request->folder == '') {
            $request->folder = 'uploads';
        }
        if ($request->has('upload')) {
            $image = \fileUpload($request->upload, '/'.$request->folder.'/');     
        }else{
            $image = \fileUpload($request->file, '/'.$request->folder.'/');
        }
             if ($image != '') {
                $url = asset('').$request->folder.'/'. $image;
                if ($request->folder == '') {
                $url = asset('uploads').'/'.$image;
                }
                return response()->json(array('success' => true, 'path' => $image, 'url' => $url));
             } else {
                return response()->json(array('success' => false, 'path' => '', 'url' => ''));
         }
    }

    public function addGuardDocuments(Request $request)
    {
        $staff_details = Staff::where('user_id', $request->id)->first();
        if($staff_details && $staff_details->staff_document_type){
            
            if(Document::where(['user_id'=> $request->id, 'document_type'=> $request->document_type])->first()){
                if($request->document_type != 'other'){
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

            if($request->has('file')){
                $addDocuments->file = $request->file; 
            }
            $addDocuments->save();
            return response()->json(['message' => "Staff Documents Add Successfully!",'code' => 200, 'success' => true]);
        }else{
            return response()->json(['message' => "Staff Residencial status not updated!", 'success' => false], 404);
        }
    }

    public function updateGuardDocuments(Request $request)
    {

        $updateDocuments = Document::where('id', $request->id)->first();
        $old_data = $updateDocuments;
        $updateDocuments->document_name = $request->document_name;
        $updateDocuments->user_id = $request->user_id;
        if(!empty($request->document_expire) && $request->document_expire == 'current, pending renewal')
        {
        $updateDocuments->document_expire = $request->document_expire;
        }else{
        $updateDocuments->document_expire = !empty($request->document_expire) ? dbFormate($request->document_expire) : '' ;
        }
        $updateDocuments->document_no = (!empty($request->document_no) && $request->has('document_no') ? $request->document_no : '');
        $updateDocuments->document_type = (!empty($request->document_type) && $request->has('document_type') ? $request->document_type : '');

        if($request->has('file')){
            $updateDocuments->file = $request->file; 
            $updateDocuments->file = str_replace(url('')."/"."staff_documents/","",$request->file);
        }
        $updateDocuments->save();
        
        return response()->json(['message' => "Staff Documents Updated Successfully!",'code' => 200, 'success' => true]);
    }

    public function editUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->user_type === 'customer') {
            $user->load(['customer', 'documents']);
        } elseif ($user->user_type === 'contractor') {
            $user->load('contractor');
        } elseif ($user->user_type === 'staff') {
            $user->load('staff', 'documents');
        }

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
            ];

            if ($user->user_type === 'customer') {

                $rules = array_merge($rules, [
                    'phone' => 'nullable|string',
                    'company_name' => 'nullable|string',
                    'address' => 'nullable|string',
                    'city' => 'nullable|string',
                    'country' => 'nullable|string',
                ]);
            }

            if ($user->user_type === 'contractor') {

                $rules = array_merge($rules, [
                    'company_name' => 'sometimes|required|string|max:255',
                    'registration_number' => 'nullable|string|max:255',
                    'phone' => 'nullable|string|max:20',
                    'address' => 'nullable|string|max:500',
                ]);
            }

            if ($user->user_type === 'staff') {

                $rules = array_merge($rules, [
                    'address' => 'sometimes|nullable|string',
                    'profile_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                    'gender' => 'sometimes|nullable|in:male,female,other',
                    'city' => 'sometimes|nullable|string',
                    'phone' => 'sometimes|nullable|string',
                    'staff_document_type' => 'sometimes|nullable|string',
                ]);
            }

            $data = $request->validate($rules);

            if (isset($data['password'])) {
                $data['password'] = \Hash::make($data['password']);
            }

            $user->update(collect($data)->only([
                'name',
                'email',
                'password',
                'is_active'
            ])->toArray());

            if ($user->user_type === 'customer') {

                $profileData = collect($data)->only([
                    'phone',
                    'company_name',
                    'address',
                    'city',
                    'country'
                ])->toArray();

                if ($user->customer) {
                    $user->customer->update($profileData);
                } else {
                    $profileData['user_id'] = $user->id;
                    Customer::create($profileData);
                }

                $user->load(['customer', 'documents']);
            }

            if ($user->user_type === 'contractor') {

                $profileData = collect($data)->only([
                    'company_name',
                    'registration_number',
                    'phone',
                    'address'
                ])->toArray();

                if ($user->contractor) {
                    $user->contractor->update($profileData);
                } else {
                    $profileData['user_id'] = $user->id;
                    Contractor::create($profileData);
                }

                $user->load('contractor');
            }

            if ($user->user_type === 'staff') {

                $staffData = collect($data)->only([
                    'address',
                    'gender',
                    'city',
                    'phone',
                    'staff_document_type'
                ])->toArray();

                if ($request->hasFile('profile_image')) {
                    $staffData['profile_image'] = $request->file('profile_image')->store('staff-profiles', 'public');
                } elseif (array_key_exists('profile_image', $data)) {
                    $staffData['profile_image'] = $data['profile_image'];
                }

                if ($user->staff) {
                    $user->staff->update($staffData);
                } else {
                    $staffData['user_id'] = $user->id;
                    Staff::create($staffData);
                }
            }

            if ($user->user_type === 'staff' && !empty($data['staff_document_type'])) {
                $document_categories = DocumentCategory::where('document_category', $data['staff_document_type'])->first();

                if ($document_categories && is_array(json_decode($document_categories->document_type, true))) {
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

            if ($user->user_type === 'staff') {
                $user->load(['staff', 'documents']);
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
    
}
