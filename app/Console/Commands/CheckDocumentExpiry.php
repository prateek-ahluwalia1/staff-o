<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\DocumentNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\DocumentExpiryMail;
use App\Events\DocumentExpiryEvent;
use App\Events\DynamicUserNotification;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class CheckDocumentExpiry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'documents:check-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check document expiry and send notifications to users and admins';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting document expiry check...');
        
        try {
            $users = $this->getUsers();
            
            if ($users->isEmpty()) {
                $this->warn('No active staff users found.');
                return 0;
            }

            $this->info("Found {$users->count()} active staff users.");
            
            $expiringDocuments = [];
            $today = Carbon::now();
            $notificationCount = 0;
            $emailCount = 0;

            foreach ($users as $user) {
                $userDocuments = $this->processUserDocuments($user, $today);
                
                if (!empty($userDocuments)) {
                    $expiringDocuments = array_merge($expiringDocuments, $userDocuments);
                    
                    foreach ($userDocuments as $doc) {
                        // Send notifications
                        $this->sendNotifications($user, $doc['document'], $doc['days_remaining']);
                        $notificationCount++;
                        
                        // Send email to admin
                        $this->sendAdminEmail($user, $doc['document'], $doc['days_remaining']);
                        $emailCount++;
                    }
                }
                
            }

            // Log the activity
            Log::info('Document expiry check completed', [
                'total_users' => $users->count(),
                'expiring_documents' => count($expiringDocuments),
                'notifications_sent' => $notificationCount,
                'emails_sent' => $emailCount
            ]);

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            Log::error('Document expiry check failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }

    /**
     * Get users based on command options
     */
    private function getUsers()
    {
        $query = User::where('user_type', 'staff')
                    ->where('is_active', 1)
                    ->with('documents');


        return $query->get();
    }

    /**
     * Process documents for a single user
     */
    private function processUserDocuments($user, $today)
    {
        $expiringDocs = [];

        foreach ($user->documents as $document) {
            // Skip if no expiry date
            if (!$document->document_expiry) {
                continue;
            }

            $expiryDate = Carbon::parse($document->document_expiry);
            $daysRemaining = $today->diffInDays($expiryDate, false);

            if ($daysRemaining >= 0 && $daysRemaining <= 30) {  

                $expiringDocs[] = [
                    'document' => $document,
                    'days_remaining' => $daysRemaining,
                    'expiry_date' => $expiryDate
                ];
            }
        }

        return $expiringDocs;
    }

    /**
     * Send all notifications (User + Admin via Pusher)
     */
    private function sendNotifications($user, $document, $daysRemaining)
    {
        try {
            // Save notification record
            $notification = [
                'user_id' => $user->id,
                'document_id' => $document->id,
                'document_name' => $document->name ?? 'Document',
                'expiry_date' => $document->document_expiry,
                'days_remaining' => $daysRemaining,
                'notification_type' => 'both',
                'is_sent' => true,
                'sent_at' => Carbon::now()
            ];

            $this->line("   ✅ Notification saved for {$user->name} - Document: {$document->name}");

            // Send notification to USER via Pusher
            $this->sendUserPusherNotification($user, $document, $daysRemaining);

            // Send notification to ADMIN via Pusher
            $this->sendAdminPusherNotification($user, $document, $daysRemaining, $notification);

            return $notification;

        } catch (\Exception $e) {
            $this->error("   ❌ Failed to send notification for {$user->name}: " . $e->getMessage());
            Log::error('Notification failed', [
                'user_id' => $user->id,
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Send Pusher notification to user
     */
        private function sendUserPusherNotification($user, $document, $daysRemaining)
        {
            try {
                // For APP push notification
                $notificationData = [
                    'notification_token' => $user->notification_token,
                    'message'            => "Your document '{$document->name}' will expire in {$daysRemaining} days. Please renew it before.",
                    'title'              => 'Document Expire',
                    'page'               => 'document-expire',
                ];

                if (function_exists('send_push_notification')) {
                    send_push_notification($notificationData);
                }

                // For PORTAL notification using DynamicUserNotification
                $userId = $user->id;
                $message = "Your document '{$document->name}' will expire in {$daysRemaining} days. Please renew it before.";
                $title = "Document Expire";
                $type = 'document_expiry';
                $data = [
                    'document_id' => $document->id,
                    'document_name' => $document->name,
                    'expiry_date' => $document->document_expiry,
                    'days_remaining' => $daysRemaining
                ];

                $this->saveNotification(null, $userId, $title, $message, $type, $data);
                // Fire the broadcast event — Pusher delivers it to the private channel
                broadcast(new DynamicUserNotification($userId, $message, $title, $data, $type));
                
                $this->line("   📱 Pusher notification sent to user: {$user->name}");

            } catch (\Exception $e) {
                $this->warn("   ⚠️ Failed to send Pusher notification to user: " . $e->getMessage());
                Log::error('User Pusher notification failed', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

    /**
     * Send Pusher notification to admin using DynamicUserNotification
     */
    private function sendAdminPusherNotification($user, $document, $daysRemaining, $notification)
    {
        try {
            $admins = User::where('user_type', 'admin')
                         ->where('is_active', 1)
                         ->get();

            if ($admins->isEmpty()) {
                $this->warn("   ⚠️ No active admin users found to send notification.");
                return;
            }

            $message = "Staff user '{$user->name}' has a document '{$document->name}' expiring in {$daysRemaining} days.";
            $title = "Document Expiry Alert";
            $type = 'admin_document_expiry';
            $data = [
                'staff_id' => $user->id,
                'staff_name' => $user->name,
                'staff_email' => $user->email,
                'document_id' => $document->id,
                'document_name' => $document->name,
                'expiry_date' => $document->document_expiry,
                'days_remaining' => $daysRemaining,
                'notification_id' => $notification->id ?? null
            ];

            foreach ($admins as $admin) {
                broadcast(new DynamicUserNotification(
                    $admin->id, 
                    $message, 
                    $title, 
                    $data, 
                    $type
                ));
                
                $this->line("   📢 Pusher notification sent to admin: {$admin->name} (ID: {$admin->id})");
            }

        } catch (\Exception $e) {
            $this->warn("   ⚠️ Failed to send Pusher notification to admin: " . $e->getMessage());
            Log::error('Admin Pusher notification failed', [
                'user_id' => $user->id,
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send email to admin
     */
    private function sendAdminEmail($user, $document, $daysRemaining)
    {
        try {
            // Get admin email from config or use default
            $adminEmail = "shahbazkhan062@gmail.com";
            
            $details = [
                'staff_name' => $user->name,
                'staff_email' => $user->email,
                'document_name' => $document->name,
                'expiry_date' => Carbon::parse($document->document_expiry)->format('d-m-Y'),
                'days_remaining' => $daysRemaining,
                'message' => "Staff user '{$user->name}' has a document '{$document->name}' expiring in {$daysRemaining} days. Please take necessary action."
            ];

            Mail::to($adminEmail)->send(new DocumentExpiryMail($details));
            
            $this->line("   📧 Email sent to admin: {$adminEmail}");

        } catch (\Exception $e) {
            $this->warn("   ⚠️ Failed to send email to admin: " . $e->getMessage());
            Log::error('Admin email failed', [
                'user_id' => $user->id,
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
        }
    }

     private function saveNotification($receiverId, $guardId, $title, $message, $type, $data = [])
    {
        try {
            Notification::create([
                'receiver_id' => $receiverId,
                'guard_id' => $guardId,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'data' => json_encode($data),
                'read_at' => null
            ]);

            $this->line("   💾 Notification saved in database for receiver: {$receiverId}");

        } catch (\Exception $e) {
            $this->warn("   ⚠️ Failed to save notification to database: " . $e->getMessage());
            Log::error('Save notification failed', [
                'receiver_id' => $receiverId,
                'error' => $e->getMessage()
            ]);
        }
    }
}