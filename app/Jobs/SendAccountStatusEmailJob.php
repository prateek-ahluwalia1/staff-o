<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SendAccountStatusEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected $status;

    /**
     * Create a new job instance.
     */
    public function __construct($user, $status)
    {
        $this->user = $user;
        $this->status = $status;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $user = $this->user;
            $status = $this->status;
            
            $company = User::find($user->user_id);
            $companyName = $company ? $company->name : 'your company';
            
            if ($status === 'active') {
                $data = [
                    'name' => $user->name,
                    'email' => $user->email,
                    'company_name' => $companyName,
                    'staffo_id' => $user->staffo_id,
                    'status' => 'active',
                    'status_color' => '#28a745',
                    'status_icon' => '✅',
                    'status_message' => 'Your account has been activated successfully! You can now start using Staffoo to manage your work.',
                    'issues' => []
                ];
                
                $subject = 'Your Staffoo Account is Now Active 🎉';
            } else {
                $issues = $this->getAccountIssues($user);
                
                $data = [
                    'name' => $user->name,
                    'email' => $user->email,
                    'company_name' => $companyName,
                    'staffo_id' => $user->staffo_id,
                    'status' => 'inactive',
                    'status_color' => '#dc3545',
                    'status_icon' => '⚠️',
                    'status_message' => 'Your account has been deactivated due to incomplete profile or expired documents. Please update your information to reactivate your account.',
                    'issues' => $issues
                ];
                
                $subject = 'Important: Your Staffoo Account is Inactive ⚠️';
            }

            Mail::send('emails.account_status', $data, function ($message) use ($user, $subject) {
                $message->to($user->email, $user->name)
                        ->subject($subject);
            });

            Log::info('Account status email sent to staff: ' . $user->email . ' | Status: ' . $status);
            
        } catch (\Exception $e) {
            Log::error('Failed to send account status email: ' . $e->getMessage(), [
                'user_id' => $this->user->id,
                'email' => $this->user->email,
                'status' => $this->status
            ]);
        }
    }

    /**
     * Get list of issues causing account deactivation
     */
    private function getAccountIssues($user)
    {
        $issues = [];
        
        // Check profile completeness
        $baseFields = ['name', 'email', 'address', 'city', 'state', 'country', 'phone'];
        $missingFields = [];
        foreach ($baseFields as $field) {
            if (empty($user->{$field})) {
                $missingFields[] = ucfirst(str_replace('_', ' ', $field));
            }
        }
        
        if (!empty($missingFields)) {
            $issues[] = [
                'type' => 'profile',
                'message' => 'Missing profile information: ' . implode(', ', $missingFields)
            ];
        }
        
        // Check documents
        $documents = $user->documents ?? collect();
        $expiredDocs = [];
        $missingDocs = [];
        
        foreach ($documents as $document) {
            if (empty($document->file)) {
                $missingDocs[] = $document->document_name;
            } elseif (!empty($document->document_expiry)) {
                if ($document->document_expiry === 'current, pending renewal') {
                    continue;
                }
                
                $expiryDate = Carbon::parse($document->document_expiry);
                if ($expiryDate->isPast()) {
                    $expiredDocs[] = $document->document_name . ' (expired on ' . Carbon::parse($document->document_expiry)->format('d M Y') . ')';
                }
            }
        }
        
        if (!empty($missingDocs)) {
            $issues[] = [
                'type' => 'documents',
                'message' => 'Missing documents: ' . implode(', ', $missingDocs)
            ];
        }
        
        if (!empty($expiredDocs)) {
            $issues[] = [
                'type' => 'documents',
                'message' => 'Expired documents: ' . implode(', ', $expiredDocs)
            ];
        }
        
        if (empty($issues)) {
            $issues[] = [
                'type' => 'general',
                'message' => 'Profile completion requirements not met. Please ensure all required fields are filled and documents are uploaded.'
            ];
        }
        
        return $issues;
    }
}