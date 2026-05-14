<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Customer;
use App\Models\Document;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers
     */
    public function index(Request $request)
    {
        $query = User::where('user_type', 'customer')
            ->with('customer');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('company_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
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

        // Pagination
        $customers = $query->orderBy('id', 'desc')->paginate($request->get('per_page', $request->limit));

        return response()->json([
            'success' => true,
            'data' => $customers,
            'message' => 'Customers retrieved successfully'
        ]);
    }

    /**
     * Store a newly created customer
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'coordinates' => 'nullable|string',
            
            // Optional: Set active status
            'is_active' => 'nullable|boolean',
            
            // Optional: Upload documents with customer creation
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
            'user_type' => 'customer',
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

        // Create customer record
        $customer = Customer::create([
            'user_id' => $user->id,
            'phone' => $data['phone'] ?? null,
            'company_name' => $data['company_name'] ?? null,
        ]);

        // Create document entries from categories
        $this->createDocumentEntries($user);

        // Handle document uploads if provided
        if ($request->hasFile('documents')) {
            $this->uploadDocuments($request, $user);
        }

        // Load relationships
        $user->load('customer', 'documents');

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Customer created successfully'
        ], 201);
    }

    /**
     * Display the specified customer
     */
    public function show($id)
    {
        $customer = User::where('user_type', 'customer')
            ->with(['customer', 'documents'])
            ->find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        // Get additional stats for this customer if needed
        $stats = [
            'total_orders' => $customer->orders()->count(), // Assuming orders relationship exists
            'total_spent' => $customer->orders()->sum('total_amount'), // If you have orders table
            'last_order_date' => $customer->orders()->latest()->first()?->created_at,
            'documents_count' => $customer->documents()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'customer' => $customer,
                'stats' => $stats
            ],
            'message' => 'Customer retrieved successfully'
        ]);
    }

    /**
     * Update the specified customer
     */
    public function update(Request $request, $id)
    {
        $user = User::where('user_type', 'customer')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'coordinates' => 'nullable|string',
            'is_active' => 'nullable|boolean',
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

        // Update customer record
        if ($user->customer) {
            $user->customer->update([
                'phone' => $data['phone'] ?? $user->customer->phone,
                'company_name' => $data['company_name'] ?? $user->customer->company_name,
            ]);
        }

        // Load relationships
        $user->load('customer', 'documents');

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Customer updated successfully'
        ]);
    }

    /**
     * Remove the specified customer
     */
    public function destroy($id)
    {
        $user = User::where('user_type', 'customer')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        // Soft delete (if using SoftDeletes trait)
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully'
        ]);
    }

    /**
     * Toggle customer active status
     */
    public function toggleStatus($id)
    {
        $user = User::where('user_type', 'customer')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'activated' : 'deactivated';

        return response()->json([
            'success' => true,
            'data' => ['is_active' => $user->is_active],
            'message' => "Customer {$status} successfully"
        ]);
    }

    /**
     * Export customers to CSV
     */
    public function export(Request $request)
    {
        $query = User::where('user_type', 'customer')
            ->with('customer');

        // Apply filters similar to index method
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', 1);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', 0);
            }
        }

        $customers = $query->get();

        $csvData = [];
        $csvData[] = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Address', 'City', 'State', 'Country', 'Status', 'Created At'];

        foreach ($customers as $customer) {
            $csvData[] = [
                $customer->id,
                $customer->name,
                $customer->email,
                $customer->customer->phone ?? 'N/A',
                $customer->customer->company_name ?? 'N/A',
                $customer->address ?? 'N/A',
                $customer->city ?? 'N/A',
                $customer->state ?? 'N/A',
                $customer->country ?? 'N/A',
                $customer->is_active ? 'Active' : 'Inactive',
                $customer->created_at->format('Y-m-d H:i:s')
            ];
        }

        // Generate CSV file
        $filename = 'customers_export_' . now()->format('Y-m-d_His') . '.csv';
        $handle = fopen('php://temp', 'w+');
        
        foreach ($csvData as $row) {
            fputcsv($handle, $row);
        }
        
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Create document entries from categories
     */
    private function createDocumentEntries($user)
    {
        $document_categories = DocumentCategory::where('document_category', 'customer_document')->first();
        
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

    /**
     * Upload documents
     */
    private function uploadDocuments(Request $request, $user)
    {
        foreach ($request->file('documents') as $index => $documentFile) {
            $documentType = $request->input("documents.{$index}.document_type");
            
            // Store the file
            $path = $documentFile->store('customer-documents/' . $user->id, 'public');
            
            // Update or create document record
            Document::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'document_type' => $documentType,
                ],
                [
                    'document_category' => 'customer_document',
                    'document_name' => $documentFile->getClientOriginalName(),
                    'file_path' => $path,
                    'uploaded_at' => now(),
                ]
            );
        }
    }

    public function customerDetail($id)
    {
        $customer = \App\Models\User::with([
            'sites.jobRoster', 'customer'
        ])->where('id', $id)
        ->where('user_type', 'customer')
        ->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        //Add total hours per site
        $sites = $customer->sites->map(function ($site) {

            $totalHours = $site->jobRoster->sum('hours');

            return [
                'id' => $site->id,
                'site_name' => $site->site_name ?? null,
                'address' => $site->address ?? null,
                'total_hours' => $totalHours,
                'job_rosters' => $site->jobRosters
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'customer' => $customer,
                'sites' => $sites
            ]
        ]);
    }
}