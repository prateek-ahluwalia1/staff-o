<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\GetAllGuardDocuments;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AdminStaffController extends Controller
{

     /**
     * Display a listing of customers
     */
    public function index(Request $request)
    {
        $query = User::where('user_type', 'staff')
            ->with('staff');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', 1);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', 0);
            }
        }

        // Filter by city/state/country
        if ($request->has('city')) {
            $query->where('city', $request->city);
        }
        
        if ($request->has('state')) {
            $query->where('state', $request->state);
        }
        
        if ($request->has('country')) {
            $query->where('country', $request->country);
        }

        // Pagination
        $staff = $query->orderBy('id', 'desc')->paginate($request->get('per_page', $request->limit));

        return response()->json([
            'success' => true,
            'data' => $staff,
            'message' => 'Staff retrieved successfully'
        ]);
    }

     public function staffooStaff(Request $request)
    {
        $query = User::where('user_type', 'staff')->where('user_id', 1)
            ->with('staff');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', 1);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', 0);
            }
        }

        // Filter by city/state/country
        if ($request->has('city')) {
            $query->where('city', $request->city);
        }
        
        if ($request->has('state')) {
            $query->where('state', $request->state);
        }
        
        if ($request->has('country')) {
            $query->where('country', $request->country);
        }

        // Pagination
        $staff = $query->orderBy('id', 'desc')->paginate($request->get('per_page', $request->limit));

        return response()->json([
            'success' => true,
            'data' => $staff,
            'message' => 'Staffoo Staff retrieved successfully'
        ]);
    }


    public function createStaff(Request $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => 'staff',
            'user_id' => $request->user_id,
            'address' => $request->address ?? null,
            'city' => $request->city ?? null,
            'state' => $request->state ?? null,
            'country' => $request->state ?? null,
            'coordinates' => $request->coordinates ?? null,
            'is_email_approved' => 1,
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
            'phone' => $request->phone,
            'staff_document_type' => $request->staff_document_type
        ]);
        
        $old_data = Staff::where('user_id', $user->id)->first();

        $capitalUser = User::where('id', $request->user_id)
            ->where('name', 'Capital Security')
            ->first();
        if($capitalUser && $capitalUser->name == "Capital Security")
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
        }else{
            $document_categories = DocumentCategory::where('document_category', '==', 'contractor_staff')->first();

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
        $user = User::find($userId);
        
        $userData = [];
        
        if ($request->has('name')) {
            $userData['name'] = $request->name;
        }
        
        if ($request->has('email')) {
            $userData['email'] = $request->email;
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

        if ($request->has('gender')) {
            $staff->staff_document_type = $request->staff_document_type;
        }

        if ($request->has('phone')) {
            $staff->phone = $request->phone;

        }

        $staff->save();

        $old_data = Staff::where('user_id', $user->id)->first();
        

        $capitalUser = User::where('id', $request->user_id)
            ->where('name', 'Capital Security')
            ->first();
            
        if ($capitalUser && $capitalUser->name == "Capital Security")
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
            $image = fileUpload($request->upload, '/'.$request->folder.'/');     
        }else{
            $image = fileUpload($request->file, '/'.$request->folder.'/');
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

    public function updateGuardDocuments(Request $request)
    {

        $updateDocuments = Document::where('id', $request->id)->first();
        $old_data = $updateDocuments;
        $updateDocuments->document_name = $request->document_name;
        $updateDocuments->user_id = $request->user_id;
        if(!empty($request->document_expiry) && $request->document_expiry == 'current, pending renewal')
        {
        $updateDocuments->document_expiry = $request->document_expiry;
        }else{
        $updateDocuments->document_expiry = !empty($request->document_expiry) ? dbFormate($request->document_expiry) : '' ;
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

     /**
     * Remove the specified customer
     */
    public function destroy($id)
    {
        $user = User::where('user_type', 'staff')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Staff not found'
            ], 404);
        }

        // Soft delete (if using SoftDeletes trait)
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Staff deleted successfully'
        ]);
    }
}
