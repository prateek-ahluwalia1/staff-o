<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Resources\GetAllGuardDocuments;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Questionnaire;
use App\Models\Staff;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AdminStaffController extends Controller
{

     /**
     * Display a listing of customers
     */
    // public function index(Request $request)
    // {
    //     $query = User::where('user_type', 'staff')
    //         ->with('staff', 'documents');

    //     // Search functionality
    //     if ($request->has('search')) {
    //         $search = $request->search;
    //         $query->where(function($q) use ($search) {
    //             $q->where('name', 'like', "%{$search}%")
    //               ->orWhere('email', 'like', "%{$search}%");
    //         });
    //     }

    //     // Filter by status
    //     if ($request->has('status')) {
    //         if ($request->status === 'active') {
    //             $query->where('is_active', 1);
    //         } elseif ($request->status === 'inactive') {
    //             $query->where('is_active', 0);
    //         }
    //     }

    //     // Filter by city/state/country
    //     if ($request->has('city')) {
    //         $query->where('city', $request->city);
    //     }
        
    //     if ($request->has('state')) {
    //         $query->where('state', $request->state);
    //     }
        
    //     if ($request->has('country')) {
    //         $query->where('country', $request->country);
    //     }

    //     // Pagination
    //     $staff = $query->orderBy('id', 'desc')->paginate($request->get('per_page', $request->limit));



    //     return response()->json([
    //         'success' => true,
    //         'data' => $staff,
    //         'message' => 'Staff retrieved successfully'
    //     ]);
    // }
    public function index(Request $request)
{
    $query = User::where('user_type', 'staff')
        ->with('staff', 'documents');

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

    // Get all staff before pagination to check their status
    $staffList = $query->get();
    
    // Calculate profile completion and update status for each staff member
    foreach ($staffList as $staff) {
        $this->calculateProfileCompletion($staff);
    }

    // Re-query with pagination after status updates
    $staff = $query->orderBy('id', 'desc')->paginate($request->get('per_page', $request->limit));

    return response()->json([
        'success' => true,
        'data' => $staff,
        'message' => 'Staff retrieved successfully'
    ]);
}

// Updated calculateProfileCompletion function
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
    
    // Calculate base score
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
    $documents = $user->documents ?? collect();
    $documentScore = 0;

    if ($user->user_type === 'staff') {
        if($user->user_id == 1) {
            // Admin staff with full document requirements
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
                    $this->sendActivationNotification($user);
                }
            }
        } else {
            // Regular staff with security license and first aid
            $securityLicenseDoc = $documents->firstWhere('document_type', 'security_license');
            $firstAidDoc = $documents->firstWhere('document_type', 'first_aid');
            
            // Check if documents are valid (have future expiry dates)
            $hasValidSecurityLicense = $this->isDocumentValid($securityLicenseDoc);
            $hasValidFirstAid = $this->isDocumentValid($firstAidDoc);
            
            // Calculate document score based on all documents
            $totalDocuments = $documents->count();
            if ($totalDocuments > 0) {
                $filledDocuments = $documents->filter(function ($doc) {
                    return $this->isDocumentValid($doc);
                })->count();
                
                $documentScore = ($filledDocuments / $totalDocuments) * $documentWeight;
            }
            
            $oldStatus = $user->is_active;
            // For regular staff: needs base score complete AND both security license AND first aid valid
            $newStatus = ($baseScore >= $baseWeight && 
                          $hasValidSecurityLicense && 
                          $hasValidFirstAid) ? 1 : 0;

            if ($user->is_active !== $newStatus) {
                $user->is_active = $newStatus;
                $user->save();
                
                if ($newStatus === 1 && $oldStatus != 1) {
                    $this->sendActivationNotification($user);
                }
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

// Helper function to check if a document is valid
private function isDocumentValid($document): bool
{
    if (!$document) {
        return false;
    }

    // Check if document number exists
    if (empty($document->document_no)) {
        return false;
    }

    // Check if file exists
    if (empty($document->file)) {
        return false;
    }

    // Check expiry date
    if (!empty($document->document_expiry)) {
        if ($document->document_expiry === 'current, pending renewal') {
            return true;
        }
        $expiryDate = \Carbon\Carbon::parse($document->document_expiry);
        return $expiryDate->isFuture();
    }

    return false;
}

// Helper function to send activation notification
private function sendActivationNotification(User $user): void
{
    if (empty($user->notification_token)) {
        return;
    }

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

// Optional: Create a separate method to manually activate a specific staff member
public function activateStaff($id)
{
    $staff = User::where('user_type', 'staff')
        ->with('staff', 'documents')
        ->find($id);
    
    if (!$staff) {
        return response()->json([
            'success' => false,
            'message' => 'Staff member not found'
        ], 404);
    }

    $this->calculateProfileCompletion($staff);
    
    return response()->json([
        'success' => true,
        'data' => $staff,
        'message' => 'Staff activation status updated'
    ]);
}

    public function staffooStaff(Request $request)
    {
        $query = User::where('user_type', 'staff')->where('is_active', 1)
        // ->where('user_id', 1)
        ->with('staff');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
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
    try {
        // Validate request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'user_id' => 'required|exists:users,id',
            'phone' => 'required|string|max:20',
            'gender' => 'nullable|string|in:male,female,other',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'coordinates' => 'nullable|string',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'staff_document_type' => 'nullable|string|max:100',
            'security_license_no' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|string',
            'origin_country' => 'nullable|string',
        ]);

        DB::beginTransaction();

        // Create user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'user_type' => 'staff',
            'user_id' => $validated['user_id'],
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'country' => $validated['country'] ?? null,
            'coordinates' => $validated['coordinates'] ?? null,
            'is_active' => 0,
        ]);

        $user->staffo_id = 'STAFO' . $user->id;
        $user->is_email_approved = 1;
        $user->save();
        
        // Handle profile image
        $profileImagePath = null;
        if ($request->hasFile('profile_image')) {
            $profileImagePath = $request->file('profile_image')->store('staff-profiles', 'public');
        }

        // Create staff
        $staff = Staff::create([
            'user_id' => $user->id,
            'profile_image' => $profileImagePath ?? $validated['profile_image'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'phone' => $validated['phone'],
            'staff_document_type' => $validated['staff_document_type'] ?? null,
            'security_license_no' => $validated['security_license_no'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'origin_country' => $validated['origin_country'] ?? null,
        ]);
        
        $old_data = Staff::where('user_id', $user->id)->first();

        $capitalUser = User::where('id', $validated['user_id'])
            ->where('name', 'Capital Security')
            ->first();
            
        if(isset($capitalUser) && $capitalUser->name == "Capital Security")
        {   
            $check_old_data_exist = Document::where('user_id', $user->id)->where('document_category', '!=', 'other-doc')->first();
            if((!isset($old_data)) || (isset($old_data->staff_document_type) && !$check_old_data_exist)){
                $document_categories = DocumentCategory::where('document_category', $validated['staff_document_type'] ?? null)->first();
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
                if($old_data->staff_document_type != ($validated['staff_document_type'] ?? null)){
                    if($request->has('staff_document_type') && !empty($validated['staff_document_type'])){
                        $document_categories = DocumentCategory::where('document_category', $validated['staff_document_type'])->first();
                        
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
            $document_categories = DocumentCategory::where('document_category', 'contractor_staff')->first();

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

        // Create induction records
        $inductions = Questionnaire::all();
        $now = Carbon::now();
        $inductionHistoryData = [];
        $guardQuestionnaireDetailsData = [];

        foreach ($inductions as $induction) {
            $inductionHistoryData[] = [
                'guard_id' => $user->id,
                'induction_id' => $induction->id,
                'state' => "Victoria",
                'read_status' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $guardQuestionnaireDetailsData[] = [
                'guard_id' => $user->id,
                'questionnaire_id' => $induction->id,
                'marks' => 0,
                'certificate_path' => null,
                'expiry_date' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        
        DB::table('induction_history')->insert($inductionHistoryData);
        DB::table('guard_questionnaire_details')->insert($guardQuestionnaireDetailsData);

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Staff registered successfully.',
            'code' => 200,
            'data' => [
                'user' => $user,
                'staff' => $staff
            ]
        ], 200);

    } catch (\Illuminate\Validation\ValidationException $e) {
         $errorMessages = collect($e->errors())
            ->flatMap(function ($messages) {
                return $messages;
            })
            ->implode(' ');
        
        return response()->json([
            'success' => false,
            'message' => $errorMessages ?: 'Validation failed.',
            'code' => 422,
            'errors' => $e->errors() // Keep detailed errors if needed
        ], 422);

    } catch (\Illuminate\Database\QueryException $e) {
        DB::rollBack();
        \Log::error('Database error in createStaff: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString(),
            'request_data' => $request->all()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Database error occurred. Please try again.',
            'code' => 500,
            'error' => config('app.debug') ? $e->getMessage() : null
        ], 500);

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Error in createStaff: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString(),
            'request_data' => $request->all()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'An error occurred while creating staff. Please try again.',
            'code' => 500,
            'error' => config('app.debug') ? $e->getMessage() : null
        ], 500);
    }
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

        if ($request->has('security_license_no')) {
            $staff->security_license_no = $request->security_license_no;

        }
        
        if ($request->has('date_of_birth')) {
            $staff->date_of_birth = $request->date_of_birth;

        }

        if ($request->has('origin_country')) {
            $staff->origin_country = $request->origin_country;

        }
        

        $staff->save();

        $old_data = Staff::where('user_id', $user->id)->first();
        

        $capitalUser = User::where('id', $request->user_id)
            ->where('name', 'Capital Security')
            ->first();
            
        if (isset($capitalUser) && $capitalUser->name == "Capital Security")
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
