<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Contractor;
use App\Models\Document;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ContractorController extends Controller
{
    /**
     * Display a listing of contractors
     */
    // public function index(Request $request)
    // {
    //     $query = User::where('user_type', 'contractor')->whereNotIn('id', [1])
    //         ->with('contractor','documents');

    //     // Search functionality
    //     if ($request->has('search')) {
    //         $search = $request->search;
    //         $query->where(function($q) use ($search) {
    //             $q->where('name', 'like', "%{$search}%")
    //               ->orWhere('email', 'like', "%{$search}%")
    //               ->orWhereHas('contractor', function($q) use ($search) {
    //                   $q->where('company_name', 'like', "%{$search}%")
    //                     ->orWhere('phone', 'like', "%{$search}%")
    //                     ->orWhere('registration_number', 'like', "%{$search}%");
    //               });
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

    //     // Sorting
    //     $sortField = $request->get('sort_field', 'created_at');
    //     $sortDirection = $request->get('sort_direction', 'desc');
    //     $query->orderBy($sortField, $sortDirection);

    //     // Pagination
    //     $contractors = $query->orderBy('id', 'desc')->paginate($request->get('per_page', $request->limit));

    //     return response()->json([
    //         'success' => true,
    //         'data' => $contractors,
    //         'message' => 'Contractors retrieved successfully'
    //     ]);
    // }
 public function index(Request $request)
{
    $query = User::where('user_type', 'contractor')->whereNotIn('id', [1])
        ->with('contractor', 'documents');

    // Search functionality
    if ($request->has('search')) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhereHas('contractor', function($q) use ($search) {
                  $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('registration_number', 'like', "%{$search}%");
              });
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

    // Sorting
    $sortField = $request->get('sort_field', 'created_at');
    $sortDirection = $request->get('sort_direction', 'desc');
    $query->orderBy($sortField, $sortDirection);

    // Get all contractors before pagination to check their status
    $contractorList = $query->get();
    
    // Calculate profile completion and update status for each contractor
    foreach ($contractorList as $contractor) {
        $this->calculateProfileCompletion($contractor);
    }

    // Re-query with pagination after status updates
    $contractors = $query->orderBy('id', 'desc')->paginate($request->get('per_page', $request->limit));

    return response()->json([
        'success' => true,
        'data' => $contractors,
        'message' => 'Contractors retrieved successfully'
    ]);
}

private function calculateProfileCompletion(User $user): int
{
    $baseWeight = 50;
    $documentWeight = 50;

    // Base fields only
    $baseFields = ['name', 'email', 'user_type'];
    
    // Calculate base score
    $filledBase = 0;
    foreach ($baseFields as $field) {
        if (!empty($user->{$field})) {
            $filledBase++;
        }
    }
    
    $baseScore = ($filledBase / count($baseFields)) * $baseWeight;
    $documents = $user->documents ?? collect();
    $documentScore = 0;
    $totalDocuments = $documents->count();

    // Check for labour hire document if in specific states
    $hasLabourHire = true;
    $labourHireRequired = false;
    
    if (in_array(strtolower($user->state), ['victoria', 'queensland'])) {
        $labourHireRequired = true;
        $labourHireDoc = $documents->firstWhere('document_type', 'labour_hire');
        $hasLabourHire = $labourHireDoc && $this->isDocumentValid($labourHireDoc);
    }

    // Calculate document score
    if ($totalDocuments > 0) {
        $filledDocuments = $documents->filter(function ($doc) {
            return $this->isDocumentValid($doc);
        })->count();

        $documentScore = ($filledDocuments / $totalDocuments) * $documentWeight;
    }

    // Contractor activation logic
    $baseComplete = $baseScore >= $baseWeight;
    $hasValidDocuments = $totalDocuments > 0 && $documentScore > 0;
    $labourHireValid = !$labourHireRequired || ($labourHireRequired && $hasLabourHire);
    
    $newStatus = ($baseComplete && $hasValidDocuments && $labourHireValid) ? 1 : 0;

    $this->updateUserStatus($user, $newStatus);

    // Final percentage
    $percentage = (int) round($baseScore + $documentScore);
    return min($percentage, 100);
}

private function updateUserStatus(User $user, int $newStatus): void
{
    $oldStatus = $user->is_active;
    
    if ($user->is_active !== $newStatus) {
        $user->is_active = $newStatus;
        $user->save();
    }
}

private function isDocumentValid($document): bool
{
    if (!$document) {
        return false;
    }

    if (empty($document->document_no)) {
        return false;
    }

    if (empty($document->file)) {
        return false;
    }

    if (!empty($document->document_expiry)) {
        if ($document->document_expiry === 'current, pending renewal') {
            return true;
        }
        $expiryDate = \Carbon\Carbon::parse($document->document_expiry);
        return $expiryDate->isFuture();
    }

    return true;
}

    /**
     * Store a newly created contractor
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'coordinates' => 'nullable|string',
            'states_allowed' => 'nullable|json',          
            
            // Contractor specific fields
            'company_name' => 'required|string|max:255',
            'registration_number' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            
            // Optional: Set active status
            'is_active' => 'nullable|boolean',
            
            // Optional: Upload documents with contractor creation
            'documents' => 'nullable|array',
            'documents.*.document_type' => 'required_with:documents|string',
            'documents.*.document_file' => 'required_with:documents|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        // Create user
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'user_type' => 'contractor',
            'is_active' => $data['is_active'] ?? 0, // Admin can set active status
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'country' => $data['country'] ?? null,
            'coordinates' => $data['coordinates'] ?? null,
            'phone' => $data['phone'] ?? null,
            'states_allowed' => $data['states_allowed'] ?? null,
            'is_email_approved' => 1,
        ]);

        
        $user->staffo_id = 'STAFO' . $user->id;
        $user->save();

        // Create contractor record
        $contractor = Contractor::create([
            'user_id' => $user->id,
            'company_name' => $data['company_name'],
            'registration_number' => $data['registration_number'] ?? null,
            'phone' => $data['phone'] ?? null,
            'abn' => $request->abn ?? null,
            'acn' => $request->acn ?? null,
        ]);

        // Create document entries from categories
        // $this->createDocumentEntries($user);
        // Handle documents based on allowed states
        $allowedStates = [];
            if (!empty($user->states_allowed)) {
                $allowedStates = json_decode($user->states_allowed, true) ?? [];
            }                
        // State to document category mapping
        $stateDocumentMap = [
            'vic' => 'contractor_document',
            'nsw' => 'nsw_document',
            'qld' => 'qld_document',
            'tas' => 'tas_document',
            'wa' => 'wa_document',
            'sa' => 'sa_document'
        ];

        // Get document categories for allowed states
        $documentCategories = DocumentCategory::whereIn('document_category', array_values($stateDocumentMap))
            ->get()
            ->keyBy('document_category');

        $documentsToKeep = [];

        foreach ($allowedStates as $state) {
            $state = strtolower($state);
            if (isset($stateDocumentMap[$state])) {
                $categoryKey = $stateDocumentMap[$state];
                $category = $documentCategories->get($categoryKey);
                
                if ($category) {
                    $documentTypes = json_decode($category->document_type, true) ?? [];
                    
                    foreach ($documentTypes as $key => $value) {
                        // Check if document already exists
                        $existingDoc = Document::where('user_id', $user->id)
                            ->where('document_category', $categoryKey)
                            ->where('document_type', $key)
                            ->first();
                        
                        if (!$existingDoc) {
                            // Create new document
                            Document::create([
                                'user_id' => $user->id,
                                'document_category' => $categoryKey,
                                'document_type' => $key,
                                'document_name' => $value
                            ]);
                        }
                        
                        // Track document to keep
                        $documentsToKeep[] = $categoryKey . '_' . $key;
                    }
                }
            }
        }

        // Load relationships
        $user->load('contractor', 'documents');

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Contractor created successfully'
        ], 201);
    }

    /**
     * Display the specified contractor
     */
    public function show($id)
    {
        $contractor = User::where('user_type', 'contractor')
            ->with(['contractor', 'documents'])
            ->find($id);

        if (!$contractor) {
            return response()->json([
                'success' => false,
                'message' => 'Contractor not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $contractor,
            'message' => 'Contractor retrieved successfully'
        ]);
    }

    /**
     * Update the specified contractor
     */
    public function update(Request $request, $id)
    {
        $user = User::where('user_type', 'contractor')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Contractor not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'coordinates' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'states_allowed' => 'nullable|array',          
            
            // Contractor specific fields
            'company_name' => 'sometimes|required|string|max:255',
            'registration_number' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        // Update user
        $userData = [
            'name' => $data['name'] ?? $user->name,
            'email' => $data['email'] ?? $user->email,
            'address' => $data['address'] ?? $user->address,
            'city' => $data['city'] ?? $user->city,
            'state' => $data['state'] ?? $user->state,
            'country' => $data['country'] ?? $user->country,
            'coordinates' => $data['coordinates'] ?? $user->coordinates,
            'is_active' => $data['is_active'] ?? $user->is_active,
            'phone' => $data['phone'] ?? $user->phone,
            'states_allowed' => $data['states_allowed'] ?? null,
        ];

        if (isset($data['password'])) {
            $userData['password'] = Hash::make($data['password']);
        }

        $user->update($userData);

        // Update contractor record
        if ($user->contractor) {
            $user->contractor->update([
                'company_name' => $data['company_name'] ?? $user->contractor->company_name,
                'registration_number' => $data['registration_number'] ?? $user->contractor->registration_number,
                'phone' => $data['phone'] ?? $user->contractor->phone,
                'abn' => $request->abn ?? $user->contractor->abn,
                'acn' => $request->acn ?? $user->contractor->acn,

            ]);
        }

        // Handle documents based on allowed states
        $allowedStates = [];
            if (!empty($user->states_allowed)) {
                $allowedStates = json_decode($user->states_allowed, true) ?? [];
            }                
        // State to document category mapping
        $stateDocumentMap = [
            'vic' => 'contractor_document',
            'nsw' => 'nsw_document',
            'qld' => 'qld_document',
            'tas' => 'tas_document',
            'wa' => 'wa_document',
            'sa' => 'sa_document'
        ];

        // Get document categories for allowed states
        $documentCategories = DocumentCategory::whereIn('document_category', array_values($stateDocumentMap))
            ->get()
            ->keyBy('document_category');

        $documentsToKeep = [];

        foreach ($allowedStates as $state) {
            $state = strtolower($state);
            if (isset($stateDocumentMap[$state])) {
                $categoryKey = $stateDocumentMap[$state];
                $category = $documentCategories->get($categoryKey);
                
                if ($category) {
                    $documentTypes = json_decode($category->document_type, true) ?? [];
                    
                    foreach ($documentTypes as $key => $value) {
                        // Check if document already exists
                        $existingDoc = Document::where('user_id', $user->id)
                            ->where('document_category', $categoryKey)
                            ->where('document_type', $key)
                            ->first();
                        
                        if (!$existingDoc) {
                            // Create new document
                            Document::create([
                                'user_id' => $user->id,
                                'document_category' => $categoryKey,
                                'document_type' => $key,
                                'document_name' => $value
                            ]);
                        }
                        
                        // Track document to keep
                        $documentsToKeep[] = $categoryKey . '_' . $key;
                    }
                }
            }
        }

        // Delete documents that are not in allowed states
        $allUserDocuments = Document::where('user_id', $user->id)->get();
        
        foreach ($allUserDocuments as $doc) {
            $docIdentifier = $doc->document_category . '_' . $doc->document_type;
            if (!in_array($docIdentifier, $documentsToKeep)) {
                $doc->delete();
            }
        }
        // Load relationships
        $user->load('contractor', 'documents');

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Contractor updated successfully'
        ]);
    }

    /**
     * Remove the specified contractor
     */
    public function destroy($id)
    {
        $user = User::where('user_type', 'contractor')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Contractor not found'
            ], 404);
        }

        // Soft delete or force delete? 
        // Using soft delete here
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contractor deleted successfully'
        ]);
    }

    /**
     * Toggle contractor active status
     */
    public function toggleStatus($id)
    {
        $user = User::where('user_type', 'contractor')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Contractor not found'
            ], 404);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'success' => true,
            'data' => ['is_active' => $user->is_active],
            'message' => 'Contractor status updated successfully'
        ]);
    }

    /**
     * Create document entries from categories
     */
    private function createDocumentEntries($user)
    {
        $document_categories = DocumentCategory::where('document_category', 'contractor_document')->first();
        
        if ($document_categories && $document_categories->document_type) {
            foreach (json_decode($document_categories->document_type) as $key => $value) {  
                Document::create([
                    'user_id' => $user->id,
                    'document_category' => $document_categories->document_category ?? 'other',
                    'document_type' => $key,
                    'document_name' => $value,
                ]);
            }
        }
    }

     public function activeContractor(Request $request)
    {
        $query = User::where('user_type', 'contractor')->where('is_active', 1)
            ->with('contractor');

        $query->orderBy('created_at', 'desc');


        // Pagination
        $contractors = $query->get();

        return response()->json([
            'success' => true,
            'data' => $contractors,
            'message' => 'Contractors retrieved successfully'
        ]);
    }
}