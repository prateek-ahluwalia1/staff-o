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

    $baseFields = ['name', 'email', 'user_type'];
    
    // Staff specific fields
    $staffFields = ['tfn_form', 'super_form', 'onboarding_form'];
    
    // Contractor specific fields
    $contractorFields = ['company_name', 'abn', 'phone', 'address'];
    
    $allBaseFields = $baseFields;
    
    if ($user->user_type === 'staff' && $user->user_id == 1) {
        $allBaseFields = array_merge($baseFields, $staffFields);
    } elseif ($user->user_type === 'contractor') {
        $allBaseFields = array_merge($baseFields, $contractorFields);
    }
    
    // Calculate base score
    $filledBase = 0;
    foreach ($allBaseFields as $field) {
        if (in_array($field, ['tfn_form', 'super_form', 'onboarding_form'])) {
            if ($user->staff && !empty($user->staff->{$field})) {
                $filledBase++;
            }
        } elseif (in_array($field, ['company_name', 'abn', 'phone', 'address'])) {
            if ($user->contractor && !empty($user->contractor->{$field})) {
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
    $totalDocuments = $documents->count();

    if ($user->user_type === 'staff') {
        if ($user->user_id == 1) {
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
            $newStatus = ($baseScore >= $baseWeight && $totalDocPoints >= 100) ? 1 : 0;

            $this->updateUserStatus($user, $newStatus);
            
        } else {
            // Regular staff with security license and first aid
            $securityLicenseDoc = $documents->firstWhere('document_type', 'security_license');
            $firstAidDoc = $documents->firstWhere('document_type', 'first_aid');
            
            $hasValidSecurityLicense = $this->isDocumentValid($securityLicenseDoc);
            $hasValidFirstAid = $this->isDocumentValid($firstAidDoc);
            
            // Calculate document score
            if ($totalDocuments > 0) {
                $filledDocuments = $documents->filter(function ($doc) {
                    return $this->isDocumentValid($doc);
                })->count();
                
                $documentScore = ($filledDocuments / $totalDocuments) * $documentWeight;
            }
            
            $newStatus = ($baseScore >= $baseWeight && 
                          $hasValidSecurityLicense && 
                          $hasValidFirstAid) ? 1 : 0;

            $this->updateUserStatus($user, $newStatus);
        }
    } elseif ($user->user_type === 'contractor') {
        // Contractor specific document requirements
        // Check for labour hire document if in specific states
        $hasLabourHire = true;
        if (in_array(strtolower($user->state), ['victoria', 'queensland'])) {
            $labourHireDoc = $documents->firstWhere('document_type', 'labour_hire');
            $hasLabourHire = $labourHireDoc && $this->isDocumentValid($labourHireDoc);
        }

        // Calculate document score
        if ($totalDocuments > 0) {
            $filledDocuments = $documents->filter(function ($doc) {
                return $this->isDocumentValid($doc);
            })->count();

            $documentScore = ($filledDocuments / $totalDocuments) * $documentWeight;
            
            // If labour hire is required but not present or invalid, reduce score
            if (in_array(strtolower($user->state), ['victoria', 'queensland'])) {
                $labourHireDoc = $documents->firstWhere('document_type', 'labour_hire');
                if (!$labourHireDoc || !$this->isDocumentValid($labourHireDoc)) {
                    $documentScore = $documentScore * 0.5;
                }
            }
        }

        // Contractor activation requires:
        // 1. Complete base profile
        // 2. At least one valid document
        // 3. Labour hire document if in VIC or QLD
        $newStatus = ($baseScore >= $baseWeight && 
                      $totalDocuments > 0 && 
                      $documentScore > 0 &&
                      $hasLabourHire) ? 1 : 0;

        $this->updateUserStatus($user, $newStatus);
        
    } else {
        // For other user types (if any)
        if ($totalDocuments > 0) {
            $filledDocuments = $documents->filter(function ($doc) {
                return $this->isDocumentValid($doc);
            })->count();

            $documentScore = ($filledDocuments / $totalDocuments) * $documentWeight;
        }

        $newStatus = ($baseScore >= $baseWeight && $totalDocuments > 0) ? 1 : 0;
        $this->updateUserStatus($user, $newStatus);
    }

    // Final percentage
    if (in_array($user->user_type, ['contractor', 'staff'])) {
        $percentage = (int) round($baseScore + $documentScore);
    } else {
        $percentage = (int) round($baseScore + 50);
    }

    return min($percentage, 100);
}

// Helper function to update user status and send notification
private function updateUserStatus(User $user, int $newStatus): void
{
    $oldStatus = $user->is_active;
    
    if ($user->is_active !== $newStatus) {
        $user->is_active = $newStatus;
        $user->save();

        if ($newStatus === 1 && $oldStatus != 1) {
            $this->sendActivationNotification($user);
        }
    }
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

    // If no expiry date, consider it valid if it has document number and file
    return true;
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

// Optional: Create a separate method to manually activate a specific contractor
public function activateContractor($id)
{
    $contractor = User::where('user_type', 'contractor')
        ->with('contractor', 'documents')
        ->find($id);
    
    if (!$contractor) {
        return response()->json([
            'success' => false,
            'message' => 'Contractor not found'
        ], 404);
    }

    $this->calculateProfileCompletion($contractor);
    
    return response()->json([
        'success' => true,
        'data' => $contractor,
        'message' => 'Contractor activation status updated'
    ]);
}

// Optional: Bulk activate/update all contractors
public function updateAllContractorsStatus()
{
    $contractors = User::where('user_type', 'contractor')
        ->with('contractor', 'documents')
        ->get();
    
    $updated = 0;
    $activated = 0;
    
    foreach ($contractors as $contractor) {
        $oldStatus = $contractor->is_active;
        $this->calculateProfileCompletion($contractor);
        
        if ($contractor->is_active !== $oldStatus) {
            $updated++;
            if ($contractor->is_active == 1) {
                $activated++;
            }
        }
    }
    
    return response()->json([
        'success' => true,
        'message' => "Updated $updated contractors, $activated activated",
        'data' => [
            'total_updated' => $updated,
            'total_activated' => $activated
        ]
    ]);
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
        $this->createDocumentEntries($user);

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