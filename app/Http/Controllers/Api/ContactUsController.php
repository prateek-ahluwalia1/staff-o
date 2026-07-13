<?php
// app/Http/Controllers/API/ContactUsController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactUsRequest;
use App\Models\ContactUs;
use App\Mail\ContactUsNotification;
use App\Mail\ContactAutoReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class ContactUsController extends Controller
{
     /**
     * Store contact form submission
     *
     * @param ContactUsRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(ContactUsRequest $request)
    {
        try {
            // Validate and prepare data
            $data = $request->validated();
            
            // Set default values if not provided
            $data['source'] = $data['source'] ?? 'website-contact-page';
            $data['submitted_at'] = $data['submitted_at'] ?? now();
            $data['status'] = 'pending';

            // Create contact record
            $contact = ContactUs::create($data);

            // Send email notifications
            $this->sendEmailNotifications($contact);

            return response()->json([
                'success' => true,
                'code' => 201,
                'message' => 'Thank you for contacting us. We have sent a confirmation email to your inbox.',
                'data' => [
                    'id' => $contact->id,
                    'submitted_at' => $contact->submitted_at->toISOString()
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Contact us submission error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'code' => 500,
                'message' => 'Failed to submit your request. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Send email notifications (queued)
     *
     * @param ContactUs $contact
     * @return void
     */
    private function sendEmailNotifications($contact)
    {
        try {
            // Send notification to admin(s)
            $adminEmails = ["admin@staffoo.com.au"];
            
            if (!empty($adminEmails)) {
                foreach ($adminEmails as $email) {
                    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        // Use queue for better performance
                        Mail::to($email)->queue(new ContactUsNotification($contact));
                        Log::info('Admin notification queued for: ' . $email);
                    }
                }
            } else {
                Log::warning('No valid admin emails configured for contact form notifications');
                // Fallback to sending to default from address
                if (config('mail.from.address')) {
                    Mail::to(config('mail.from.address'))->queue(new ContactUsNotification($contact));
                }
            }

            // Send auto-reply to user
            if (filter_var($contact->email, FILTER_VALIDATE_EMAIL)) {
                // Use queue for better performance
                Mail::to($contact->email)->queue(new ContactAutoReply($contact));
                Log::info('Auto-reply queued for: ' . $contact->email);
            }

        } catch (\Exception $e) {
            Log::error('Failed to queue emails: ' . $e->getMessage());
            // Don't throw exception - we don't want to fail the request if emails fail
        }
    }

    /**
     * Get admin emails from configuration
     *
     * @return array
     */
    private function getAdminEmails()
    {
        $adminEmails = config('mail.admin_addresses');
        
        if (is_string($adminEmails)) {
            return array_map('trim', explode(',', $adminEmails));
        }
        
        if (is_array($adminEmails)) {
            return $adminEmails;
        }

        // Default fallback
        return ['admin@' . request()->getHost()];
    }

    /**
     * Get all contact submissions (Admin only)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = ContactUs::query();

            // Filter by status
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            // Filter by inquiry type
            if ($request->has('inquiry_type') && !empty($request->inquiry_type)) {
                $query->where('inquiry_type', $request->inquiry_type);
            }

            // Date range filter
            if ($request->has('from_date') && !empty($request->from_date)) {
                $query->whereDate('created_at', '>=', $request->from_date);
            }
            if ($request->has('to_date') && !empty($request->to_date)) {
                $query->whereDate('created_at', '<=', $request->to_date);
            }

            // Search
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('subject', 'LIKE', "%{$search}%")
                      ->orWhere('message', 'LIKE', "%{$search}%");
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $contacts = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'code' => 200,
                'data' => $contacts
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch contact submissions: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'code' => 500,
                'message' => 'Failed to fetch contact submissions'
            ], 500);
        }
    }

    /**
     * Get single contact submission (Admin only)
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $contact = ContactUs::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'code' => 200,
                'data' => $contact
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'code' => 404,
                'message' => 'Contact submission not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Failed to fetch contact submission: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'code' => 500,
                'message' => 'Failed to fetch contact submission'
            ], 500);
        }
    }

    /**
     * Update contact status (Admin only)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,reviewed,replied',
                'admin_notes' => 'nullable|string|max:1000'
            ]);

            $contact = ContactUs::findOrFail($id);
            $contact->status = $request->status;
            
            if ($request->has('admin_notes')) {
                $contact->admin_notes = $request->admin_notes;
            }
            
            $contact->save();

            return response()->json([
                'success' => true,
                'code' => 200,
                'message' => 'Status updated successfully',
                'data' => $contact
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'code' => 404,
                'message' => 'Contact submission not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Failed to update status: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'code' => 500,
                'message' => 'Failed to update status'
            ], 500);
        }
    }

    /**
     * Delete contact submission (Admin only)
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $contact = ContactUs::findOrFail($id);
            $contact->delete();

            return response()->json([
                'success' => true,
                'code' => 200,
                'message' => 'Contact submission deleted successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'code' => 404,
                'message' => 'Contact submission not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Failed to delete contact submission: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'code' => 500,
                'message' => 'Failed to delete contact submission'
            ], 500);
        }
    }

    /**
     * Get inquiry types list
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInquiryTypes()
    {
        return response()->json([
            'success' => true,
            'code' => 200,
            'data' => ContactUs::getInquiryTypes()
        ]);
    }

    /**
     * Test email configuration (Admin only)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function testEmail()
    {
        try {
            // Create a test contact
            $testContact = new ContactUs([
                'name' => 'Test User',
                'email' => config('mail.from_address'),
                'phone' => '+1234567890',
                'company' => 'Test Company',
                'inquiry_type' => 'Test Inquiry',
                'subject' => 'Test Email Subject',
                'message' => 'This is a test message to verify email configuration. If you receive this, your email settings are working correctly!',
                'source' => 'test-endpoint',
                'submitted_at' => now()
            ]);

            // Send test email to admin
            $adminEmails = $this->getAdminEmails();
            
            if (empty($adminEmails)) {
                return response()->json([
                    'success' => false,
                    'code' => 400,
                    'message' => 'No admin emails configured. Please set MAIL_ADMIN_ADDRESSES in .env'
                ], 400);
            }

            foreach ($adminEmails as $email) {
                Mail::to($email)->send(new ContactUsNotification($testContact));
            }

            return response()->json([
                'success' => true,
                'code' => 200,
                'message' => 'Test email sent successfully to: ' . implode(', ', $adminEmails),
                'data' => [
                    'admin_emails' => $adminEmails,
                    'mail_config' => [
                        'mailer' => config('mail.default'),
                        'from_address' => config('mail.from.address'),
                        'from_name' => config('mail.from.name'),
                        'host' => config('mail.mailers.smtp.host')
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Test email failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'code' => 500,
                'message' => 'Failed to send test email: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get contact statistics (Admin only)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats()
    {
        try {
            $stats = [
                'total' => ContactUs::count(),
                'pending' => ContactUs::where('status', 'pending')->count(),
                'reviewed' => ContactUs::where('status', 'reviewed')->count(),
                'replied' => ContactUs::where('status', 'replied')->count(),
                'today' => ContactUs::whereDate('created_at', today())->count(),
                'this_week' => ContactUs::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'this_month' => ContactUs::whereMonth('created_at', now()->month)->count(),
                'by_inquiry_type' => ContactUs::select('inquiry_type', DB::raw('count(*) as total'))
                    ->groupBy('inquiry_type')
                    ->get()
                    ->pluck('total', 'inquiry_type')
                    ->toArray()
            ];

            return response()->json([
                'success' => true,
                'code' => 200,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get stats: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'code' => 500,
                'message' => 'Failed to get statistics'
            ], 500);
        }
    }
}