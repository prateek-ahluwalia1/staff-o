<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChargeRate;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\GuardPayslip;
use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\JobNewRoster;
use Carbon\Carbon;
use App\Models\JobRoster;
use App\Models\JobRosterActivity;
use App\Models\JobRosterTask;
use App\Models\Transaction;
use App\Models\User;
use DateTime;
use App\Models\EmailHistory;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Stripe\Customer;
use Stripe\PaymentIntent;
use Stripe\PaymentMethod;
use Stripe\Stripe;
use Stripe\Transfer;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Mail\InvoiceMail;
use App\Services\InvoiceService;
use Illuminate\Support\Facades\Storage;
use App\Mail\ContractorJobInvoice;
use App\Models\ContractorChargeRate;

class JobRosterController extends Controller
{
    public function jobData(Request $request)
    {
        // ─── VALIDATION ──────────────────────────────────────────────────────
        $validator = Validator::make($request->all(), [
            'user_id'                    => 'required|exists:users,id',
            'shifts'                     => 'required|array|min:1',
            'shifts.*.start'             => 'required|date',
            'shifts.*.end'               => 'required|date|after:shifts.*.start',
            'shifts.*.numberOfGuards'    => 'required|integer|min:1',
            'payment_intent_id'          => 'required|string',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }
    
        try {
    
            $user = User::findOrFail($request->user_id);
    
            // ─── CREATE / FIND SITE ──────────────────────────────────────────
            [$lat, $lng] = explode(',', $request->coordinates);
            $lat = (float) trim($lat);
            $lng = (float) trim($lng);

            $radiusMeters = 30;

            $site = Site::get()->first(function ($site) use ($lat, $lng, $radiusMeters) {
                [$siteLat, $siteLng] = array_map('trim', explode(',', $site->coordinates));
                $distance = $this->haversineDistance($lat, $lng, (float) $siteLat, (float) $siteLng);
                return $distance <= $radiusMeters;
            }); 

            if (!$site) {
                $addressParts = explode(',', $request->address);
                $firstPart = trim($addressParts[0]);

                $site = Site::create([
                    'user_id'          => $user->id,
                    'site_name'        => $firstPart,
                    'site_description' => $request->description,
                    'address'          => $request->address,
                    'signin_radius'    => 300,
                    'coordinates'      => $request->coordinates,
                    'state'            => $request->job_location_state,
                ]);
            }
    
            // ─── GET DEFAULT ROSTER ──────────────────────────────────────────
            $jobNewRoster = JobNewRoster::find(1);
    
            if (!$jobNewRoster) {
                return response()->json([
                    'success' => false,
                    'message' => 'Roster not found.',
                ], 404);
            }
    
            $paymentIntentId      = $request->payment_intent_id;
            $isAdminOverride      = $paymentIntentId === 'admin_override_no_payment';
            //change here based on level and than calculate rate.
            $chargeRate           = ChargeRate::where('level', $request->job_level)->first();
    
            $radiusValue          = is_array($request->radius)        ? json_encode($request->radius)        : $request->radius;
            $documentListValue    = is_array($request->document_types) ? json_encode($request->document_types) : $request->document_types;
            $jobInstructionsValue = is_array($request->document_list)  ? json_encode($request->document_list)  : $request->document_list;
    
            $createdJobIds    = [];
            $invoiceShifts    = [];   // ← collected for the invoice PDF
            $invoiceBaseTotal = 0;    // ← running total for invoice
    
            // ─── FETCH TRANSACTION TO GET PAYMENT OPTION & AMOUNTS ───────────
            // (only when this is a real Stripe hold, not an admin override)
            $transaction = null;
            if (!$isAdminOverride) {
                $transaction = \App\Models\Transaction::where('payment_intent_id', $paymentIntentId)->first();
            }

            foreach ($request->shifts as $shift) {
    
                $start = dbFormateDateTime($shift['start']);
                $end   = dbFormateDateTime($shift['end']);
    
                $hours            = getShiftHours($start, $end, 1, 0);
                $guardWorkingHours = calCulateGuardWeekHours($start, $end);
    
                // ─── BASE AMOUNT PER GUARD ────────────────────────────────
                $jobAmount =
                    ($chargeRate->def_metro_mon_to_fri_day_rate   * ($hours['morning']          ?? 0)) +
                    ($chargeRate->def_metro_mon_to_fri_night_rate * ($hours['night']             ?? 0)) +
                    ($chargeRate->def_metro_sat_day_rate          * (($hours['saturday_morning'] ?? 0) + ($hours['saturday_night'] ?? 0))) +
                    ($chargeRate->def_metro_sun_day_rate          * (($hours['sunday_morning']   ?? 0) + ($hours['sunday_night']   ?? 0)))+
                    ($chargeRate->def_metro_pub_holi_day_rate     * (($hours['ph_morning'] ?? 0) + ($hours['ph_night'] ?? 0)));
    
                // $serviceFee  = round($jobAmount * 0.10, 2);
                $cleanBaseTotal = (float) str_replace([',', '$'], '', $jobAmount);
                $feeRaw = $cleanBaseTotal * 0.10;
                $serviceFee = round($feeRaw, 2);
                $displayedFee = number_format($serviceFee, 2);
                $serviceFee  = $displayedFee;
                $totalAmount = round($jobAmount + $serviceFee, 2);
    
                // ─── COLLECT FOR INVOICE ──────────────────────────────────
                $totalShiftHours = array_sum([
                    $hours['morning']          ?? 0,
                    $hours['night']            ?? 0,
                    $hours['saturday_morning'] ?? 0,
                    $hours['saturday_night']   ?? 0,
                    $hours['sunday_morning']   ?? 0,
                    $hours['sunday_night']     ?? 0,
                    $hours['ph_morning']       ?? 0,
                    $hours['ph_night']         ?? 0,
                ]);
    
                $invoiceShifts[] = [
                    'start'          => date('d-m-Y', strtotime($start)),
                    'end'            => date('d-m-Y', strtotime($end)),
                    'numberOfGuards' => (int) $shift['numberOfGuards'],
                    'hours'          => round($totalShiftHours, 2),
                    'amount'         => round($jobAmount * $shift['numberOfGuards'], 2),
                ];
                $invoiceBaseTotal += round($jobAmount * $shift['numberOfGuards'], 2);
    
                for ($i = 0; $i < $shift['numberOfGuards']; $i++) {
    
                    $roster = [
                        'site_id'          => $site->id,
                        'start'            => $start,
                        'end'              => $end,
                        'job_type'         => $request->job_type,
                        'shift_payable'    => 'yes',
                        'shift_chargeable' => 'yes',
                        'job_status'       => 'pending',
                        'asap'             => 1,
                        'radius'           => $radiusValue,
                        'is_document'      => $request->is_document,
                        'document_list'    => $documentListValue,
                        'description'      => $request->description,
                        'job_level'        => $request->job_level,
                        'publish_status'   => 1,
                        'roster_id'        => $jobNewRoster->id,
                        'job_instrcutions' => $jobInstructionsValue,
                        'created_by'       => $request->user_id,
                        'assigned_to'      => $request->assigned_staff_id ?? null,
                        'notified_users'   => json_encode([]),
    
                        'payment_intent_id' => $isAdminOverride ? null : $paymentIntentId,
                        'payment_status'    => $isAdminOverride ? 'not_required' : 'held',
                        'payment_captured'  => $isAdminOverride ? 1 : 0,
    
                        'job_amount'             => $jobAmount,
                        'morning_hours'          => $hours['morning']          ?? 0,
                        'night_hours'            => $hours['night']             ?? 0,
                        'saturday_morning_hours' => $hours['saturday_morning']  ?? 0,
                        'saturday_night_hours'   => $hours['saturday_night']    ?? 0,
                        'sunday_morning_hours'   => $hours['sunday_morning']    ?? 0,
                        'sunday_night_hours'     => $hours['sunday_night']      ?? 0,
                        'ph_morning_hours'       => $hours['ph_morning']        ?? 0,
                        'ph_night_hours'         => $hours['ph_night']          ?? 0,
                        'hours'                  => $guardWorkingHours,
                        'created_at'             => now(),
                        'updated_at'             => now()
                    ];
    
                    $jobId = JobRoster::insertGetId($roster);
                    $createdJobIds[] = $jobId;
                    $createdJob = JobRoster::with('site')->find($jobId);
                }
            }
    
            if ($request->posting_type == 'broadcast' && !empty($createdJobIds)) {
                // Get the first created job for reference (site, coordinates, etc.)
                $firstJob = JobRoster::with('site')->find($createdJobIds[0]);
                
                // Send a single consolidated notification for ALL shifts on this site
                $this->sendConsolidatedNotifications(
                    $request->coordinates,
                    $createdJobIds, // Pass ALL job IDs
                    $request->user_id
                );
            }
            
            if (!$isAdminOverride) {
                Transaction::where('payment_intent_id', $paymentIntentId)
                    ->update(['job_roster_id' => json_encode($createdJobIds)]);

                      // ════════════════════════════════════════════════════════════
              //  SPLIT PAYMENT — capture the first half now job is posted
              // ════════════════════════════════════════════════════════════
                if ($transaction && $transaction->balance > 0) {
                    try {
                        Stripe::setApiKey(config('services.stripe.secret'));
    
                        $intent = PaymentIntent::retrieve($paymentIntentId);
                        if ($intent->status === 'requires_capture') {
                            $capturedIntent = $intent->capture();

                            $chargeId = $capturedIntent->latest_charge ?? null;

                            Transaction::where('payment_intent_id', $paymentIntentId)
                             ->update([
                                'status' => 'partially_captured',
                                'charge_id' => $chargeId,
                                'response'  => json_encode($capturedIntent),
                            ]);
                        }

                        $this->sendJobInvoice(
                            user:            $user,
                            shifts:          $invoiceShifts,
                            baseTotal:       $invoiceBaseTotal,
                            transaction:     $transaction,
                            invoiceNumber:   'ST-' . rand(100000, 999999),
                            location: $site->site_name ?? null,
                            paymentIntentId: $paymentIntentId,
                        );
    
                    } catch (\Exception $e) {
                        Log::channel('daily')->error('[Split Payment] First-half capture failed', [
                            'payment_intent_id' => $paymentIntentId,
                            'error'             => $e->getMessage(),
                        ]);
                        return response()->json([
                            'success'            => false,
                            'message'            => 'Jobs created successfully but payment failed.',
                            'total_jobs_created' => count($createdJobIds),
                            'job_ids'            => $createdJobIds,
                            'payment_intent_id'  => $paymentIntentId,
                        ]);
                        // Don't rethrow — job posting still succeeds even if capture fails;
                        // you'll want a way to retry/alert on this in admin.
                    }
                } else {
                    $this->sendJobInvoice(
                        user:             $user,
                        shifts:           $invoiceShifts,
                        baseTotal:        $invoiceBaseTotal,
                        transaction:      $transaction,
                        invoiceNumber:   'ST-' . rand(100000, 999999),
                        location: $site->site_name ?? null,
                        paymentIntentId:  $paymentIntentId,
                    );
                }
            }
    
            return response()->json([
                'success'            => true,
                'message'            => 'Jobs created successfully with payment hold.',
                'total_jobs_created' => count($createdJobIds),
                'job_ids'            => $createdJobIds,
                'payment_intent_id'  => $paymentIntentId,
            ]);
    
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    private function haversineDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371000; // meters

        $latDiff = deg2rad($lat2 - $lat1);
        $lngDiff = deg2rad($lng2 - $lng1);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lngDiff / 2) * sin($lngDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c; // distance in meters
    }
    
   private function sendJobInvoice(
    $user,
    array $shifts,
    float $baseTotal,
    $transaction,
    string $invoiceNumber,
    string $location,
    string $paymentIntentId,
    ): void {

        try {
    
            // ── STEP 1: resolve payment figures ──────────────────────────
            $discount      = $transaction ? (float) $transaction->discount       : 0;
            $serviceFee    = $transaction ? (float) $transaction->service_fee    : round($baseTotal * 0.10, 2);
            $grandTotal    = $transaction ? (float) $transaction->total_amount   : round(($baseTotal - $discount) + $serviceFee, 2);
            $amountCharged = $transaction ? (float) $transaction->amount_charged : $grandTotal;
            $balance       = $transaction ? (float) $transaction->balance        : 0;
            $paymentOption = ($transaction && $transaction->balance > 0) ? 'split' : 'full';
    
    
            // ── STEP 2: build invoice data array ─────────────────────────
            $invoiceData = [
                'invoice_number'    => $invoiceNumber,
                'date'              => now()->format('d M Y'),
                'client_name'       => $user->name,
                'client_email'      => $user->email,
                'payment_intent_id' => $paymentIntentId,
                'payment_option'    => $paymentOption,
                'shifts'            => $shifts,
                'base_total'        => $baseTotal,
                'discount'          => $discount,
                'service_fee'       => $serviceFee,
                'grand_total'       => $grandTotal,
                'amount_charged'    => $amountCharged,
                'balance'           => $balance,
                'location'          => $location,
            ];
    
            $pdfBytes  = app(\App\Services\InvoiceService::class)->generatePdf($invoiceData);
            $pdfBase64 = base64_encode($pdfBytes);

            $this->saveInvoicePdf($pdfBytes, $invoiceNumber, $user->name, $paymentIntentId);
    
            \Illuminate\Support\Facades\Mail::to($user->email)
                ->queue(new \App\Mail\InvoiceMail(
                    pdfBase64:     $pdfBase64,
                    invoiceNumber: $invoiceNumber,
                    clientName:    $user->name,
                    isAdmin:       false,
                ));
    
            // ── STEP 5: send to all admins ────────────────────────────────
            $adminEmails = \App\Models\User::where('user_type', 'admin')->first();
            
            if ($adminEmails && $adminEmails->email) {
                Log::channel('daily')->info('[Invoice] Step 5 – Queueing admin email', [
                    'admin_email' => $adminEmails->email,
                ]);
                
                Mail::to($adminEmails->email)
                    ->queue(new InvoiceMail(
                        pdfBase64:     $pdfBase64,
                        invoiceNumber: $invoiceNumber,
                        clientName:    $user->name,
                        isAdmin:       true,
                    ));
            }
    
    
        } catch (\Exception $e) {
            Log::channel('daily')->error('[Invoice] ── FAILED ──', [
                'invoice_number' => $invoiceNumber,
                'error'          => $e->getMessage(),
                'file'           => $e->getFile(),
                'line'           => $e->getLine(),
                'trace'          => $e->getTraceAsString(),
            ]);
    
            // Do NOT rethrow — invoice failure should not break job creation response
        }
    }

    private function saveInvoicePdf($pdfBytes, string $invoiceNumber, string $clientName, string $intentId): void
    {
        try {
            // Create directory structure: invoices/year/month/
            $year = now()->format('Y');
            $month = now()->format('m');
            $directory = storage_path('app/public/invoices');

            
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
            
            // Clean client name for filename (remove special characters)
            $cleanClientName = preg_replace('/[^A-Za-z0-9]/', '_', $clientName);
            
            // Generate filename: invoice_20241225_ABC123_John_Doe.pdf
            $filename = "Invoice-{$invoiceNumber}.pdf";
            $filePath = $directory . DIRECTORY_SEPARATOR . $filename;

            DB::table('job_rosters')
            ->where('payment_intent_id', $intentId)
            ->update([
                'invoice_filename' => $filename,
                'updated_at' => now()
            ]);
            
            // Save the PDF
            file_put_contents($filePath, $pdfBytes);
            
            // Log::channel('daily')->info('[Invoice] PDF saved successfully', [
            //     'invoice_number' => $invoiceNumber,
            //     'file_path' => $filePath,
            //     'size_bytes' => strlen($pdfBytes)
            // ]);
            
        } catch (\Exception $e) {
            Log::channel('daily')->warning('[Invoice] Failed to save PDF to folder', [
                'invoice_number' => $invoiceNumber,
                'error' => $e->getMessage()
            ]);
            // Don't throw exception - email should still be sent even if saving fails
        }
    }

        /**
         * Send notifications to staff (user_id=1) within 5km radius
         */
        private function sendNotificationsWithinRadius($siteCoordinates, $jobIds, $userId, $roster)
        {

            $radiusKm = 15; // 5km radius
            $notifiedUsers = [];

            // Get all staff with user_id = 1
            $staff = User::where('user_id', 1)
            ->where('is_active', 1)
            ->where('user_type', 'staff')
            ->whereNotNull('current_coordinates')
            ->whereNotNull('notification_token')
            // ->whereHas('guardQuestionnaireDetails', function ($query) {
            //     $query->whereNotNull('certificate_path');
            // })
            // ->whereDoesntHave('guardQuestionnaireDetails', function ($query) {
            //     $query->whereNull('certificate_path');
            // })
                ->select('id', 'name', 'email', 'phone', 'current_coordinates', 'coordinates', 'notification_token')
            ->get();
            

            if($staff->isEmpty()){
                $staff = User::where('is_active', 1)
                // ->whereNotIn('user_id', $userId)
                ->where('user_type', 'contractor')
                ->whereNotNull('current_coordinates')
                ->whereNotNull('notification_token')
                ->select('id', 'name', 'current_coordinates', 'phone', 'coordinates', 'notification_token')
                ->get();
            }


            foreach ($staff as $staffMember) {
                $distance = $this->calculateDistance($siteCoordinates, $staffMember->current_coordinates);
                
                if ($distance <= $radiusKm) {

                    // Send notification if token exists
                    if ($staffMember->notification_token) {
                        $notificationSent = send_push_notification([
                            'notification_token' => $staffMember->notification_token,
                            'message'            => "A new security job is available within 15 km of you. Please check your app.",
                            'title'              => 'New Job Available',
                            'page'               => 'asap-job-list',
                            'data'               => [
                                'distance' => round($distance, 2),
                                'radius' => $radiusKm,
                                'job_ids' => $jobIds,
                                'roster' => $roster
                            ]
                        ]);
                        

                        if ($notificationSent) {
                            $notifiedUsers[] = [
                                'user_id' => $staffMember->id,
                                'name' => $staffMember->name,
                                'distance' => round($distance, 2) . ' km'
                            ];
                        }
                    }
                
                    $this->sendEmail($staffMember, 'New Job Available', "A new security job is available within 15 km of you. Please check your app.", $roster);
                    if (!empty($staffMember->phone)) {
                    $sendSmS = send_sms($staffMember->phone, "A new security job is available within 15 km of you. Please check your app.");
                    }
                }
            }

            // Update each job roster with notified users
            // $this->updateJobRosterWithNotifiedUsers($jobIds, $notifiedUsers, $radiusKm);

            return $notifiedUsers;
        }

        /**
         * Calculate distance between two coordinates using Haversine formula
         */
        private function calculateDistance($coord1, $coord2)
        {
            list($lat1, $lng1) = explode(',', $coord1);
            list($lat2, $lng2) = explode(',', $coord2);

            $earthRadius = 6371;

            $latDelta = deg2rad($lat2 - $lat1);
            $lngDelta = deg2rad($lng2 - $lng1);

            $a = sin($latDelta / 2) * sin($latDelta / 2) +
                cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
                sin($lngDelta / 2) * sin($lngDelta / 2);

            $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

            return $earthRadius * $c;
        }

        /**
         * Update job roster with notified users
         */
        private function updateJobRosterWithNotifiedUsers($jobIds, $notifiedUsers, $radiusKm)
        {
            $notificationData = [
                'user_ids' => array_column($notifiedUsers, 'user_id'),
            ];

            foreach ($jobIds as $jobId) {
                $jobRoster = JobRoster::find($jobId);

                if ($jobRoster) {
                    $existingNotified = json_decode($jobRoster->notified_users ?? '[]', true);
                    $existingNotified[] = $notificationData;

                    $jobRoster->notified_users = json_encode($existingNotified);
                    $jobRoster->save();
                }
            }
        }

        // public function getContractorStaff($id)
        // {
        //     $guards = User::where('user_id', $id)->with('staff','documents')->where('user_type', 'staff')->get();

        //     if (!$guards) {
        //         return response()->json([
        //             'code' => 200,
        //             'success' => false,
        //             'message' => 'Staff Not Found.',
        //             'guards' => null
        //         ]);
        //     }

        //     return response()->json([
        //         'code' => 200,
        //         'success' => true,
        //         'message' => 'Staff Found.',
        //         'guards' => $guards
        //     ]);
        // }
        public function getContractorStaff($id)
{
    $guards = User::where('user_id', $id)
        ->with('staff', 'documents')
        ->where('user_type', 'staff')
        ->get();

    if (!$guards || $guards->isEmpty()) {
        return response()->json([
            'code' => 200,
            'success' => false,
            'message' => 'Staff Not Found.',
            'guards' => null
        ]);
    }

    // Calculate profile completion and update status for each staff member
    foreach ($guards as $staff) {
        $this->calculateStaffProfileCompletion($staff);
    }

    // Refresh the collection with updated status
    $guards = User::where('user_id', $id)
        ->with('staff', 'documents')
        ->where('user_type', 'staff')
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'code' => 200,
        'success' => true,
        'message' => 'Staff Found.',
        'guards' => $guards
    ]);
}

private function calculateStaffProfileCompletion(User $user): int
{
    $baseWeight = 50;
    $documentWeight = 50;

    // Base fields for staff
    $baseFields = ['name', 'email', 'user_type'];
    $staffFields = ['tfn_form', 'super_form', 'onboarding_form'];
    
    $allBaseFields = $baseFields;
    if ($user->user_id == 1) {
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
    $totalDocuments = $documents->count();

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
        
    } else {
        // Regular staff with security license and first aid
        $securityLicenseDoc = $documents->firstWhere('document_type', 'security_license');
        // $firstAidDoc = $documents->firstWhere('document_type', 'first_aid');
        
        $hasValidSecurityLicense = $this->isStaffDocumentValid($securityLicenseDoc);
        // $hasValidFirstAid = $this->isStaffDocumentValid($firstAidDoc);
        
        // Calculate document score
        if ($totalDocuments > 0) {
            $filledDocuments = $documents->filter(function ($doc) {
                return $this->isStaffDocumentValid($doc);
            })->count();
            
            $documentScore = ($filledDocuments / $totalDocuments) * $documentWeight;
        }
        
        $newStatus = ($baseScore >= $baseWeight && 
                      $hasValidSecurityLicense) ? 1 : 0;
    }

    $this->updateStaffStatus($user, $newStatus);

    // Final percentage
    $percentage = (int) round($baseScore + $documentScore);
    return min($percentage, 100);
}

private function isStaffDocumentValid($document): bool
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

private function updateStaffStatus(User $user, int $newStatus): void
{
    $oldStatus = $user->is_active;
    
    if ($user->is_active !== $newStatus) {
        $user->is_active = $newStatus;
        $user->save();

        if ($newStatus === 1 && $oldStatus != 1) {
            $this->sendStaffActivationNotification($user);
        }
    }
}

private function sendStaffActivationNotification(User $user): void
{
    if (empty($user->notification_token)) {
        return;
    }

    $notificationData = [
        'notification_token' => $user->notification_token,
        'message'            => "Congratulations! Your staff account is now active.",
        'title'              => 'Staff Account Activated',
        'page'               => 'account-verified',
    ];

    if (function_exists('send_push_notification')) {
        send_push_notification($notificationData);
    }
}

        public function getContractorActiveStaff($id)
        {
            // $guards = User::where('user_id', $id)->with('staff')->where('is_active', 1)->where('user_type', 'staff')->get();
            $guards = User::where('user_id', $id)
            ->where('is_active', 1)
            ->where('user_type', 'staff')
            ->whereNotNull('coordinates')
            // ->whereHas('guardQuestionnaireDetails', function ($query) {
            //     $query->whereNotNull('certificate_path');
            // })
            // ->whereDoesntHave('guardQuestionnaireDetails', function ($query) {
            //     $query->whereNull('certificate_path');
            // })
            ->select('id', 'name', 'coordinates', 'notification_token')
            ->get();

            if (!$guards) {
                return response()->json([
                    'code' => 200,
                    'success' => false,
                    'message' => 'Staff Not Found.',
                    'guards' => null
                ]);
            }

            return response()->json([
                'code' => 200,
                'success' => true,
                'message' => 'Staff Found.',
                'guards' => $guards
            ]);
        }

        function calCulateGuardWeekHours($start, $end)
        {
            $datetime1 = new DateTime($start);
            $datetime2 = new DateTime($end);
            $interval = $datetime1->diff($datetime2);

            $minutes = $interval->format('%i');
            $hours = $interval->format('%h');

            $minutesDecimal = $minutes / 60;
            $totalHours = $hours + $minutesDecimal;
            $totalHours = number_format($totalHours, 2); // Optional rounding
            // Use $totalHours as needed
            return $totalHours;
        }

        function convert_into_fraction($time)
        {
            return date('H', $time) + (date('i', $time) / 60);
        }

        function calculateHoursMorning($shift_start, $shift_end, $start, $end, $actual_start, $actual_end)
        {
            if (($shift_start >= $start && $shift_start < $end) && ($shift_end > $start && $shift_end <= $end)) {
                $startDateTime = strtotime($actual_start);
                $endDateTime = strtotime($actual_end);
                return abs(($endDateTime - $startDateTime) / (60 * 60));
                // return $hoursDifference = $actual_end->diffInHours($actual_start);
                // return $shift_end - $shift_start;
            } elseif (($shift_start >= $start && $shift_start < $end) && ($shift_end > $start && $shift_end > $end)) {
                $shift_end = $end;
                return $shift_end - $shift_start;
            } elseif (($shift_start > $start && $shift_start > $end) && ($shift_end > $start && $shift_end <= $end)) {
                $shift_start = $start;
                return $shift_end - $shift_start;
            } elseif (($shift_start < $start && $shift_start < $end) && ($shift_end > $start && $shift_end <= $end)) {
                $shift_start = $start;
                return $shift_end - $shift_start;
            } elseif ($shift_start >= $end && $shift_end > $start && $shift_end < $end) {
                // shift start in night in gone into day
                // echo 'Here';
                return $shift_end - $start;
            } elseif ($shift_start < $start && $shift_end > $end) {
                return $end - $start;
            } elseif ($shift_start > $start && $shift_end < $end) {
                // if ($shift_start >= $start && $shift_end <= $end) {
                //     return 0;
                // }
                return $end - $shift_start;
            } else {
                return 0;
            }
        }

        public function getJobHistory(Request $request)
        {
            $request->validate([
                'customer_id' => 'required|integer',
            ]);

            $userId = $request->user_id;

            $jobs = DB::table('job_rosters')
                ->join('sites', 'sites.id', '=', 'job_rosters.site_id')
                ->join('users', 'users.id', '=', 'sites.user_id')
                ->leftJoin('users', 'users.id', '=', 'job_rosters.assigned_to')
                ->where('sites.user_id', $userId)
                ->select(
                    'job_rosters.*',
                    'sites.site_name',
                    'users.name as user_name',
                    DB::raw("CASE WHEN users.id IS NOT NULL THEN CONCAT(users.name,) ELSE 'N/A' END as guard_name")
                )
                ->orderBy('job_rosters.start', 'asc')
                ->get();

            if ($jobs->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No jobs found for this customer',
                    'data'    => []
                ], 200);
            }

            return response()->json([
                'success' => true,
                'message' => 'Customer job history fetched successfully',
                'data'    => $jobs
            ], 200);
        }

        public function jobStatusCountByCustomer(Request $request)
        {
            $customerId = $request->customer_id;

            $counts = JobRoster::join('job_new_roster', 'job_rosters.roster_id', '=', 'job_new_roster.id')
                ->whereJsonContains('job_new_roster.customer_id', [$customerId])
                ->selectRaw("
                    SUM(CASE WHEN job_rosters.job_status = 'pending' THEN 1 ELSE 0 END) AS pending,
                    SUM(CASE WHEN job_rosters.job_status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
                    SUM(CASE WHEN job_rosters.job_status = 'accepted' THEN 1 ELSE 0 END) AS accepted,
                    COUNT(job_rosters.id) AS total
                ")->first();

            return response()->json([
                'success'   => true,
                'customer_id' => $customerId,
                'data' => [
                    'pending'   => (int) $counts->pending,
                    'confirmed' => (int) $counts->confirmed,
                    'accepted'  => (int) $counts->accepted,
                    'total'     => (int) $counts->total,
                ]
            ]);
        }

        public function uploadFile(Request $request)
        {
            $folder = $request->folder ?: 'uploads';
            $inputKey = $request->hasFile('upload') ? 'upload' : 'file';

            if (!$request->hasFile($inputKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No file provided'
                ], 400);
            }

            $files = $request->file($inputKey);
            $files = is_array($files) ? $files : [$files];

            $uploadedFiles = [];

            foreach ($files as $file) {
                $image = fileUpload($file, '/' . $folder . '/');

                if ($image) {
                    $uploadedFiles[] = [
                        'path' => $image,
                        'url'  => asset($folder . '/' . $image),
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data'    => count($uploadedFiles) === 1 ? $uploadedFiles[0] : $uploadedFiles
            ]);
        }

        public function accept_asap_job(Request $request, $id)
        {
            $a = null;
            $b = '';
            $roster = DB::table('job_rosters')
                ->join('sites', 'sites.id', '=', 'job_rosters.site_id')
                ->where('job_rosters.asap', '=', '1')
                ->where('job_rosters.id', '=', $request->input('roster_id'))
                ->where(function ($query) use ($a, $b) {
                    $query->whereNull('job_rosters.assigned_to')
                        ->orWhere('job_rosters.assigned_to', '=', $b);
                })
                ->where(function ($query) use ($b) {
                    $query->whereNull('job_rosters.accepted_by')
                        ->orWhere('job_rosters.accepted_by', '=', $b);
                })
                ->select('job_rosters.*', 'sites.id as jobId', 'sites.address', 'sites.coordinates')
                ->first();

            if ($roster != null) {

              // Check if already assigned to someone else
                if (!is_null($roster->assigned_to) && $roster->assigned_to != '') {
                    return response()->json([
                        'success' => false,
                        'message' => 'This job has already been assigned to someone else.'
                    ], 200);
                }

                // Check if accepted_by is already set (contractor accepted)
                // if (!is_null($roster->accepted_by) && $roster->accepted_by != '') {
                //     return response()->json([
                //         'success' => false,
                //         'message' => 'This job has already been accepted by a contractor.'
                //     ], 200);
                // }

                $user = User::where('id', $id)->first();
                if($user->user_type == "staff"){
                    $today = $roster->start;
                    $todayAssignedJobs = JobRoster::where('assigned_to', $user->id)
                        ->whereDate('start', $today)
                        ->get();

                    $jobsCountToday = $todayAssignedJobs->count();
                    $hoursToday = $this->calculateTotalHours($todayAssignedJobs);
                    if($jobsCountToday >= 2){
                        return response()->json([
                            'success' => false,
                            'message' => 'Daily limit exceeded (Already have 2 jobs).'
                        ], 200);
                    }
                    elseif($hoursToday > 12){
                        return response()->json([
                            'success' => false,
                            'message' => 'Daily limit exceeded (12 hours).'
                        ], 200);
                    }
                }

                if (!$this->canAcceptJob($id, $roster->start, $roster->end)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Staff must complete 8 hours rest before accepting this shift.'
                    ]);
                }   

                $rosterStart = Carbon::parse($roster->start);
                $weekStart = $rosterStart->copy()->startOfWeek();
                $weekEnd   = $rosterStart->copy()->endOfWeek();

                $currentWeekHours = DB::table('job_rosters')
                    ->where('assigned_to', $id)
                    ->whereBetween('start', [$weekStart, $weekEnd])
                    ->sum('hours');

                $currentWeekHours = $currentWeekHours ?? 0;
                $currentJobHours = $roster->hours ?? 0;
                $totalHours = $currentWeekHours + $currentJobHours;

                $user = \App\Models\User::with('staff')->find($id);

                if (!$user || !$user->staff) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Staff data not found.'
                    ], 200);
                }

                $visaType = $user->staff->staff_document_type;

                if ($visaType === 'student_visa') {
                    if ($totalHours > 24) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Weekly limit exceeded (24 hours for student visa).'
                        ], 200);
                    }
                } else {
                    if ($totalHours > 38) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Weekly limit exceeded (38 hours allowed).'
                        ], 200);
                    }
                }
                $flag = 0;
                $is_already_assign = DB::table('job_rosters')
                    ->where('assigned_to', $id)
                    ->whereBetween('start', [$roster->start, $roster->end])
                    ->select('job_rosters.*')->first();
                if ($is_already_assign != null) {
                    $flag = 1;
                } else {
                    $is_already_assign = DB::table('job_rosters')
                        ->where('assigned_to', $id)
                        ->whereBetween('end', [$roster->start, $roster->end])
                        ->select('job_rosters.*')->first();
                    if ($is_already_assign != null) {
                        $flag = 1;
                    }
                }
                if ($flag == 0) {
                    DB::table('job_rosters')
                        ->where('id', '=', $request->input('roster_id'))
                        ->update(['assigned_to' => $id, 'publish_status' => 1, 'job_status' => 'confirmed']);
                    // Get guard details
                    $guard = DB::table('users')->where('id', $id)->first();

                    // ============ PUSH NOTIFICATIONS ============
                    // 1. Send notification to Client (created_by)
                    $client = DB::table('users')
                        ->where('notification_token', '!=', '')
                        ->where('id', '=', $roster->created_by)
                        ->select('notification_token', 'name')
                        ->first();

                    // Only send if client exists and has notification token
                    if ($client && !empty($client->notification_token)) {
                        $notification_data = [
                            'message' => $guard->name . ' accepted and confirmed the job.',
                            'title' => 'Job Signin',
                            'notification_token' => $client->notification_token,
                            'page' => 'my-job-applications',
                            'roster_id' => $id
                        ];
                        send_push_notification($notification_data);
                    }

                    return response()->json([
                        'success' => true,
                        'message' => 'Job accept successfully.',
                    ], 200);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'These timings are contradicting with other site timings because this guard is already added in another site.'
                    ], 200);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Job already accepted!'
                ], 200);
            }
        }

        public function canAcceptJob($guardId, $newShiftStart, $newShiftEnd)
        {
            $newShiftStart = Carbon::parse($newShiftStart);
            $newShiftEnd   = Carbon::parse($newShiftEnd);
            
            // Check previous shift (8 hours rest before new shift)
            $previousShift = DB::table('job_rosters')
                ->where('assigned_to', $guardId)
                ->where('end', '<=', $newShiftStart)
                ->orderBy('end', 'desc')
                ->first();
            
            if ($previousShift) {
                $previousEnd = Carbon::parse($previousShift->end);
                
                // Calculate hours between previous shift end and new shift start
                $restHours = $previousEnd->diffInHours($newShiftStart);
                
                // If rest hours is less than 8, cannot accept
                if ($restHours < 8) {
                    return false;
                }
            }
            
            // Check next shift (8 hours rest after new shift)
            $nextShift = DB::table('job_rosters')
                ->where('assigned_to', $guardId)
                ->where('start', '>=', $newShiftEnd)
                ->orderBy('start', 'asc')
                ->first();
            
            if ($nextShift) {
                $nextStart = Carbon::parse($nextShift->start);
                
                // Calculate hours between new shift end and next shift start
                $restHours = $newShiftEnd->diffInHours($nextStart);
                
                // If rest hours is less than 8, cannot accept
                if ($restHours < 8) {
                    return false;
                }
            }
            
            return true;
        }
        
        public function jobSignin(Request $request, $id)
        {

            // $this->request = $request;
            // $this->setValidationRules(['time' => 'required', 'selfie' => 'required', 'location' => 'required']);
            // if ($this->isValidRequest()) {
            // $this->response = ['success' => false, 'error' => $this->getErrors()];
            // $this->statusCode = self::STATUS_CODE_200;
            // return $this->sendResponse();
            // }

            $job = JobRoster::where('id', $id)->with('site', 'guards')->first();
            if (!$job || !$job->site) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job or site not found.',
                    'code' => 404
                ], 404);
            }

            $roster_data = JobRoster::where('id', $id)->first();

            try {

                Stripe::setApiKey(config('services.stripe.secret'));

                // if (!$roster_data || !$roster_data->payment_intent_id) {
                //     return response()->json([
                //         'success' => true,
                //         'message' => 'Job completed (no payment linked)'
                //     ]);
                // }

                // ─── CAPTURE ONLY ONCE (FOR ALL JOBS) ───
                if ($roster_data->payment_captured == 0) {

                    $paymentIntent = PaymentIntent::retrieve($job->payment_intent_id);

                    if ($paymentIntent->status == 'requires_capture') {
                        $capturedIntent = $paymentIntent->capture();

                        $chargeId = $capturedIntent->latest_charge ?? null;

                        Transaction::where('payment_intent_id', $paymentIntent->id)
                            ->update([
                                'status'    => 'captured',
                                'charge_id' => $chargeId,
                                'response'  => json_encode($capturedIntent),
                            ]);
                    }
                    

                    // mark ALL related jobs as captured
                    DB::table('job_rosters')
                        ->where('payment_intent_id', $job->payment_intent_id)
                        ->update(['payment_captured' => 1
                    ]);

                    DB::table('job_rosters')->where('id', $id)->update([
                    'payment_status' => 'paid'
                    ]);
                }

            } catch (\Exception $e) {
                // log error but don't break job completion
                Log::error('Stripe Error: ' . $e->getMessage());
                Transaction::where('payment_intent_id', $job->payment_intent_id)
                ->update([
                    'status' => 'failed'
                ]);
            }

            $job_start_time = $roster_data->start;
            $job_start_time = strtotime($job_start_time);

            if ($request->has('signin_time')) {
                $current_time = $request->input('signin_time');
                $current_time = strtotime($current_time);
            } else {
                $current_time = time();
            }
            $diff = round(($job_start_time - $current_time) / 60, 2);

            if ($request->input('location') == null || $request->input('location') == '') {

                return response()->json(['success' => false, 'message' => 'Please send coordinates.', 'code' => 404]);
            }

            $coordsString = $job->guards->current_coordinates ?? $job->guards->coordinates ?? '0,0';
                
            $coordinates = explode(',', $coordsString);

            if ($job->site->coordinates == null ||  $job->site->coordinates == '') {
                return response()->json(['success' => false, 'message' => 'Location coordinates not set.', 'code' => 404]);
            }

            $coordinates1 = explode(',', $job->site->coordinates);

            $distance = $this->distance(trim($coordinates[0]), trim($coordinates[1]), trim($coordinates1[0]), trim($coordinates1[1]));
            if ($job->site->signin_radius > 0) {
                $signin_radius = $job->site->signin_radius / 1000;
            } else {
                $signin_radius = 0.31;
            }
            if ($distance > $signin_radius) {
                return response()->json(['success' => false, 'error' => 'You are ' . number_format($distance, 2) . ' km away from your job!', 'message' => 'You are ' . number_format($distance, 2) . ' km away from your job!', 'code' => 404]);
            }
            $is_already_signin = JobRosterActivity::where(['job_roster_id' => $id])->first();
            if (!empty($is_already_signin)) {
                return response()->json(['success' => false, 'error' => 'You are already signin in this job!', 'message' => 'You are already signin in this job!', 'code' => 404]);
            }

            $field = 'selfie';
            $media = '';

            $media = $this->uploader_base64($request->input($field));

            $update_status = JobRosterActivity::where('job_roster_id', $id)
                ->where('guard_id', $roster_data->assigned_to)
                ->where('status', 1)
                ->first();

            if ($update_status) {
                JobRosterActivity::where('job_roster_id', $id)
                    ->where('guard_id', $roster_data->assigned_to)
                    ->update(['status' => 0]);
            }

            $dateTime = DateTime::createFromFormat('d-m-Y H:i', $request->input('time'));
            $usFormat = $dateTime->format('m/d/Y h:i A');
            $model = JobRosterActivity::insert([
                'guard_id' => $roster_data->assigned_to,
                'job_roster_id' => $id,
                'job_incident_report_id' => null,
                'signin_time' => $usFormat,
                'signin_selfie' => $media,
                'location' => $request->input('location'),
                'status' => 1,
                'signin_notes' => $request->filled('notes') ? $request->input('notes') : null,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::table('job_rosters')->where(['id' => $id])->update(['signin_status' => 1]);
            $guard = DB::table('users')->where('id', $roster_data->assigned_to)->first();
            $inputTime = DateTime::createFromFormat('d-m-Y H:i', $request->input('time'));
            $inputTimeFormatted = $inputTime->format('Y-m-d H:i');
            if ($inputTimeFormatted <= $roster_data->start) {
                // DB::table('job_rosters')->where(['id' => $id])->update(['in_paysheet' => 1]);
            }

            if ($model) {

                $roster = DB::table('job_rosters')->where('id', $id)->first();

                $admins = DB::table('users')->where('notification_token', '!=', '')->where('id', $roster->created_by)->select('notification_token')->get();
                foreach ($admins as $a) {
                    $notification_data = [
                        'message' => $guard->name . ' signin in their job.',
                        'title' => 'Job Signin',
                        'notification_token' => $a->notification_token,
                        'page' => 'my-job-applications',
                        'roster_id' =>  $id
                    ];
                    send_push_notification($notification_data);
                }
                return response()->json([
                    'success' => true,
                    'message' => 'Clocked-in Successfully!'
                ], 200);
            }

            return response()->json([
                'success' => true,
                'message' => 'You are not Check-in your job.'
            ], 200);
        }

        function distance($lat1, $lon1, $lat2, $lon2)
        {
            $lat1 = doubleval($lat1);
            $lon1 = doubleval($lon1);
            $lat2 = doubleval($lat2);
            $lon2 = doubleval($lon2);

            $theta = $lon1 - $lon2;
            $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
            $dist = acos($dist);
            $dist = rad2deg($dist);
            $miles = $dist * 60 * 1.1515;
            $miles = $miles * 1.609;
            return $miles;
        }

        private function uploader_base64($file, $folder = 'uploads')
        {
            try {
                // $destinationPath =  rtrim('../../uploads/');
                $public_path =  rtrim(app()->basePath('public/'), '');
                // $public_path = str_replace('portal/public', '', $public_path);
                // $public_path = str_replace('apis/public', '', $public_path);
                // $public_path = str_replace('https://apis.staffoo.com.au/', 'apis.247staffingsolutions.com.au/public', $public_path);
                $destinationPath = $public_path . $folder . '/';
                if (!is_dir($destinationPath)) {
                    @mkdir($destinationPath, 0755, true);
                }

                $newName = Str::random(25);

                $fileName = $newName . '.jpg';


                $file = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $file));
                file_put_contents($destinationPath . $fileName, $file);

                return $fileName;
            } catch (\Exception $e) {
                echo $e->getMessage();
            }
        }

        public function getGuardJobs(Request $request, $type, $duration)
        {
            $week    = ($request->input('week_no') != null) ? $request->input('week_no') : 0;
            $guardId = $request->input('guard_id');

            $guard = DB::table('users')->where('id', $request->input('guard_id'))->first();

            if($guard->user_type == 'staff'){
                $model = JobRoster::with('guards', 'rosterActivity', 'site', 'jobRosterTask');
                if ($week < 0) {
                    $model->where(['publish_status' => 1, 'assigned_to' => $guardId]);
                } else {
                    $model->where(['publish_status' => 1, 'job_status' => $type, 'assigned_to' => $guardId]);
                }
            }else{
                $model = JobRoster::with('guards', 'rosterActivity', 'site');
                if ($week < 0) {
                $model->where(['accepted_by' => $guardId]);
                } else {
                    $model->where(['accepted_by' => $guardId]);
                }
            }


            switch ($duration) {
                case 'today':
                    if ($type == 'confirmed') {
                        $now   = date('Y-m-d H:i:s');
                        $start = strtotime($now) - (60 * 60 * 15);
                        if (date('d', time()) == date('d', $start)) {
                            $start = date('Y-m-d 00:00:00', time());
                            $end   = date('Y-m-d 23:59:59', time());
                            $model->whereBetween('start', [$start, $end]);
                        } else {
                            $start = date('Y-m-d 00:00:00', time());
                            $end   = date('Y-m-d 23:59:59', time());
                            $model->where(function ($query) use ($start, $end) {
                                $query->whereBetween('start', [$start, $end])
                                    ->orWhereBetween('end', [$start, $end]);
                            });
                        }
                    } else {
                        $model->whereDate('start', Carbon::today());
                    }
                    break;

                case 'week':
                    if ($type == 'completed') {
                        if ($week == 0) {
                            $model->whereBetween('start', [
                                Carbon::now()->startOfWeek(),
                                Carbon::parse('next monday')->toDateString()
                            ]);
                        } else {
                            $startofweek = strtotime(Carbon::now()->startOfWeek()) + (60 * 60 * 24 * 7 * $week) + 3600;
                            $endofweek   = strtotime(Carbon::now()->endOfWeek())   + (60 * 60 * 24 * 7 * $week) + 3600;
                            $model->where('start', '>=', date('Y-m-d 00:00:00', $startofweek));
                            $model->where('start', '<=', date('Y-m-d 23:59:59', $endofweek));
                        }
                    } else {
                        if ($week == 0) {
                            $model->whereBetween('start', [
                                Carbon::now(),
                                Carbon::parse('next monday')->toDateString()
                            ]);
                            $model->whereDate('start', '!=', Carbon::now()->toDateString());
                        } else {
                            $startofweek = strtotime(Carbon::now()->startOfWeek()) + (60 * 60 * 24 * 7 * $week) + 3600;
                            if ($week > 0) {
                                $endofweek = strtotime(Carbon::now()->endOfWeek()) + (60 * 60 * 24 * 7 * $week);
                            } else {
                                $endofweek = strtotime(Carbon::now()->endOfWeek()) + (60 * 60 * 24 * 7 * $week) + 3600;
                            }
                            $model->where('start', '>=', date('Y-m-d 00:00:00', $startofweek));
                            $model->where('start', '<=', date('Y-m-d 23:59:59', $endofweek));
                            $model->whereDate('start', '!=', Carbon::now()->toDateString());
                        }
                    }
                    break;

                case 'month':
                default:
                    $model->whereMonth('start', date('m'));
                    $model->whereYear('start', date('Y'));
                    break;
            }

            $model->orderBy('start', 'asc');
            $results = $model->paginate(15);

            $data = $results->map(function ($item) {
                if (!$item) return [];

                $roster = JobRosterActivity::where(['guard_id' => $item->assigned_to, 'job_roster_id' => $item->id])
                    ->get();

                $signin_status    = 0;
                $signout_time     = null;
                $completed_status = 0;

                foreach ($roster as $ros) {
                    $signin_status = $ros->status;
                    $signout_time  = $ros->signout_time;
                    if ($signout_time != null) {
                        $completed_status = 1;
                    }
                }

                if (!empty($item->rosterActivity) && $item->rosterActivity->signin_selfie != null) {
                    $item->rosterActivity->signin_selfie = 'https://apis.staffo.com.au/uploads/' . $item->rosterActivity->signin_selfie;
                }
                if (!empty($item->rosterActivity) && $item->rosterActivity->signout_selfie != null) {
                    $item->rosterActivity->signout_selfie = 'https://apis.staffo.com.au/uploads/' . $item->rosterActivity->signout_selfie;
                }

                $signin_timez = !empty($item->rosterActivity) ? strtotime($item->rosterActivity->signin_time) : null;

                return [
                    'id'                    => $item->id,
                    'event_id'              => $item->id,
                    'guard_id'              => $item->assigned_to,
                    'job_id'                => $item->site_id,
                    'description'           => $item->description,
                    'document_list'         => $item->document_list,
                    // 'break_status'          => $item->break_status,
                    'instructions_file'     => $item->instructions_file != '' ? 'https://' . request()->getHttpHost() . '/uploads/' . $item->instructions_file : "",
                    'job_start_day'         => date('d', strtotime($item->start)),
                    'job_start_date'        => date('D', strtotime($item->start)),
                    'job_start_month'       => date('M', strtotime($item->start)),
                    'job_start_year'        => date('Y', strtotime($item->start)),
                    'job_end_day'           => date('d', strtotime($item->end)),
                    'job_end_date'          => date('D', strtotime($item->end)),
                    'job_end_month'         => date('M', strtotime($item->end)),
                    'job_end_year'          => date('Y', strtotime($item->end)),
                    'temp_date'             => $item->start,
                    'start'                 => date('d-m-Y H:i:s', strtotime($item->start)),
                    'end'                   => date('d-m-Y H:i:s', strtotime($item->end)),
                    'publish_status'        => $item->publish_status,
                    'add_status'            => $item->add_status,
                    'job_status'            => $item->job_status,
                    'shift_instructions'    => $item->shift_instructions ?? '',
                    'signin_status'         => $signin_status,
                    'completed_status'      => $completed_status,
                    'site'                   => $item->site,
                    'guard'                 => $item->guards,
                    'is_document'           => $item->is_document,
                    'job_roster_activities' => $item->rosterActivity,
                    'job_roster_task'       => $item->jobRosterTask,
                    'signin_time'           => $signin_status == 1 ? date("m-d-Y H:i", $signin_timez) : null,
                ];
            });

            $week_start = strtotime(Carbon::now()->startOfWeek());
            $week_end   = strtotime(Carbon::now()->endOfWeek());

            if ($week != 0) {
                $week_start = strtotime(Carbon::now()->startOfWeek()) + (60 * 60 * 24 * 7 * $week) + 3600;
                $week_end   = strtotime(Carbon::now()->endOfWeek())   + (60 * 60 * 24 * 7 * $week) - 3600;
            }

            $count   = $results->total();
            $message = $count == 0 ? 'No Record Found.' : 'Data Received';

            return response()->json([
                'data'       => $data,
                'message'    => $message,
                'start_date' => date('Y-m-d H:i:s', $week_start),
                'end_data'   => date('Y-m-d H:i:s', $week_end),
                'now'        => Carbon::now()->startOfWeek(),
                'end'        => Carbon::now()->endOfWeek(),
                'success'    => true,
                'code'       => 200,
                'meta'       => [
                    'host_url'     => url('/'),
                    'total'        => $count,
                    'request_time' => time(),
                ],
            ], 200);
        }

        public function jobSpecificDetail(Request $request, $id)
        {
            // $results = $this->jobRosterRepo->jobSpecificDetail(($this->currentUser) ? $this->currentUser->id : [], $id);
            // return new JobRosterCollection(JobRosterResource::collection($results));
        }

        public function reportIncident(Request $request, $id)
        {
            $media = array();
            if ($request->input('photo')) {
                $photo = $request->input('photo');
                if (is_array($photo) && !empty($photo)) {
                    foreach ($photo as $key => $value) {
                        $newObject = new \stdClass();
                        $newObject->imgPath = $this->uploader_base64($value['imgPath'], 'incident');
                        $newObject->timestamp = $value['timestamp'];
                        $media[] = $newObject;
                    }
                }
            }

            $signature = '';
            if ($request->input('signature')) {
                $signature = $this->uploader_base64($request->input('signature'), 'incident');
            }

            // Prepare data with proper JSON encoding for array/object fields
            $data = array(
                'job_id' => $id,
                'guard_id' => $request->input('guard_id'),
                'roster_id' => $request->input('roster_id'),
                'incident_date' => $request->input('date'),
                'incident_time' => $request->input('time'),
                'site_name' => $request->input('site_name'),
                'injury_type' => $request->input('injury_type'),
                'injury_detail' => $request->input('incident_detail'),
                'people_involved' => $this->encodeJsonField($request->input('people_involved')),
                'vehicle' => $this->encodeJsonField($request->input('vehicle')),
                'emergency_services' => $this->encodeJsonField($request->input('emergency_services')),
                'wittness' => $this->encodeJsonField($request->input('wittness')),
                'photo' => $this->encodeJsonField($media),
                'signature' => $signature
            );

            // Insert the data
            try {
                $job_incident_report_id = DB::table('incident_reports')->insertGetId($data);

                // Rest of your code remains the same
                $guard = DB::table('users')->where('id', $request->input('guard_id'))->first();
                $job = DB::table('sites')->where('id', $id)->first();
                $roster = DB::table('job_rosters')->where('id', $request->input('roster_id'))->first();
                $main_roster = DB::table('job_new_roster')->where('id', $roster->roster_id)->first();

                DB::table('job_roster_activities')
                    ->where('job_roster_id', $request->input('roster_id'))
                    ->where('guard_id', $request->input('guard_id'))
                    ->update(['job_incident_report_id' => $job_incident_report_id]);

                // Push notification
                $admins = DB::table('users')
                    ->where('notification_token', '!=', '')
                    ->where('id', $roster->created_by)
                    ->select('notification_token')
                    ->get();

                foreach ($admins as $a) {
                    $notification_data = [
                        'message' => $guard->name . ' report new incident.',
                        'title' => 'Incident Report',
                        'notification_token' => $a->notification_token,
                        'page' => 'my-job-applications',
                        'roster_id' =>  $id
                    ];
                    send_push_notification($notification_data);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Incident reported successfully!'
                ], 200);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error creating incident report',
                    'error' => $e->getMessage(),
                    'data' => $data // For debugging
                ], 500);
            }
        }

        /**
         * Helper function to properly encode fields that might be arrays/objects
         */
        private function encodeJsonField($field)
        {
            if (is_null($field)) {
                return json_encode([]);
            }

            if (is_array($field) || is_object($field)) {
                return json_encode($field);
            }

            // If it's already a string, check if it needs cleaning
            if (is_string($field)) {
                // Clean up empty array strings
                $cleaned = str_replace(['[{}]', '{}'], '[]', $field);
                return $cleaned;
            }

            return json_encode([]);
        }

        public function addFootPatrolReport(Request $request, $id)
        {
            if (!isset($id) || $id == 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Site not found'
                ], 500);
            }

            $media = array();
            if ($request->input('photo')) {
                $photo = json_decode($request->input('photo'), true);
                if (is_array($photo) && !empty($photo)) {
                    foreach ($photo as $key => $value) {
                        $newObject = new \stdClass();
                        $newObject->imgPath = $this->uploader_base64($value['imgPath'], 'footpatrol');
                        $newObject->timestamp = $value['timestamp'];
                        $media[] = $newObject;
                    }
                }
            }
            $signature = '';
            if ($request->input('signature')) {
                $signature = $this->uploader_base64($request->input('signature'), 'footpatrol');
            }
            $data = array(
                'job_id' => $id,
                'guard_id' => $request->input('guard_id'),
                'roster_id' => $request->input('roster_id'),
                'date' => $request->input('date'),
                'time' => $request->input('time'),
                'patrolling_detail' => $request->input('patrolling_detail'),
                'site_name' => $request->input('site_name'),
                'photo' => json_encode($media),
                'signature' => $signature
            );
            $job_patrol_report_id = DB::table('foot_patrol_reports')->insertGetId($data);

            $guard = DB::table('users')->where('id', $request->input('guard_id'))->first();
            $job = DB::table('sites')->where('id', $id)->first();
            $roster = DB::table('job_rosters')->where('id', $request->input('roster_id'))->first();
            $main_roster = DB::table('job_new_roster')->where('id', $roster->roster_id)->first();

            DB::table('job_roster_activities')->where('job_roster_id', $request->input('roster_id'))->where('guard_id', $request->input('guard_id'))->update(['job_patrol_report_id' => $job_patrol_report_id]);

            //push notification
            $admins = DB::table('users')->where('notification_token', '!=', '')->where('id', $roster->created_by)->select('notification_token')->get();
            foreach ($admins as $a) {
                $notification_data = [
                    'message' => $guard->name . ' report new foot patrol.',
                    'title' => 'Foot Patrol Report',
                    'notification_token' => $a->notification_token,
                    'page' => 'my-job-applications',
                    'roster_id' =>  $id
                ];
                send_push_notification($notification_data);
            }

            return response()->json([
                'success' => true,
                'message' => 'Foot Patrol reported successfully!'
            ], 200);
        }

        public function jobSignout(Request $request, $id)
        {
            $field = 'selfie';
            $media = $this->uploader_base64($request->input($field));

            $signout_location = $request->location ?? '';

            $dateTime = DateTime::createFromFormat('d-m-Y H:i', $request->input('time'));
            $usFormat = $dateTime->format('m/d/Y h:i A');

            $roster = DB::table('job_rosters')->where('id', $id)->first();

            $model = DB::table('job_roster_activities')->updateOrInsert(
                [
                    'guard_id' => $roster->assigned_to,
                    'job_roster_id' => $id
                ],
                [
                    'signout_time'     => $usFormat,
                    'signout_selfie'   => $media,
                    'status'           => 0,
                    'signout_location' => $signout_location,
                    'signout_notes'    => $request->input('notes') ?? '',
                    'updated_at'       => now()
                ]
            );

            if (!$model) {
                return response()->json([
                    'success' => false,
                    'message' => 'Signout failed'
                ], 400);
            }

            DB::table('job_rosters')->where('id', $id)->update([
                'job_status' => 'completed',
                'signin_status' => 0
            ]);

            $guard = DB::table('users')->where('id', $roster->assigned_to)->first();

            $admins = DB::table('users')
                ->where('notification_token', '!=', '')
                ->where('id', $roster->created_by)
                ->select('notification_token')
                ->get();

            foreach ($admins as $a) {
                $notification_data = [
                    'message' => $guard->name . ' signout in their job.',
                    'title' => 'Job Signout',
                    'notification_token' => $a->notification_token,
                    'page' => 'my-job-applications',
                    'roster_id' => $id
                ];
                send_push_notification($notification_data);
            }

            if ($roster->payment_intent_id) {
            $transaction = Transaction::where('payment_intent_id', $roster->payment_intent_id)->first();
    
            if ($transaction && $transaction->balance > 0 && $transaction->balance_status === 'pending') {
                    $jobIds = json_decode($transaction->job_roster_id, true) ?? [];
        
                    $allCompleted = !empty($jobIds) && DB::table('job_rosters')
                        ->whereIn('id', $jobIds)
                        ->where('job_status', '!=', 'completed')
                        ->doesntExist();
        
                    if ($allCompleted) {
                        $this->chargeRemainingBalance($transaction);
                    }
                }
            }

            // ─── FINAL RESPONSE ───────────────────────
            return response()->json([
                'success' => true,
                'message' => 'Clocked-out Successfully & Payment processed!'
            ], 200);
        }

        private function chargeRemainingBalance(\App\Models\Transaction $transaction): void
        {
            // Atomic claim — stops two near-simultaneous signouts from double-charging
            $claimed = DB::table('transactions')
                ->where('id', $transaction->id)
                ->where('balance_status', 'pending')
                ->update(['balance_status' => 'processing']);
        
            if (!$claimed) {
                return; // someone else already claimed it
            }
        
            try {
                Stripe::setApiKey(config('services.stripe.secret'));
        
                $originalIntent = PaymentIntent::retrieve($transaction->payment_intent_id);
                $balanceInCents = (int) round($transaction->balance * 100);
        
                $balanceIntent = PaymentIntent::create([
                    'amount'         => $balanceInCents,
                    'currency'       => 'aud',
                    'customer'       => $originalIntent->customer,
                    'payment_method' => $originalIntent->payment_method,
                    'off_session'    => true,
                    'confirm'        => true,
                    'capture_method' => 'automatic',
                ]);
        
                DB::table('transactions')->where('id', $transaction->id)->update([
                    'balance_payment_intent_id' => $balanceIntent->id,
                    'balance_status'            => $balanceIntent->status === 'succeeded' ? 'charged' : 'failed',
                    'balance_charged_at'        => now(),
                    'status'                    => $balanceIntent->status === 'succeeded' ? 'completed' : 'partially_captured',
                ]);
        
                if ($balanceIntent->status === 'succeeded') {
                    $this->sendBalanceInvoice($transaction->fresh(), $balanceIntent->id);
                }
        
            } catch (\Stripe\Exception\CardException $e) {
                // Card failed off-session — e.g. expired, insufficient funds, or
                // bank demands 3DS re-authentication. Flag for manual follow-up.
                DB::table('transactions')->where('id', $transaction->id)->update(['balance_status' => 'failed']);
                Log::channel('daily')->error('[Balance Charge] Card declined', [
                    'transaction_id' => $transaction->id,
                    'error'          => $e->getMessage(),
                ]);
        
            } catch (\Exception $e) {
                DB::table('transactions')->where('id', $transaction->id)->update(['balance_status' => 'failed']);
                Log::channel('daily')->error('[Balance Charge] Failed', [
                    'transaction_id' => $transaction->id,
                    'error'          => $e->getMessage(),
                ]);
            }
        }
        
        private function sendBalanceInvoice(\App\Models\Transaction $transaction, string $balanceIntentId): void
        {
            try {
                $user = User::find($transaction->user_id);
                if (!$user) return;
        
                $invoiceData = [
                    'invoice_number'    => 'ST-' . strtoupper(substr($balanceIntentId, -8)) . '-FINAL',
                    'date'              => now()->format('d M Y'),
                    'client_name'       => $user->name,
                    'client_email'      => $user->email,
                    'payment_intent_id' => $balanceIntentId,
                    'payment_option'    => 'split-final',
                    'amount_charged'    => $transaction->balance,
                    'grand_total'       => $transaction->total_amount,
                ];
        
                $pdfBytes  = app(\App\Services\InvoiceService::class)->generatePdf($invoiceData);
                $pdfBase64 = base64_encode($pdfBytes);
        
                $this->saveInvoicePdf($pdfBytes, $invoiceData['invoice_number'], $user->name, $balanceIntentId);
        
                Mail::to($user->email)->queue(new \App\Mail\InvoiceMail(
                    pdfBase64:     $pdfBase64,
                    invoiceNumber: $invoiceData['invoice_number'],
                    clientName:    $user->name,
                    isAdmin:       false,
                ));
        
                $admin = User::where('user_type', 'admin')->first();
                if ($admin && $admin->email) {
                    Mail::to($admin->email)->queue(new \App\Mail\InvoiceMail(
                        pdfBase64:     $pdfBase64,
                        invoiceNumber: $invoiceData['invoice_number'],
                        clientName:    $user->name,
                        isAdmin:       true,
                    ));
                }
            } catch (\Exception $e) {
                Log::channel('daily')->error('[Final Invoice] Failed', [
                    'transaction_id' => $transaction->id,
                    'error'          => $e->getMessage(),
                ]);
            }
        }
        
        public function getAllJobs()
        {
            $startOfWeek = now()->startOfWeek();
            $endOfWeek = now()->endOfWeek();

            $jobs = JobRoster::whereNull('assigned_to')
                ->whereBetween('start', [$startOfWeek, $endOfWeek])
                ->where('job_status', 'pending')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $jobs,
                'week_range' => [
                    'start' => $startOfWeek->format('Y-m-d'),
                    'end' => $endOfWeek->format('Y-m-d')
                ],
                'total' => $jobs->count(),
                'message' => 'Current week jobs retrieved successfully'
            ]);
        }

        public function getStaff($id)
        {

            $user = User::findOrFail($id);

            if ($user->user_type === 'customer') {
            } elseif ($user->user_type === 'contractor') {
            } elseif ($user->user_type === 'staff') {
            }
        }

        public function fetchCustomerSites(Request $request)
        {
            if (!$request->has('user_id') || empty($request->user_id)) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'code' => 404
                ]);
            }

            $user = User::where('id', $request->user_id)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'code' => 404
                ]);
            }

            // Date Range
            $start = $request->has('start') && $request->start != ''
                ? dbFormate($request->start) . ' 00:00'
                : Carbon::now()->startOfWeek()->format('Y-m-d 00:00');

            $end = $request->has('end') && $request->end != ''
                ? dbFormate($request->end) . ' 23:59'
                : Carbon::now()->endOfWeek()->format('Y-m-d 23:59');

            $roster_id = $request->roster_id;

            $states = [];
            if ($request->has('states') && !empty($request->states)) {
                // If states is a string (comma-separated), convert to array
                if (is_string($request->states)) {
                    $states = array_map('trim', explode(',', $request->states));
                } 
                // If states is already an array
                else if (is_array($request->states)) {
                    $states = $request->states;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Extract notify_user IDs (only for contractor)
            |--------------------------------------------------------------------------
            */

            $notifyUserIds = [];

            if ($user->user_type === 'contractor') {
                $notifyUserIds = JobRoster::whereBetween('start', [$start, $end])
                    ->where('roster_id', $roster_id)
                    ->pluck('assigned_to')
                    ->unique()
                    ->values()
                    ->toArray();

                if (empty($notifyUserIds)) {
                    return response()->json([
                        'success' => false,
                        'data' => null,
                        'code' => 404
                    ]);
                }

            }

            $contractorUserIds = [];
            $contractorUserIds = User::whereIn('id', $notifyUserIds)
            ->where('user_id', $user->id)
            ->pluck('id')
            ->toArray();

            $siteIds = [];
            if (!empty($states)) {
                $siteIds = Site::whereIn('state', $states)->pluck('id')->toArray();
            }
            /*
            |--------------------------------------------------------------------------
            | Main Query
            |--------------------------------------------------------------------------
            */
            
            $sites = Site::whereHas('jobRoster', function ($q) use ($start, $end, $roster_id, $user, $contractorUserIds) {

                $q->whereBetween('start', [$start, $end])
                    ->where('roster_id', $roster_id);

                if ($user->user_type === 'staff') {
                    $q->where('assigned_to', $user->id);
                }

                if ($user->user_type === 'customer') {
                    $q->where('created_by', $user->id);
                }

                if ($user->user_type === 'contractor') {
                    $q->whereIn('assigned_to', $contractorUserIds)
                    ->orWhere('accepted_by', $user->id);
                }
            });

            if (!empty($states)) {
            $sites->whereIn('state', $states);

            }
            $sites = $sites->with(['jobRoster' => function ($q) use ($start, $end, $roster_id, $user, $contractorUserIds) {
                    $q->whereBetween('start', [$start, $end])
                        ->where('roster_id', $roster_id)
                        ->orderBy('start', 'asc')
                        ->with(['guards.staff', 'customer.customer']);
                        
                    if ($user->user_type === 'staff') {
                        $q->where('assigned_to', $user->id);
                    }

                    if ($user->user_type === 'customer') {
                        $q->where('created_by', $user->id);
                    }

                    if ($user->user_type === 'contractor') {
                        $q->whereIn('assigned_to', $contractorUserIds)
                        ->orWhere('accepted_by', $user->id);

                    }
                }])
                ->get();

            if ($sites->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'code' => 404
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Unpublished Shift Count
            |--------------------------------------------------------------------------
            */

            $unpublishCountQuery = JobRoster::whereBetween('start', [$start, $end])
                ->where('roster_id', $roster_id)
                ->whereNotNull('assigned_to')
                ->where('publish_status', 0)
                ->when($user->user_type === 'staff', function ($q) use ($user) {
                    $q->where('assigned_to', $user->id);
                })
                ->when($user->user_type === 'customer', function ($q) use ($user) {
                    $q->where('created_by', $user->id);
                })
                ->when($user->user_type === 'contractor', function ($q) use ($contractorUserIds, $user) {
                    $q->whereIn('assigned_to', $contractorUserIds)
                        ->orWhere('accepted_by', $user->id);

                });

                if (!empty($states)) {
                    $unpublishCountQuery->whereHas('site', function ($q) use ($states) {
                        $q->whereIn('state', $states);
                    });
                }

                $unpublishCount = $unpublishCountQuery->count();

            /*
            |--------------------------------------------------------------------------
            | Daily Hours Calculation
            |--------------------------------------------------------------------------
            */

            $data_arry = [];
            $total_hours = 0;

            $dateRange = getDatesFromRange(
                dbFormate($request->start),
                dbFormate($request->end)
            );

        if ($dateRange) {
                // Base query for hours
                $hoursBaseQuery = JobRoster::where('roster_id', $roster_id)
                    ->when($user->user_type === 'staff', function ($q) use ($user) {
                        $q->where('assigned_to', $user->id);
                    })
                    ->when($user->user_type === 'customer', function ($q) use ($user) {
                        $q->where('created_by', $user->id);
                    })
                    ->when($user->user_type === 'contractor', function ($q) use ($contractorUserIds, $user) {
                        $q->whereIn('assigned_to', $contractorUserIds)
                        ->orWhere('accepted_by', $user->id);
                    });
                
                // Apply state filter to hours base query
                if (!empty($states)) {
                    $hoursBaseQuery->whereHas('site', function ($q) use ($states) {
                        $q->whereIn('state', $states);
                    });
                }
                
                // Get hours grouped by date
                $hoursByDate = (clone $hoursBaseQuery)
                    ->whereBetween('start', [$start, $end])
                    ->selectRaw('DATE(start) as date, SUM(hours) as total_hours')
                    ->groupBy('date')
                    ->get()
                    ->keyBy('date');
                
                foreach ($dateRange as $date) {
                    $formattedDate = dateFormat($date);
                    $dailyHours = isset($hoursByDate[$date]) ? $hoursByDate[$date]->total_hours : 0;
                    
                    $data_arry[$formattedDate] = round($dailyHours, 2);
                    $total_hours += $dailyHours;
                }
            }

            return response()->json([
                'success' => true,
                'data' => $sites,
                'unpublish_shift_count' => $unpublishCount,
                'days_hours' => $data_arry,
                'total_hours' => round($total_hours, 2),
                'code' => 200
            ]);
        }

        public function getJobs(Request $request, $type, $duration, $id)
        {
            $week = ($request->input('week_no') != null) ? $request->input('week_no') : 0;

            // Define constants if not defined elsewhere
            $DURATION_TODAY = 'today';
            $DURATION_WEEK = 'week';
            $DURATION_MONTH = 'month';
            $DEFULT_PAGES = 15; // or whatever your default pagination is

            $model = JobRoster::with('guards', 'rosterActivity', 'site')
                ->where(['publish_status' => 1, 'assigned_to' => $id])
                ->where(function ($que) use ($type) {
                    if ($type == 'incompleted') {
                        $que->orWhere('job_status', 'confirmed');
                        $que->orWhere('job_status', 'pending');
                    } else {
                        $que->orWhere('job_status', $type);
                    }
                });

            switch ($duration) {
                case $DURATION_TODAY:
                    $model->whereDate('start', Carbon::today());
                    break;

                case $DURATION_WEEK:
                    if ($week == 0) {
                        $model->whereBetween('start', [
                            Carbon::now()->startOfWeek(),
                            Carbon::parse('next monday')->toDateString()
                        ]);
                    } else {
                        $startofweek = Carbon::now()->startOfWeek();
                        $endofweek = Carbon::parse('next monday')->toDateString();

                        if ($week > 0) {
                            $startofweek = strtotime("+" . $week . " week", strtotime($startofweek));
                        } else {
                            $startofweek = strtotime("-" . $week . " week", strtotime($startofweek));
                        }

                        if ($week > 0) {
                            $endofweek = strtotime("+" . $week . " week", strtotime($endofweek));
                        } else {
                            $endofweek = strtotime("-" . $week . " week", strtotime($endofweek));
                        }

                        $startofweek = date('Y-m-d H:i', $startofweek);
                        $endofweek = date('Y-m-d H:i', $endofweek);
                        $model->whereBetween('start', [$startofweek, $endofweek]);
                    }
                    break;

                case $DURATION_MONTH:
                    $model->whereMonth('start', date('m'));
                    $model->whereYear('start', date('Y'));
                    break;
            }

            $results = $model->orderBy('start', 'asc')->paginate($DEFULT_PAGES);

            return $results;
        }

        public function start_task(Request $request, $id)
        {
            // $this->setValidationRules(['task_id' => 'required', 'roster_id' => 'required', 'start_time' => 'required', 'location' => 'required']);
            // if ($this->isValidRequest()) {
            //     $this->response = ['success' => false, 'error' => $this->getErrors()];
            //     $this->statusCode = self::STATUS_CODE_200;
            //     return $this->sendResponse();
            // }
            $task = DB::table('job_roster_tasks')->where(['id' => $request->task_id, 'job_roster_id' => $request->roster_id])->first();
            $guard = User::where('id', $id)->first();
            // if ($guard->state != '') {
            //     config(['app.timezone' => $this->timezone[$guard->state]]);
            //     date_default_timezone_set($this->timezone[$guard->state]);
            // }

            $current_time = $this->time_into_decimal(date('H:i', time()));
            $task_time = $this->time_into_decimal(date('H:i', strtotime($task->task_start)));
            $diff = ($current_time - $task_time) * 60;
            if ($diff > 30) {
                return response()->json([
                    'success' => false,
                    'error' => 'You can\'t start a task!',
                    'code' => 200
                ]);
            }
            $active_task = DB::table('job_roster_tasks')->where('start_time', '!=', '')->where('end_time', '=', '')
                ->where('job_roster_id', '=', $request->input('roster_id'))->first();
            if (!empty($active_task)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Please complete you previous task first!',
                    'code' => 200
                ]);
            }

            DB::table('job_roster_tasks')
                ->where(['job_roster_id' => $request->input('roster_id'), 'id' => $request->input('task_id')])
                ->update([
                    'start_time' => $request->input('start_time'),
                    'start_location' => $request->input('location')
                ]);

            $guard = User::where('id', $id)->first();

            $notification = array(
                'guard_id' => $id,
                'record_id' => $request->input('roster_id'),
                'message' => $guard->name . ' start its task.',
                'type' => 'task',
                'send_time' => time(),
                'title' => 'Task start'
            );

            DB::table('roster_complete_activity')->insert([
                'roster_id' => $request->input('roster_id'),
                'activity' => $guard->name . ' start its task.',
                'type' => 'start_task',
                'record_id' => $request->input('task_id'),
                'activity_time' => time(),
                'activity_by' => $id
            ]);

            $roster = DB::table('job_rosters')->where('id', $request->input('roster_id'))->first();
            $admins = DB::table('users')->where('notification_token', '!=', '')->where('id', $roster->created_by)->select('notification_token')->get();
            foreach ($admins as $a) {
                $notification_data = [
                    'message' => $guard->name . ' start its task.',
                    'title' => 'start_task',
                    'notification_token' => $a->notification_token,
                    'page' => 'my-job-applications',
                    'roster_id' =>  $id
                ];
                send_push_notification($notification_data);
            }

            return response()->json([
                'success' => true,
                'message' => 'Task start successfully!',
                'code' => 200
            ]);
        }

        public function end_task(Request $request, $id)
        {

            $imageArray = $request->input('images');

            // $this->setValidationRules(['task_id' => 'required', 'roster_id' => 'required', 'end_time' => 'required', 'location' => 'required']);
            // if ($this->isValidRequest()) {
            //     $this->response = ['success' => false, 'error' => $this->getErrors()];
            //     $this->statusCode = self::STATUS_CODE_200;
            //     return $this->sendResponse();
            // }
            // DB::table('job_new_roster')->where('roster_id', )->update(['job_status' => 'completed']);
            DB::table('job_roster_tasks')
                ->where(['job_roster_id' => $request->input('roster_id'), 'id' => $request->input('task_id')])
                ->update(['end_time' => $request->input('end_time'), 'status' => 'completed', 'end_location' => $request->input('location'), 'note' => $request->input('task_message'), 'task_end_imgs' => !empty($imageArray) ? json_encode($imageArray) : null]);

            $roster = DB::table('job_rosters')->where('id', $request->roster_id)->first();
            $main_roster = DB::table('job_new_roster')->where('id', $roster->roster_id)->first();
            $guard = DB::table('users')->where('id', $id)->first();

            $notification = array(
                'roster' => !empty($main_roster->id) ? $main_roster->id : null,
                'guard_id' => $id,
                'record_id' => $request->input('roster_id'),
                'message' => $guard->name . ' completed its task.',
                'type' => 'end_task',
                'send_time' => time(),
                'title' => 'Task Completion'
            );
            // DB::table('portal_notifications')->insert($notification);

            DB::table('roster_complete_activity')->insert([
                'roster_id' => $request->input('roster_id'),
                'activity' => $guard->name . ' completed its task.',
                'type' => 'end_task',
                'record_id' => $request->input('task_id'),
                'activity_time' => time(),
                'activity_by' => $id
            ]);

            $admins = DB::table('users')->where('notification_token', '!=', '')->where('id', $roster->created_by)->select('notification_token')->get();
            foreach ($admins as $a) {
                $notification_data = [
                    'message' => $guard->name . ' completed its task.',
                    'title' => 'end_task',
                    'notification_token' => $a->notification_token,
                    'page' => 'my-job-applications',
                    'roster_id' =>  $id
                ];
                send_push_notification($notification_data);
            }

            return response()->json([
                'success' => true,
                'message' => 'Task completed successfully!',
                'code' => 200
            ]);
        }

        function time_into_decimal($time)
        {
            $time = explode(':', $time);
            if (isset($time[1])) {
                $time[1] = $time[1] / 60;
            } else {
                $time[1] = 0;
            }
            return ($time[0] * 1) + $time[1];
        }

        public function start_break(Request $request, $id)
        {
            // $this->setValidationRules(['notes' => 'required', 'roster_id' => 'required']);
            // if ($this->isValidRequest()) {
            //     $this->response = ['success' => false, 'error' => $this->getErrors()];
            //     $this->statusCode = self::STATUS_CODE_200;
            //     return $this->sendResponse();
            // }
            $guard = DB::table('users')->where('id', $id)->first();
            // if ($guard->state != '') {
            //     config(['app.timezone' => $this->timezone[$guard->state]]);
            //     date_default_timezone_set($this->timezone[$guard->state]);
            // }
            $job_signin_details = DB::table('job_roster_activities')->where(['guard_id' => $id, 'job_roster_id' => $request->input('roster_id')])->first();

            if ($job_signin_details) {
                if ($job_signin_details->status == 0) {
                    return response()->json([
                        'success' => false,
                        'error' => 'You can\'t take a break!',
                        'code' => 200
                    ]);
                } else {
                    $job_start_time = $job_signin_details->signin_time;
                    $job_start_time = explode('GMT', $job_start_time);
                    $job_start_time = strtotime($job_start_time[0]);
                    $current_time = time();
                    $diff = round(($current_time - $job_start_time) / (60 * 60), 2);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'You must be signin into you job to start break!',
                    'code' => 200
                ]);
            }

            $already_break = DB::table('job_breaks')->where(['guard_id' => $id, 'roster_id' => $request->input('roster_id')])->orderBy('id', 'desc')->first();
            if ($already_break) {
                if ($already_break->job_status == 1) {
                    return response()->json([
                        'success' => false,
                        'error' => 'You are already on a break!',
                        'code' => 200
                    ]);
                } else {
                    $job_start_time = $already_break->end_time;
                    $job_start_time = strtotime($job_start_time);
                    $current_time = time();
                    $diff = round(($job_start_time - $current_time) / (60 * 60), 2);
                    if ($diff < 4) {
                        return response()->json([
                            'success' => false,
                            'error' => 'You can take a break after 4 hours!',
                            'code' => 200
                        ]);
                    }
                }
            }
            $data = array(
                'roster_id' => $request->input('roster_id'),
                'guard_id' => $id,
                'start_time' => time(),
                'notes' => $request->input('notes'),
                'inform_to' => $request->input('inform'),
                'job_status' => 1,
                'break_start_time' => time()
            );
            DB::table('job_breaks')->insert($data);
            DB::table('job_rosters')->where(['id' => $request->input('roster_id'), 'assigned_to' => $id])->update(['break_status' => 1]);

            DB::table('roster_complete_activity')->insert([
                'roster_id' => $request->input('roster_id'),
                'activity' => $guard->name . ' start break.',
                'type' => 'start_break',
                'record_id' => $request->input('roster_id'),
                'activity_time' => time(),
                'activity_by' => $id
            ]);

            //push notification
            $admins = DB::table('users')->where('notification_token', '!=', '')->select('notification_token')->get();
            foreach ($admins as $a) {
                $notification_data = [
                    'message' => $guard->name . 'start break.',
                    'title' => 'start_break',
                    'notification_token' => $a->notification_token,
                    'page' => 'my-job-applications',
                    'roster_id' =>  $id
                ];
                send_push_notification($notification_data);
            }
            return response()->json([
                'success' => true,
                'message' => 'Break start successfully.',
                'code' => 200
            ]);
        }
        public function end_break(Request $request, $id)
        {
            // $this->setValidationRules(['roster_id' => 'required']);
            // if ($this->isValidRequest()) {
            //     $this->response = ['success' => false, 'error' => $this->getErrors()];
            //     $this->statusCode = self::STATUS_CODE_200;
            //     return $this->sendResponse();
            // }
            $guard = DB::table('users')->where('id', $id)->first();
            // if ($guard->state != '') {
            //     config(['app.timezone' => $this->timezone[$guard->state]]);
            //     date_default_timezone_set($this->timezone[$guard->state]);
            // }

            DB::table('job_breaks')->where(['roster_id' => $request->input('roster_id'), 'guard_id' => $id, 'job_status' => 1])->update(['job_status' => 0, 'end_time' => time(), 'break_end_time' => time(), 'break_end_notes' => ($request->has('notes') ? $request->notes : '')]);

            DB::table('job_rosters')->where(['id' => $request->input('roster_id'), 'assigned_to' => $id])->update(['break_status' => 0]);

            DB::table('roster_complete_activity')->insert([
                'roster_id' => $request->input('roster_id'),
                'activity' => $guard->name . ' end its break.',
                'type' => 'end_break',
                'record_id' => $request->input('roster_id'),
                'activity_time' => time(),
                'activity_by' => $id
            ]);

            //push notification
            // $admins = DB::table('users')->where('notification_token', '!=', '')->select('notification_token')->get();
            // foreach($admins as $a)
            // {
            //     $notification_data = [
            //         'message' => $guard->name.' end its break.',
            //         'title' => 'end_break',
            //         'notification_token' => $a->notification_token,
            //         'page' => 'homepage',
            //         'roster_id' =>  $id
            //     ]; 
            //     send_push_notification($notification_data);
            // }

            return response()->json([
                'success' => true,
                'message' => 'Break Completed.',
                'code' => 200
            ]);
        }

        public function updateRosterTime(Request $request)
        {
            $jobRosterTime = JobRoster::where('id', $request->id)->first();
            $old_data = $jobRosterTime;
            $hours = getShiftHours(dbFormateDateTime($request->start), dbFormateDateTime($request->end), $jobRosterTime->site_id, 0);
            $guardWorkingHours =  calCulateGuardWeekHours(dbFormateDateTime($request->start), dbFormateDateTime($request->end));
            if ($jobRosterTime) {
                $jobRosterTime->start = dbFormateDateTime($request->start);
                $jobRosterTime->end = dbFormateDateTime($request->end);
                $jobRosterTime->hours = $guardWorkingHours;
                $jobRosterTime->morning_hours = (!empty($hours['morning']) ? $hours['morning'] : 0.0);
                $jobRosterTime->night_hours = (!empty($hours['night']) ? $hours['night'] : 0.0);
                $jobRosterTime->saturday_morning_hours = (!empty($hours['saturday_morning']) ? $hours['saturday_morning'] : 0.0);
                $jobRosterTime->saturday_night_hours = (!empty($hours['saturday_night']) ? $hours['saturday_night'] : 0.0);
                $jobRosterTime->sunday_morning_hours = (!empty($hours['sunday_morning']) ? $hours['sunday_morning'] : 0.0);
                $jobRosterTime->sunday_night_hours = (!empty($hours['sunday_night']) ? $hours['sunday_night'] : 0.0);
                $jobRosterTime->ph_morning_hours = (!empty($hours['ph_morning']) ? $hours['ph_morning'] : 0.0);
                $jobRosterTime->ph_night_hours = (!empty($hours['ph_night']) ? $hours['ph_night'] : 0.0);
                $jobRosterTime->update();
                // $check = checkGuardShiftTimingUpdate($request->start, $request->end, $jobRosterTime->assigned_to, $jobRosterTime->roster_id);
                // $jobRosterTime->conf_start = (!empty($check['start']) ? dbFormateDateTime($check['start']) : '');
                // $jobRosterTime->conf_end = (!empty($check['end']) ? dbFormateDateTime($check['end']) : '');
                // $jobRosterTime->conflict =  (!empty($check['conf']) ? $check['conf'] : '');
                $jobRosterTime->update();
                // $updatedjobRosterTime = $jobRosterTime->getChanges();
                // jobRosterActions($request->admin_id,'update_shift_time',$jobRosterTime->id, 'job_roster',$old_data, $updatedjobRosterTime);

                $admin_name = getUserName($request->admin_id);
                $currnet_time = time();
                // shiftCompleteActivity($jobRosterTime->id, $admin_name. ' Update Time of this Shift', 'update_shift_time', $jobRosterTime->id, $currnet_time, $request->admin_id);

                return response()->json(['message' => "Shift Time Updated",  'code' => 200, 'success' => true]);
            } else {
                return response()->json(['message' => "Shift not Found!",  'code' => 404, 'success' => false]);
            }
        }

        function getrosterhoursum(Request $request)
        {
            if (!empty($request['date'])) {
                $dateRange  = explode(' - ', $request['date']);
                $from       = strtotime(str_replace('/', '-', $dateRange[0]));
                $to         = strtotime(str_replace('/', '-', $dateRange[1])) + 86399;
            } else {
                $to   = time();
                $from = $to - (60 * 60 * 24 * 14);
            }

            $startDate = date('Y-m-d H:i', $from);
            $endDate   = date('Y-m-d H:i', $to);

            $query = DB::table('job_rosters AS jr')
                ->select(
                    'jr.*',
                    'j.id AS site_id',
                    'j.user_id',
                    'j.state',
                    'j.address',
                    'j.site_name',
                    'cust.name AS customer_name',
                    // 'g.phone AS guard_phone',
                    'g.name  AS guard_name',
                    'ja.signin_time',
                    'ja.signout_time',
                    'jr.id         AS id',
                    'jr.assigned_to AS guard_id',
                    'jr.created_by  AS customer_id'
                )
                ->join('sites AS j', 'j.id', '=', 'jr.site_id')
                ->leftJoin('job_roster_activities AS ja', 'ja.job_roster_id', '=', 'jr.id')
                ->leftJoin('users AS g',    'g.id',    '=', 'jr.assigned_to')
                ->leftJoin('users AS cust', 'cust.id', '=', 'jr.created_by')
                ->whereIn('jr.job_status', ['completed', 'pending', 'confirmed'])
                ->whereBetween('jr.start', [$startDate, $endDate])
                ->orderBy('g.name', 'ASC')
                ->orderBy('jr.start');

            if (!empty($request['customer_id'])) {
                $query->where('j.user_id', $request['customer_id']);
            }

            $results = $query->get()->toArray();
            $results = json_decode(json_encode($results), true);

            $chargerate = ChargeRate::where('id', 1)
                ->where('status', 'active')
                ->first();

            foreach ($results as $key => $roster) {

                $roster['day_rate']            = 0;
                $roster['night_rate']          = 0;
                $roster['public_holiday_rate'] = 0;
                $roster['saturday_rate']       = 0;
                $roster['sunday_rate']         = 0;
                $roster['total_amount']        = 0;
                $roster['ot']                  = 0;

                if (!empty($chargerate)) {

                    $roster['day_rate']            = $chargerate->def_metro_mon_to_fri_day_rate;
                    $roster['night_rate']          = $chargerate->def_metro_mon_to_fri_night_rate;
                    $roster['public_holiday_rate'] = $chargerate->def_metro_pub_holi_day_rate;
                    $roster['saturday_rate']       = $chargerate->def_metro_sat_day_rate;
                    $roster['sunday_rate']         = $chargerate->def_metro_sun_day_rate;

                    $roster['total_amount'] =
                        ($roster['day_rate']            * $roster['morning_hours']) +
                        ($roster['night_rate']           * $roster['night_hours']) +
                        ($roster['public_holiday_rate']  * ($roster['ph_morning_hours']       + $roster['ph_night_hours'])) +
                        ($roster['saturday_rate']        * ($roster['saturday_morning_hours'] + $roster['saturday_night_hours'])) +
                        ($roster['sunday_rate']          * ($roster['sunday_morning_hours']   + $roster['sunday_night_hours']));
                }

                $results[$key] = $roster;
            }

            // ── Normal type: aggregate into hour buckets ─────────────────────────────
            if ($request->type === 'normal') {

                $total_hours = [
                    0 => ['name' => 'M-F Morning Hours',    'hours' => 0, 'payrate' => 0, 'totalpay' => 0],
                    1 => ['name' => 'M-F Night Hours',       'hours' => 0, 'payrate' => 0, 'totalpay' => 0],
                    2 => ['name' => 'Saturday Hours',        'hours' => 0, 'payrate' => 0, 'totalpay' => 0],
                    3 => ['name' => 'Sunday Hours',          'hours' => 0, 'payrate' => 0, 'totalpay' => 0],
                    4 => ['name' => 'Public Holiday Hours',  'hours' => 0, 'payrate' => 0, 'totalpay' => 0],
                ];

                foreach ($results as $shift) {

                    // Helper closure to reduce repetition
                    $add = function (int $index, float $hours, float $rate) use (&$total_hours, $shift) {
                        $total_hours[$index]['hours']      += $hours;
                        $total_hours[$index]['payrate']     = $rate;
                        $total_hours[$index]['totalpay']    = $total_hours[$index]['hours'] * $rate;
                        // $total_hours[$index]['site_po_wo']  = $shift['site_po_wo'];
                        // $total_hours[$index]['po_wo']       = $shift['po_wo'];
                    };

                    $add(0, $shift['morning_hours'],                                                $shift['day_rate']);
                    $add(1, $shift['night_hours'],                                                  $shift['night_rate']);
                    $add(2, $shift['saturday_morning_hours'] + $shift['saturday_night_hours'],      $shift['saturday_rate']);
                    $add(3, $shift['sunday_morning_hours']   + $shift['sunday_night_hours'],        $shift['sunday_rate']);
                    $add(4, $shift['ph_morning_hours']       + $shift['ph_night_hours'],            $shift['public_holiday_rate']);
                }

                // Always return success; let the frontend decide if data is empty
                return response()->json([
                    'success' => !empty(array_filter($total_hours, fn($b) => $b['hours'] > 0)),
                    'code'    => 200,
                    'data'    => $total_hours,
                ]);
            }
        }

        function getTimesheet(Request $request)
        {
            $limit = 10;
            $offset = 0;
            if ($request->has('pageIndex') && $request->has('pageSize')) {
                $offset = $request->pageIndex * $request->pageSize;
                $limit = $request->pageSize;
            }

            // Build base query
            $baseQuery = JobRoster::query();

            if ($request->has('start') && $request->start != '') {
                $start = dbFormate($request->start);
            } else {
                $start = Carbon::now()->startOfWeek()->toDateString();
            }
            if ($request->has('end') && $request->end != '') {
                $end = dbFormate($request->end);
            } else {
                $end = Carbon::now()->endOfWeek()->toDateString();
            }

            // Apply filters
            if ($request->has('guard_ids') && !empty($request->guard_ids)) {
                $baseQuery->whereIn('job_rosters.assigned_to', $request->guard_ids);
            }
            
            if ($request->has('contractor_ids') && !empty($request->contractor_ids)) {
                $baseQuery->whereIn('job_rosters.accepted_by', $request->contractor_ids);
            }

            if ($request->has('customer_ids') && !empty($request->customer_ids)) {
                $sites_id = Site::whereIn('user_id', $request->customer_ids)->pluck('id')->toArray();
                $baseQuery->whereIn('job_rosters.site_id', $sites_id);
            }

            if ($request->has('sites_ids') && !empty($request->sites_ids)) {
                $baseQuery->whereIn('job_rosters.site_id', $request->sites_ids);
            }

            // Apply date filters
            $baseQuery->whereDate('job_rosters.start', '>=', $start)
                ->whereDate('job_rosters.start', '<=', $end)
                ->whereNotNull('job_rosters.assigned_to');

            // Get total count
            $totalQuery = clone $baseQuery;
            $total = $totalQuery->count('job_rosters.id');

            // Get the timesheet data with proper grouping
            $timesheet = $baseQuery
                ->leftJoin('users', 'users.id', '=', 'job_rosters.assigned_to')
                ->select(
                    'job_rosters.id as shift_id',
                    'job_rosters.start',
                    'job_rosters.end',
                    'users.id as user_id',
                    'users.name',
                    'job_rosters.in_paysheet',
                    'job_rosters.morning_hours',
                    'job_rosters.night_hours',
                    'job_rosters.saturday_morning_hours',
                    'job_rosters.saturday_night_hours',
                    'job_rosters.sunday_morning_hours',
                    'job_rosters.sunday_night_hours',
                    'job_rosters.ph_morning_hours',
                    'job_rosters.ph_night_hours',
                    'job_rosters.hours'
                )
                ->orderBy('users.name')
                ->orderBy('job_rosters.start')
                ->get();

            // Process the results to group by user
            $mainArr = [];
            foreach ($timesheet as $shift) {
                $userId = $shift['user_id'];

                // Get shift hours breakdown
                $job_hours = getShiftHours(
                    date('m/d/Y H:i', strtotime($shift['start'])),
                    date('m/d/Y H:i', strtotime($shift['end']))
                );

                if (!isset($mainArr[$userId])) {
                    $mainArr[$userId] = [
                        'id' => $shift['user_id'],
                        'name' => $shift['name'],
                        'hours' => (float)$shift['hours'],
                        'morning_hours' => (float)$job_hours['morning'],
                        'night_hours' => (float)$job_hours['night'],
                        'saturday_morning_hours' => (float)$job_hours['saturday_morning'],
                        'saturday_night_hours' => (float)$job_hours['saturday_night'],
                        'sunday_morning_hours' => (float)$job_hours['sunday_morning'],
                        'sunday_night_hours' => (float)$job_hours['sunday_night'],
                        'ph_morning_hours' => (float)$job_hours['ph_morning'],
                        'ph_night_hours' => (float)$job_hours['ph_night'],
                        'shift_collection' => [$shift['shift_id']],
                    ];
                } else {
                    // Update the aggregated values
                    $mainArr[$userId]['hours'] += (float)$shift['hours'];
                    $mainArr[$userId]['morning_hours'] += (float)$job_hours['morning'];
                    $mainArr[$userId]['night_hours'] += (float)$job_hours['night'];
                    $mainArr[$userId]['saturday_morning_hours'] += (float)$job_hours['saturday_morning'];
                    $mainArr[$userId]['saturday_night_hours'] += (float)$job_hours['saturday_night'];
                    $mainArr[$userId]['sunday_morning_hours'] += (float)$job_hours['sunday_morning'];
                    $mainArr[$userId]['sunday_night_hours'] += (float)$job_hours['sunday_night'];
                    $mainArr[$userId]['ph_morning_hours'] += (float)$job_hours['ph_morning'];
                    $mainArr[$userId]['ph_night_hours'] += (float)$job_hours['ph_night'];
                    $mainArr[$userId]['shift_collection'][] = $shift['shift_id'];
                }
            }

            $timesheet = array_values($mainArr);

            // Apply pagination to the processed array
            $paginatedData = array_slice($timesheet, $offset, $limit);
            $total = count($timesheet);

            if (count($paginatedData) > 0) {
                return response()->json([
                    'success' => true,
                    'code' => 200,
                    'length' => $total,
                    'pageIndex' => $request->pageIndex ?? 0,
                    'pageSize' => $limit,
                    'message' => 'Timesheet found.',
                    'data' => $paginatedData
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'code' => 200,
                    'length' => $total,
                    'pageIndex' => $request->pageIndex ?? 0,
                    'pageSize' => $limit,
                    'message' => 'No timesheet found!',
                    'data' => $paginatedData
                ]);
            }
        }

        public function getTimeSheetDetails(Request $request)
        {
            $rosters = JobRoster::whereIn('id', $request->shift_collection)
                ->with(['site', 'guards', 'customer', 'rosterActivity'])->get();

            //$data = TimeSheetDetailsResource::collection($rosters);
            $data = $rosters;
            if (count($data) > 0) {
                return response()->json(['success' => true, 'data' => $data]);
            }
            return response()->json(['success' => false, 'data' => $data]);
        }

        public function jobStatusManualApproved(Request $request)
        {
            $jobStatusManualApproved = JobRoster::where('id', $request->roster_id)->first();
            if ($jobStatusManualApproved) {
                if ($jobStatusManualApproved->in_paysheet == 0) {
                    $jobStatusManualApproved->in_paysheet = 1;
                    $jobStatusManualApproved->update();

                    return response()->json(['success' => true, 'msg' => 'Status Updated Successfully!']);
                } else {
                    $jobStatusManualApproved->in_paysheet = 0;
                    $jobStatusManualApproved->update();
                    return response()->json(['success' => true, 'msg' => 'Status Updated Successfully!']);
                }
            } else {
                return response()->json(['success' => true, 'msg' => 'Status Updated Successfully!']);
            }
        }

    public function holdPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'shifts'                     => 'required|array|min:1',
            'shifts.*.start'             => 'required|date',
            'shifts.*.end'               => 'required|date',
            'shifts.*.numberOfGuards'    => 'required|integer|min:1',

            'user_id'           => 'required|integer|exists:users,id',
            'card_holder_name'  => 'required|string',
            'payment_method_id' => 'required|string|starts_with:pm_',

            'payment_option'    => 'required|in:full,split',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // FIX nested validation
        $validator->after(function ($validator) use ($request) {
            foreach ($request->shifts as $i => $shift) {
                if (strtotime($shift['end']) <= strtotime($shift['start'])) {
                    $validator->errors()->add("shifts.$i.end", "End must be after start");
                }
            }
        });

        try {

            Stripe::setApiKey(config('services.stripe.secret'));

            $chargeRate = ChargeRate::where('level', $request->job_level)->first();

            if (!$chargeRate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Charge rate not found'
                ], 404);
            }

            // MULTI SHIFT TOTAL
            $baseTotal = 0;
            $hours_array = [];
            $baseTotal_arr = [];
            foreach ($request->shifts as $shift) {

                $start = dbFormateDateTime($shift['start']);
                $end   = dbFormateDateTime($shift['end']);

                $hours = getShiftHours($start, $end, 1, 0);
                $shiftAmount =
                    ($chargeRate->def_metro_mon_to_fri_day_rate * ($hours['morning'] ?? 0)) +
                    ($chargeRate->def_metro_mon_to_fri_night_rate * ($hours['night'] ?? 0)) +
                    ($chargeRate->def_metro_sat_day_rate * ($hours['saturday_morning'] ?? 0)) +
                    ($chargeRate->def_metro_sat_night_rate * ($hours['saturday_night'] ?? 0)) +
                    ($chargeRate->def_metro_sun_day_rate * ($hours['sunday_morning'] ?? 0)) +
                    ($chargeRate->def_metro_sun_night_rate * ($hours['sunday_night'] ?? 0)) +
                    ($chargeRate->def_metro_pub_holi_day_rate * ($hours['ph_morning'] ?? 0)) +
                    ($chargeRate->def_metro_pub_holi_night_rate * ($hours['ph_night'] ?? 0));
                    
                $hours_array[] = $hours;
                $baseTotal_arr[] = $shiftAmount; 
                $baseTotal += round($shiftAmount * $shift['numberOfGuards'], 2);
            }

            // APPLY DISCOUNT (ONLY FULL)
            $discount = 0;

            $cleanBaseTotal = (float) str_replace([',', '$'], '', $baseTotal);
            $feeRaw = $cleanBaseTotal * 0.10;
            $serviceFee = round($feeRaw, 2);        // Keep as float
            $displayedFee = number_format($serviceFee, 2); // For display only
            $baseFinalTotal = round($baseTotal + $serviceFee, 2); // Now works correctly

            // $cleanBaseTotal = (float) str_replace([',', '$'], '', $baseTotal);
            // $feeRaw = $cleanBaseTotal * 0.10;
            // $serviceFee = round($feeRaw, 2);
            // $displayedFee = number_format($serviceFee, 2);
            // $serviceFee  = $displayedFee;
            // $baseFinalTotal = round($baseTotal + $serviceFee, 2);

            if ($request->payment_option === 'full') {
                $discount = round($baseFinalTotal * 0.05, 2);
            }
            $grandTotal = round($baseFinalTotal - $discount, 2);    
            
            // SPLIT LOGIC (AFTER GST)
            if ($request->payment_option === 'split') {
                $amountToCharge = round($grandTotal * 0.5, 2);
                $balance = round($grandTotal - $amountToCharge, 2);
            } else {
                $amountToCharge = $grandTotal;
                $balance = 0;
            }
            // return [$baseTotal, $discount. $discountedTotal, $serviceFee, $grandTotal, $amountToCharge, $hours_array,$baseTotal_arr];

            $amountInCents = (int) round($amountToCharge * 100, 2);

            // ─── USER / CUSTOMER ──────────────────────
            $user = User::findOrFail($request->user_id);

            if (!$user->stripe_customer_id) {
                $customer = Customer::create([
                    'name'  => $request->card_holder_name,
                    'email' => $user->email,
                    'metadata' => [
                        'user_id' => $user->id
                    ]
                ]);

                $user->stripe_customer_id = $customer->id;
                $user->save();
            }

            $customerId = $user->stripe_customer_id;

            // ─── PAYMENT METHOD SAFE ATTACH ───────────
            $paymentMethod = PaymentMethod::retrieve($request->payment_method_id);

            if ($paymentMethod->customer && $paymentMethod->customer !== $customerId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment method already attached to another customer'
                ], 400);
            }

            if (!$paymentMethod->customer) {
                $paymentMethod->attach([
                    'customer' => $customerId
                ]);
            }

            // ─── STRIPE INTENT ────────────────────────
            $paymentIntent = PaymentIntent::create([
                'amount'         => $amountInCents,
                'currency'       => 'aud',
                'customer'       => $customerId,
                'payment_method' => $request->payment_method_id,
                'automatic_payment_methods' => [
                    'enabled' => true,
                    'allow_redirects' => 'never',
                ],
                'confirm'        => true,
                'capture_method' => 'manual',
            ]);

            // ─── SAVE TRANSACTION (UNCHANGED STRUCTURE + NEW FIELDS) ───
            Transaction::create([
                'user_id'           => $user->id,
                'job_roster_id'     => $request->job_id ?? null,
                'payment_intent_id' => $paymentIntent->id,
    
                'amount'            => $baseTotal,
                'discount'          => $discount,
                'service_fee'       => $displayedFee,
                'total_amount'      => $grandTotal,
    
                'amount_charged'    => $amountToCharge,
                'balance'           => $balance,
    
                // NEW fields
                'payment_option'    => $request->payment_option,
                'balance_status'    => $request->payment_option === 'split' ? 'pending' : null,
    
                'currency'          => 'AUD',
                'status'            => 'held',
                'response'          => json_encode($paymentIntent),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment held successfully',

                'payment' => [
                    'payment_intent_id' => $paymentIntent->id,
                    'status'            => $paymentIntent->status,
                    'amount_cents'      => $amountInCents,
                    'amount'            => $amountToCharge,
                    'total_amount'      => $grandTotal,
                    'service_fee'       => $serviceFee,
                    'discount'          => $discount,
                    'balance'           => $balance,
                    'currency'          => 'AUD',
                ]
            ]);

        } catch (\Stripe\Exception\CardException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Card declined: ' . $e->getMessage(),
            ], 402);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stripe error: ' . $e->getMessage(),
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }

    //Guards Payslips
    public function uploadPayslips(Request $request)
    {
        $fileName = $request->pdf;
        $fullPath = public_path('payslip/' . $fileName);

        if (!file_exists($fullPath)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found on server.',
            ], 404);
        }

        $parser = new \Smalot\PdfParser\Parser();
        $pdf    = $parser->parseFile($fullPath);
        $pages  = $pdf->getPages();

        $payslipFolder = storage_path('app/public/payslips');
        if (!file_exists($payslipFolder)) {
            mkdir($payslipFolder, 0777, true);
        }
        
        // Initialize counters
        $totalGuardsFound = 0;
        $successfullySent = 0;
        $failedGuards = [];
        $processedExternalIds = [];
        
        foreach ($pages as $pageNumber => $page) {
            $text = $page->getText();

            preg_match('/STAFO\d+/i', $text, $matches);

            if (!empty($matches[0])) {
                $externalId = $matches[0];
                
                // $externalId = strtolower($externalId);
                
                if (!in_array($externalId, $processedExternalIds)) {
                    $totalGuardsFound++;
                    $processedExternalIds[] = $externalId;
                }

                $guard = DB::table('users')
                            ->where('staffo_id', $externalId)
                            ->first();

                if ($guard) {
                    $guardId = $guard->id;

                    try {
                        $newPdf = new \setasign\Fpdi\Fpdi();
                        $newPdf->AddPage();
                        $newPdf->setSourceFile($fullPath);
                        $tpl = $newPdf->importPage($pageNumber + 1);
                        $newPdf->useTemplate($tpl);

                        $newFileName = $externalId . '_' . \Illuminate\Support\Str::random(8) . '.pdf';
                        $newFilePath = $payslipFolder . '/' . $newFileName;

                        $newPdf->Output($newFilePath, 'F');

                        GuardPayslip::create([
                            'guard_id'   => $guardId,
                            'file_url'   => request()->getSchemeAndHttpHost() . '/storage/payslips/' . $newFileName,
                            'start_date' => $request->start_date ?? null,
                            'end_date'   => $request->end_date ?? null,
                            'status' => 1,
                        ]);
                        
                        $admins = DB::table('users')->where('notification_token', '!=', '')->where('id', $guardId)->select('notification_token')->get();
                        foreach ($admins as $a) {
                            $notification_data = [
                                'message' => $guard->name . ' Payslip Uploaded',
                                'title' => 'Payslip Upload',
                                'notification_token' => $a->notification_token,
                                'page' => 'my-job-applications'
                            ];
                            send_push_notification($notification_data);
                        }
                        $successfullySent++;
                        
                    } catch (\Exception $e) {
                        // Track failed guards
                        $failedGuards[] = [
                            'external_id' => $externalId,
                            'guard_id' => $guardId,
                            'error' => $e->getMessage()
                        ];
                    }
                } else {
                    // Track guards not found in system
                    $failedGuards[] = [
                        'external_id' => $externalId,
                        'guard_id' => null,
                        'error' => 'Guard not found in system'
                    ];
                }
            }
        }

        if (file_exists($fullPath)) {
            unlink($fullPath);
        }

        return response()->json([
            'success' => true,
            'message' => 'PDF processed, payslips generated.',
            'statistics' => [
                'total_guards_found' => $totalGuardsFound,
                'successfully_sent' => $successfullySent,
                'failed' => count($failedGuards),
                'failed_details' => $failedGuards
            ]
        ]);
    }

    public function getGuardPayslips(Request $request)
    {
        try {
            $startDate = $request->start_date;
            $endDate   = $request->end_date;

            if (empty($startDate) || empty($endDate)) {
                $startDate = now()->startOfWeek()->format('Y-m-d');
                $endDate   = now()->endOfWeek()->format('Y-m-d');
            }

            $guardIds = $request->guard_id ?? [];

            $query = DB::table('guard_payslips')
                ->join('users', 'guard_payslips.guard_id', '=', 'users.id')
                ->where('guard_payslips.status', 1)
                ->select(
                    'guard_payslips.*',
                    'users.name',
                );

                $query->where(function ($q) use ($startDate, $endDate) {
                    $q->where('guard_payslips.start_date', '<=', $endDate)
                    ->where('guard_payslips.end_date', '>=', $startDate);
                });

            if (!empty($guardIds)) {
                $query->whereIn('guard_payslips.guard_id', (array) $guardIds);
            }

            $payslips = $query->get();

            return response()->json([
                'status'   => true,
                'message'  => 'Guard payslips retrieved successfully',
                'data'     => $payslips,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function autoUpdatePayslipStatus()
    {
        $today = \Carbon\Carbon::now()->format('Y-m-d');
        
        
        $updatedCount = DB::table('guard_payslips')
            ->where('status', 1)
            ->whereNotNull('end_date')
            ->whereRaw('DATE(DATE_ADD(end_date, INTERVAL 2 MONTH)) <= ?', [$today])
            ->update(['status' => 0]);

        return response()->json([
            'success' => true,
            'message' => "Status automatically updated for {$updatedCount} payslips.",
            'updated_count' => $updatedCount,
            'check_date' => $today
        ]);
    }


    public function getSpecificGuardPayslips(Request $request)
    {
    try {
        
        $guardIds = $request->guard_id ?? [];

        $query = DB::table('guard_payslips')
            ->join('users', 'guard_payslips.guard_id', '=', 'users.id')
            ->where('status', 1)
            ->select(
                'guard_payslips.*',
                'users.name',
            );

        if (!empty($guardIds)) {
            $query->whereIn('guard_payslips.guard_id', (array) $guardIds);
        }

        $payslips = $query->get();

        return response()->json([
            'status'   => true,
            'message'  => 'Guard payslips retrieved successfully',
            'data'     => $payslips,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status'  => false,
            'message' => 'Error: ' . $e->getMessage(),
        ], 500);
    }
    }
        
    function sendInvoice(Request $request)
    {
        // Validate input
        $request->validate([
            'emails' => 'required|array',
            'emails.*' => 'email',
            'invoice' => 'required|string'
        ]);
        
        // Get the filename only (for security)
        $filename = basename($request->invoice);
        $pdf_path = public_path('uploads/' . $filename);
        
        // Check if file exists
        if (!file_exists($pdf_path)) {
            return response()->json([
                'success' => false, 
                'message' => 'Invoice file not found.'
            ], 404);
        }
        
        // Generate download URL (adjust URL structure as needed)
        $download_url = url('/uploads/' . urlencode($filename));
        
        foreach($request->emails as $e){
            $email = [
                'subject' => 'Generated Invoice',
                'message' => 'Here is your invoice report.',
                'email' => $e,
                'attachment' => null,
                'download_url' => $download_url,
                'filename' => $filename
            ];
            $this->systemEmail($email);
        }
        
        return response()->json(['success' => true, 'message' => 'Invoice send successfully.']);
    }
        
    public function sendPdfInvoice(Request $request)
    {
        $request->validate([
            'invoice_filename' => 'required|string'
        ]);

        try {

            $filename = basename($request->invoice_filename);
            $storagePath = 'invoices/' . $filename;

            if (!Storage::disk('public')->exists($storagePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invoice file not found.',
                    'filename' => $filename,
                ], 404);
            }

            $download_url = asset('storage/invoices/' . $filename);

            $transactionId = $request->transaction_id;

            $successfulEmails = [];
            $failedEmails = [];

            foreach ($request->emails as $e) {
                try {
                    $send = [
                        'subject'      => 'STAFFOO Invoice',
                        'message'      => 'Here is your invoice.',
                        'email'        => $e,
                        'attachment'   => null,
                        'download_url' => $download_url,
                        'filename'     => $filename,
                    ];
                    
                    $this->systemEmail($send);

                    EmailHistory::create([
                        'file_name' => $filename,
                        'email' => $e,
                        'transaction_id' => $transactionId,
                        'status' => 'sent',
                        'response' => 'Email sent successfully'
                    ]);

                    $successfulEmails[] = $e;

                } catch (\Exception $emailException) {
                    EmailHistory::create([
                        'file_name' => $filename,
                        'email' => $e,
                        'transaction_id' => $transactionId,
                        'status' => 'failed',
                        'response' => $emailException->getMessage()
                    ]);

                    $failedEmails[] = $e;
                }
            }

            $message = 'Invoice sent successfully.';
            if (count($failedEmails) > 0) {
                $message = 'Some emails failed to send. Successful: ' . count($successfulEmails) . ', Failed: ' . count($failedEmails);
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'download_url' => $download_url,
                'transaction_id' => $transactionId,
                'successful_emails' => $successfulEmails,
                'failed_emails' => $failedEmails,
                'total_sent' => count($successfulEmails)
            ]);

        } catch (\Exception $e) {
            try {
                EmailHistory::create([
                    'file_name' => $request->invoice_filename ?? 'unknown',
                    'email' => $request->email ?? 'unknown',
                    'transaction_id' => 'ERROR-' . time(),
                    'status' => 'failed',
                    'response' => $e->getMessage()
                ]);
            } catch (\Exception $historyError) {
            }

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
        
    public function getEmailHistoryByTransaction($transaction_id)
    {
        try {
            $histories = EmailHistory::where('transaction_id', $transaction_id)
                                    ->orderBy('created_at', 'desc')
                                    ->get();

            if ($histories->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No email history found for this transaction ID.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'transaction_id' => $transaction_id,
                'total_emails' => $histories->count(),
                'data' => $histories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function systemEmail($prams)
    {
        $data = [
            'email'   => $prams['email'],
            'description' => $prams['message'],
            'subject' => $prams['subject'],
            'download_url' => $prams['download_url'] ?? null,
            'filename' => $prams['filename'] ?? 'invoice.pdf'
        ];
        
        Mail::send('emails.systemGeneralEmail', $data, function($message) use ($data){
            $message->from('no-reply@staffoo.com.au', 'Staffoo');
            $message->to($data['email'])->subject($data['subject']);
            // No attachment - just send HTML email with button
        });
    }

    public function getUserTransactions($user_id)
    {
        // Get all transactions for the user
        $transactions = Transaction::where('user_id', $user_id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Check if transactions exist
        if ($transactions->isEmpty()) {
            return response()->json([
                'message' => 'No transactions found for this user',
                'data' => []
            ], 200);
        }

        $transactionsWithInvoices = $transactions->map(function ($transaction) {
            $jobRosterIds = is_string($transaction->job_roster_id) 
                ? json_decode($transaction->job_roster_id, true) 
                : $transaction->job_roster_id;
            
            $firstJobRosterId = is_array($jobRosterIds) && count($jobRosterIds) > 0 
                ? $jobRosterIds[0] 
                : null;
            
            $invoiceFilename = null;
            if ($firstJobRosterId) {
                $jobRoster = JobRoster::where('id', $firstJobRosterId)
                    ->select('invoice_filename')
                    ->first();
                
                $invoiceFilename = $jobRoster ? $jobRoster->invoice_filename : null;
            }
            
            $transaction->invoice_filename = $invoiceFilename;
            
            return $transaction;
        });

        return response()->json([
            'message' => 'Transactions retrieved successfully',
            'data' => $transactionsWithInvoices
        ], 200);
    }

    public function generateQR(Request $request, $roster_id)
    {
        $now = Carbon::now();

        $roster = JobRoster::find($roster_id);

        if (!$roster) {
            return response()->json(['message' => 'Roster not found.'], 404);
        }

        // if ($roster->assigned_to !== $request->user()->id) {
        //     return response()->json(['message' => 'Unauthorized.'], 403);
        // }

        if ($roster->signin_status != 1) {
            return response()->json(['message' => 'You must be checked in to generate a handover QR.'], 400);
        }

        if (!$roster->handover_token) {
            $roster->handover_token = (string) Str::uuid();
            $roster->save();
        }

        $payload = json_encode([
            'roster_id' => $roster->id,
            'token'     => $roster->handover_token,
        ]);

        // SVG format — no Imagick or GD required
        $qrImage = QrCode::format('svg')->size(300)->generate($payload);

        return response()->json([
            'roster_id'      => $roster->id,
            'handover_token' => $roster->handover_token,
            'qr_base64'      => 'data:image/png;base64,' . $qrImage,
        ]);
    }
    
    public function scanHandover(Request $request)
    {
        $request->validate([
            'roster_id' => 'required|integer|exists:job_rosters,id',
            'token'     => 'required|string',
        ]);

        $now = Carbon::now();

        DB::beginTransaction();
        try {
            $guard1Roster = JobRoster::lockForUpdate()->findOrFail($request->roster_id);

            if ($guard1Roster->handover_token !== $request->token) {
                return response()->json(['message' => 'Invalid or expired QR code.'], 400);
            }

            if ($guard1Roster->signin_status != 1) {
                return response()->json(['message' => 'Guard 1 shift is no longer active.'], 400);
            }

            if ($guard1Roster->assigned_to === $request->user()->id) {
                return response()->json(['message' => 'You cannot scan your own handover QR.'], 403);
            }

            $guard2Roster = JobRoster::lockForUpdate()->findOrFail($request->scanner_shift_id);

            if (!$guard2Roster) {
                return response()->json(['message' => 'No upcoming shift found for you.'], 400);
            }

            // Update Guard 1
            $guard1Roster->end = $now;
            $guard1Roster->handover_token  = null;
            $guard1Roster->save();

            // Update Guard 2
            $guard2Roster->start = $now;
            $guard2Roster->save();

            DB::commit();

            return response()->json([
                'message'       => 'Handover completed successfully.',
                'handover_time' => $now->toDateTimeString(),
                'guard1' => [
                    'roster_id'       => $guard1Roster->id,
                    'actual_end_time' => $guard1Roster->end->toDateTimeString(),
                    'job_status'      => $guard1Roster->job_status,
                ],
                'guard2' => [
                    'roster_id'         => $guard2Roster->id,
                    'actual_start_time' => $guard2Roster->start->toDateTimeString(),
                    'job_status'        => $guard2Roster->job_status,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Handover failed.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
        
    public function getAvailableJobs($id)
    {
        try {

            $perPage = 50;
            $userId = $id;
            $user = User::find($userId);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }

            $query = JobRoster::with(['site'])
                ->whereNull('assigned_to')
                ->whereNull('accepted_by')
                ->where('start', '>', now())
                ->orderBy('created_at', 'desc');

            // ─── STATE FILTER ───
            // Contractors: filtered by their OWN states_allowed.
            // Staff: filtered by Staffoo's (contractor id 1) states_allowed.
            if ($user->user_type === 'staff') {
                $allowedStates = User::where('id', 1)->value('states_allowed');
            } else {
                $allowedStates = $user->states_allowed;
            }

            if (is_string($allowedStates)) {
                $allowedStates = json_decode($allowedStates, true) ?? [];
            }

            if (is_array($allowedStates) && !empty($allowedStates)) {
                $abbrMap = [
                    'victoria'                      => ['victoria', 'vic'],
                    'new south wales'                => ['new south wales', 'nsw'],
                    'queensland'                     => ['queensland', 'qld'],
                    'south australia'                => ['south australia', 'sa'],
                    'western australia'              => ['western australia', 'wa'],
                    'tasmania'                       => ['tasmania', 'tas'],
                    'australian capital territory'   => ['australian capital territory', 'act'],
                    'northern territory'             => ['northern territory', 'nt'],
                    'punjab'                         => ['punjab'],
                ];

                $states = [];
                foreach ($allowedStates as $allowedState) {
                    $normalized = strtolower(trim($allowedState));
                    $matched = false;

                    foreach ($abbrMap as $variants) {
                        if (in_array($normalized, $variants, true)) {
                            $states = array_merge($states, $variants);
                            $matched = true;
                            break;
                        }
                    }

                    if (!$matched) {
                        $states[] = $allowedState;
                    }
                }
                $states = array_unique($states);

                $query->whereHas('site', function ($q) use ($states) {
                    $q->whereIn('state', $states);
                });

            } 

            $jobs = $query->paginate($perPage);

            if($user->user_type == "staff"){
                // FILTER LOGIC: Hide today's jobs if user has 2 jobs OR 12 hours today
                $today = now()->toDateString();
                $todayAssignedJobs = JobRoster::where('assigned_to', $user->id)
                    ->whereDate('start', $today)
                    ->get();

                $jobsCountToday = $todayAssignedJobs->count();
                $hoursToday = $this->calculateTotalHours($todayAssignedJobs);
                $hideTodayJobs = ($jobsCountToday >= 2 || $hoursToday >= 12);

                $filteredJobs = $jobs->getCollection()->filter(function ($job) use ($today, $hideTodayJobs) {
                    // If hideTodayJobs is true AND job is today, hide it
                    if ($hideTodayJobs && date('Y-m-d', strtotime($job->start)) === $today) {
                        return false;
                    }
                    return true;
                })->values(); // <-- ADDED: reindex so it stays a proper array

                $jobs->setCollection($filteredJobs);
            }
            
            // Format and return
            $formattedJobs = $jobs->through(function ($job) {
                return [
                    'id' => $job->id,
                    'site_name' => $job->site->site_name ?? null,
                    'site_address' => $job->site->address ?? null,
                    'site_id' => $job->site->id ?? null,
                    'state' => $job->site->state ?? null,
                    'coordinates' => $job->site->coordinates ?? null,
                    'start_time' => $job->start,
                    'end_time' => $job->end,
                    'day_of_week' => date('l', strtotime($job->start)),
                    'job_status' => $job->job_status,
                    'publish_status' => $job->publish_status,
                    'assigned_to' => $job->assigned_to,
                    'created_at' => $job->created_at,
                    'document_list' => $job->document_list,
                    'description' => $job->description,
                ];
            })->toArray();

            return response()->json([
                'success' => true,
                'message' => 'Available jobs retrieved successfully.',
                'code' => 200,
                'data' => [
                    'jobs' => $formattedJobs, 
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching jobs: ' . $e->getMessage(),
                'code' => 500,
            ], 500);
        }
    }

    private function calculateTotalHours($jobs)
    {
        $total = 0;
        foreach ($jobs as $job) {
            try {
                $total += \Carbon\Carbon::parse($job->start)->diffInHours(\Carbon\Carbon::parse($job->end));
            } catch (\Exception $e) {
                // Skip
            }
        }
        return $total;
    }

    private function getResourcePartners($siteId)
    {
        $siteState = Site::where('id', $siteId)->value('state');

        $stateMap = [
            // Australia
            'Victoria' => ['Victoria', 'VIC', 'vic'],
            'VIC' => ['Victoria', 'VIC', 'vic'],
            'vic' => ['Victoria', 'VIC', 'vic'],

            'New South Wales' => ['New South Wales', 'NSW', 'nsw'],
            'NSW' => ['New South Wales', 'NSW', 'nsw'],
            'nsw' => ['New South Wales', 'NSW', 'nsw'],

            'Queensland' => ['Queensland', 'QLD', 'qld'],
            'QLD' => ['Queensland', 'QLD', 'qld'],
            'qld' => ['Queensland', 'QLD', 'qld'],

            'South Australia' => ['South Australia', 'SA', 'sa'],
            'SA' => ['South Australia', 'SA', 'sa'],
            'sa' => ['South Australia', 'SA', 'sa'],

            'Western Australia' => ['Western Australia', 'WA', 'wa'],
            'WA' => ['Western Australia', 'WA', 'wa'],
            'wa' => ['Western Australia', 'WA', 'wa'],

            'Tasmania' => ['Tasmania', 'TAS', 'tas'],
            'TAS' => ['Tasmania', 'TAS', 'tas'],
            'tas' => ['Tasmania', 'TAS', 'tas'],

            'Australian Capital Territory' => ['Australian Capital Territory', 'ACT', 'act'],
            'ACT' => ['Australian Capital Territory', 'ACT', 'act'],
            'act' => ['Australian Capital Territory', 'ACT', 'act'],

            'Northern Territory' => ['Northern Territory', 'NT', 'nt'],
            'NT' => ['Northern Territory', 'NT', 'nt'],
            'nt' => ['Northern Territory', 'NT', 'nt'],

            // Pakistan
            'Punjab' => ['Punjab', 'PUNJAB', 'punjab'],
            'PUNJAB' => ['Punjab', 'PUNJAB', 'punjab'],
            'punjab' => ['Punjab', 'PUNJAB', 'punjab'],

        ];

        $states = $stateMap[$siteState] ?? [$siteState];

        $partners = User::whereNotIn('id', [1])
            ->where('user_type', 'contractor')
            // ->whereIn('state', $states)
            ->where('is_active', 1)
            ->whereNotNull('notification_token')
            ->whereNotNull('current_coordinates')
            ->select('id', 'name', 'email', 'phone', 'notification_token', 'current_coordinates', 'states_allowed')
            ->get()
            ->filter(fn($partner) => $this->userAllowedForState($partner, $siteState))
            ->values();

        Log::info("Found {$partners->count()} resource partners with states_allowed permission.", [
            'site_state' => $siteState,
            'matched_states' => $states
        ]);

        return $partners;

    }

    private function sendConsolidatedNotifications($siteCoordinates, $jobIds, $createdBy)
    {
        // Get all jobs for this site
        $jobs = JobRoster::with('site')
            ->whereIn('id', $jobIds)
            ->get();
        
        if ($jobs->isEmpty()) {
            Log::warning("No jobs found for consolidation", ['job_ids' => $jobIds]);
            return;
        }

        $shiftCount = $jobs->count();
        $siteName = $jobs->first()->site->site_name ?? 'Unknown Site';
        
        Log::info("Sending consolidated notification for {$shiftCount} shifts on site: {$siteName}", [
            'site_id' => $jobs->first()->site_id,
            'job_ids' => $jobIds,
            'shift_count' => $shiftCount
        ]);
        
        // Get all guards within radius
        $siteState = $jobs->first()->site->state ?? null;
        $Guards = $this->getStaffooGuardsByRadius($siteCoordinates, 15, $siteState);
        $partners = $this->getResourcePartners($jobs->first()->site_id);
        

        $allGuards = $Guards->merge($partners);

        
        if ($allGuards->isEmpty()) {
            Log::info("No guards found within radius for site: {$siteName}");
            return;
        }
        
        // Prepare consolidated message
        if ($shiftCount > 1) {
            $title = 'Multiple Jobs Available';
            $message = "{$shiftCount} security jobs are available at {$siteName}.";
        } else {
            $title = 'New Job Available';
            $message = "A new security job is available at {$siteName} near you.";
        }
        
        $notifiedCount = 0;
        
        foreach ($allGuards as $guard) {
            $eligibleJobIds = [];
            foreach ($jobs as $job) {
                if ($this->isGuardEligibleForSpecificJob($guard->id, $job)) {
                    $eligibleJobIds[] = $job->id;
                }
            }
            
            // If guard is not eligible for ANY job, skip them
            if (empty($eligibleJobIds)) {
                Log::info("Guard #{$guard->id} is not eligible for any of the {$shiftCount} jobs", [
                    'all_job_ids' => $jobs->pluck('id')->toArray()
                ]);
                continue;
            }
            // Get only the jobs this guard is eligible for
            $eligibleJobs = $jobs->filter(fn($job) => in_array($job->id, $eligibleJobIds));
            
            // Calculate distance for this guard
            $distance = $this->getDistance($siteCoordinates, $guard->current_coordinates);
            
            // 1. App Push Notification with ONLY eligible jobs
            $this->sendConsolidatedAppNotification(
                $guard, 
                $eligibleJobs,  // Send ONLY eligible jobs
                $title, 
                $message, 
                $distance,
                15
            );
            
            // 2. SMS - Single SMS with eligible shift details
            if (!empty($guard->phone)) {
                try {
                    $smsMessage = $this->buildConsolidatedSmsMessage($eligibleJobs);
            
                    $response = send_sms($guard->phone, $smsMessage);
            
                    Log::info("SMS sent to guard #{$guard->id}", [
                        'phone' => $guard->phone,
                        'response' => $response
                    ]);
                } catch (\Throwable $e) {
                    Log::error("Failed to send SMS to guard #{$guard->id}", [
                        'phone' => $guard->phone,
                        'error' => $e->getMessage(),
                    ]);
            
                }
            }
            
            // 3. Email - Single email with eligible shift details
            if (!empty($guard->email)) {
                $firstEligibleJob = $eligibleJobs->first();
                $this->sendEmail($guard, $title, $message, $firstEligibleJob);
                Log::info("Email to guard #{$guard->id}: {$guard->email}");
            }
            
            $notifiedCount++;
            Log::info("Notified guard #{$guard->id} for " . $eligibleJobs->count() . " eligible job(s)", [
                'eligible_job_ids' => $eligibleJobIds
            ]);
        }
        
        Log::info("Consolidated notification sent to {$notifiedCount} guards for {$shiftCount} shifts");
    }

    private function isGuardEligibleForSpecificJob($guardId, $job)
    {
        $jobDate = date('Y-m-d', strtotime($job->start));
        $jobDuration = $this->calculateShiftDuration($job->start, $job->end);

        // Get all assigned jobs for this guard on THIS SPECIFIC date
        $assignedJobs = JobRoster::where('assigned_to', $guardId)
            ->whereDate('start', $jobDate)
            ->where('job_status', '!=', 'cancelled')
            ->get();

        // Check maximum jobs limit for THIS DAY (2 jobs per day)
        if ($assignedJobs->count() >= 2) {
            Log::info("Guard #{$guardId} blocked for job #{$job->id} on {$jobDate}: Already has {$assignedJobs->count()} jobs on this day (max 2)");
            return false;
        }

        // Check maximum hours limit for THIS DAY (12 hours per day)
        $totalHoursToday = 0;
        foreach ($assignedJobs as $assignedJob) {
            try {
                $start = \Carbon\Carbon::parse($assignedJob->start);
                $end = \Carbon\Carbon::parse($assignedJob->end);
                $totalHoursToday += $start->diffInHours($end);
            } catch (\Exception $e) {
                Log::warning("Error calculating hours for job #{$assignedJob->id}: " . $e->getMessage());
            }
        }

        // If already worked 12+ hours on this day
        if ($totalHoursToday >= 12) {
            Log::info("Guard #{$guardId} blocked for job #{$job->id} on {$jobDate}: Already worked {$totalHoursToday} hours on this day (max 12)");
            return false;
        }

        // Check if adding this job would exceed 12 hours on this day
        if (($totalHoursToday + $jobDuration) > 12) {
            Log::info("Guard #{$guardId} blocked for job #{$job->id} on {$jobDate}: Current hours ({$totalHoursToday}) + this job ({$jobDuration}h) would exceed 12 hours");
            return false;
        }

        Log::info("Guard #{$guardId} is eligible for job #{$job->id} on {$jobDate}", [
            'jobs_that_day' => $assignedJobs->count(),
            'hours_that_day' => round($totalHoursToday, 1),
            'job_duration' => $jobDuration
        ]);

        return true;
    }

    private function getStaffooGuardsByRadius(string $siteCoords, int $radiusKm, ?string $siteState = null)
    {
          $staffoo = User::find(1);
            if (!$this->userAllowedForState($staffoo, $siteState)) {
                Log::info("Staffoo (id 1) has no states_allowed permission for state '{$siteState}', skipping Staffoo staff notifications.");
                return collect();
            }

            return User::where('user_id', 1)
                ->where('is_active', 1)
                ->where('user_type', 'staff')
                ->whereNotNull('current_coordinates')
                ->whereNotNull('notification_token')
                ->select('id', 'name', 'email', 'phone', 'current_coordinates', 'notification_token')
                ->get()
                ->filter(function ($guard) use ($siteCoords, $radiusKm) {
                    return $this->isWithinRadius($siteCoords, $guard->current_coordinates, $radiusKm);
                });
        
    }

    private function sendConsolidatedAppNotification($guard, $jobs, $title, $message, $distance, $radius)
    {
        if (empty($guard->notification_token)) {
            return;
        }

        if (!function_exists('send_push_notification')) {
            Log::error('send_push_notification helper not found.');
            return;
        }

        $jobIds = $jobs->pluck('id')->toArray();
        $shiftCount = $jobs->count();
        $firstJob = $jobs->first();
        $site = $firstJob->site;

            $notificationData = [
            'distance' => round($radius, 2),
            'radius' => $radius,
            'job_ids' => $jobIds,
            'roster' => $firstJob,
            'job_count' => count($jobIds),
        ];

        send_push_notification([
            'notification_token' => $guard->notification_token,
            'title' => $title,
            'message' => $message,
            'page' => 'asap-job-list',
            'data' => $notificationData
        ]);

        Log::info("App notification sent to guard #{$guard->id} for {$shiftCount} eligible job(s)");
    }

    private function buildConsolidatedSmsMessage($jobs)
    {
        $shiftCount = $jobs->count();
        $siteName = $jobs->first()->site->site_name ?? 'Unknown Site';
        $siteAddress = $jobs->first()->site->address ?? '';
        
        if ($shiftCount == 1) {
            $job = $jobs->first();
            return "Security Job Alert: 1 shift available at {$siteName} ({$siteAddress}). Start: " . date('d-m-Y H:i', strtotime($job->start));
        }
        
        $message = "Security Jobs Alert: {$shiftCount} shifts available at {$siteName} ({$siteAddress})\n";
        foreach ($jobs as $index => $job) {
            $startTime = date('d-m-Y H:i', strtotime($job->start));
            $endTime = date('H:i', strtotime($job->end));
            $duration = $this->calculateShiftDuration($job->start, $job->end);
            $message .= "Shift " . ($index + 1) . ": {$startTime} - {$endTime} ({$duration} hrs)\n";
        }
        $message .= "Apply now in the app!";
        
        return $message;
    }

    private function calculateShiftDuration($start, $end)
    {
        try {
            $startTime = \Carbon\Carbon::parse($start);
            $endTime = \Carbon\Carbon::parse($end);
            return round($startTime->diffInHours($endTime), 1);
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Send email notification
     */
    private function sendEmail($user, $title, $message, $job)
    {
        if (empty($user->email)) {
            return;
        }

        try {
            Mail::to($user->email)->queue(new \App\Mail\JobNotificationMail($job, $title, $message));
        } catch (\Exception $e) {
            Log::error("Failed to send email to guard #{$user->id}: " . $e->getMessage());
        }
    }

    /**
     * Check if coordinates are within radius
     */
    private function isWithinRadius(string $siteCoords, string $guardCoords, int $radiusKm): bool
    {
        return $this->getDistance($siteCoords, $guardCoords) <= $radiusKm;
    }

    /**
     * Calculate distance between two coordinates
     */
    private function getDistance(string $coords1, string $coords2): float
    {
        [$lat1, $lng1] = $this->parseCoords($coords1);
        [$lat2, $lng2] = $this->parseCoords($coords2);

        if ($lat1 === null || $lat2 === null) {
            return PHP_INT_MAX;
        }

        return $this->haversine($lat1, $lng1, $lat2, $lng2);
    }

    /**
     * Parse coordinates from string format
     */
    private function parseCoords(string $coords): array
    {
        $parts = preg_split('/[\s,]+/', trim($coords));

        return [
            isset($parts[0]) ? (float) $parts[0] : null,
            isset($parts[1]) ? (float) $parts[1] : null,
        ];
    }

    /**
     * Haversine formula to calculate distance between two points
     */
    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $R * $c;
    }

    // public function contractor_accept_job(Request $request, $id)
    // {
    //     $a = null;
    //     $b = '';
        
    //     // Get the roster with conditions
    //     $roster = DB::table('job_rosters')
    //         ->join('sites', 'sites.id', '=', 'job_rosters.site_id')
    //         ->where('job_rosters.id', '=', $request->input('roster_id'))
    //         ->where(function ($query) use ($a, $b) {
    //             return $query->where('job_rosters.assigned_to', '=', $a)
    //                 ->orWhere('job_rosters.assigned_to', '=', $b)
    //                 ->orWhere('job_rosters.accepted_by', '=', $a)
    //                 ->orWhere('job_rosters.accepted_by', '=', $b);
    //         })
    //         ->select('job_rosters.*', 'sites.id as jobId', 'sites.address', 'sites.coordinates')
    //         ->first();

    //     if ($roster != null) {
    //         // Check if assigned_to is already set
    //         if (!is_null($roster->assigned_to) && $roster->assigned_to != '') {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'This job has already been assigned to a staff member.',
    //                 'data' => null,
    //             ], 200);
    //         }

    //         // Check if accepted_by is already set by another contractor
    //         if (!is_null($roster->accepted_by) && $roster->accepted_by != '' && $roster->accepted_by != $id) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'This job has already been accepted by another resource partner.',
    //                 'data' => null,
    //             ], 200);
    //         }

    //         // ✅ FIX: Allow contractor to assign guard if they already accepted the job
    //         // Only return error if trying to accept again WITHOUT assigning a guard
    //         if ($roster->accepted_by == $id && !$request->has('guard_id')) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'You have already accepted this job.',
    //                 'data' => null,
    //             ], 200);
    //         }

    //         // ✅ Only check for rosterExists if NOT already accepted by this contractor
    //         if ($roster->accepted_by != $id) {
    //             $rosterExists = DB::table('job_rosters')
    //                 ->where('id', '=', $request->input('roster_id'))
    //                 ->whereNull('assigned_to')
    //                 ->whereNull('accepted_by')
    //                 ->first();
                
    //             if (!$rosterExists) {
    //                 return response()->json([
    //                     'success' => false,
    //                     'message' => 'Job already accepted or not available!',
    //                     'data' => null,
    //                 ], 200);
    //             }
    //         }
    //     }

    //     try {
    //         $contractor = \App\Models\User::with('contractor')->find($id);

    //         if (!$contractor || !$contractor->contractor) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Resource partner data not found.',
    //                 'data' => null,
    //             ], 200);
    //         }

    //         if ($request->has('guard_id') && !empty($request->guard_id)) {
                
    //         if (!$this->canAcceptJob($request->guard_id, $roster->start, $roster->end)) {
    //                 // Get previous shift details
    //                 $lastShift = DB::table('job_rosters')
    //                     ->where('assigned_to', $request->guard_id)
    //                     ->where('end', '<=', $roster->start)
    //                     ->orderBy('end', 'desc')
    //                     ->first();
                    
    //                 // Get next shift details
    //                 $nextShift = DB::table('job_rosters')
    //                     ->where('assigned_to', $request->guard_id)
    //                     ->where('start', '>=', $roster->end)
    //                     ->orderBy('start', 'asc')
    //                     ->first();
                    
    //                 $previousRestHours = 0;
    //                 $nextRestHours = 0;
    //                 $restrictionReason = '';
                    
    //                 if ($lastShift) {
    //                     $previousRestHours = Carbon::parse($lastShift->end)->diffInHours(Carbon::parse($roster->start));
    //                     if ($previousRestHours < 8) {
    //                         $restrictionReason = 'Only ' . $previousRestHours . ' hours rest before this shift. Need 8 hours.';
    //                     }
    //                 }
                    
    //                 if ($nextShift && empty($restrictionReason)) {
    //                     $nextRestHours = Carbon::parse($roster->end)->diffInHours(Carbon::parse($nextShift->start));
    //                     if ($nextRestHours < 8) {
    //                         $restrictionReason = 'Only ' . $nextRestHours . ' hours rest after this shift. Need 8 hours.';
    //                     }
    //                 }
                    
    //                 return response()->json([
    //                     'success' => false,
    //                     'message' => 'Staff must complete 8 hours rest before or after accepting this shift.',
    //                     'data' => null,
    //                     'details' => [
    //                         'guard_id' => $request->guard_id,
    //                         'shift_start' => $roster->start,
    //                         'shift_end' => $roster->end,
    //                         'previous_shift' => $lastShift ? [
    //                             'end' => $lastShift->end,
    //                             'rest_hours_available' => $previousRestHours,
    //                             'rest_hours_required' => 8,
    //                             'rest_hours_shortfall' => max(0, 8 - $previousRestHours)
    //                         ] : null,
    //                         'next_shift' => $nextShift ? [
    //                             'start' => $nextShift->start,
    //                             'rest_hours_available' => $nextRestHours,
    //                             'rest_hours_required' => 8,
    //                             'rest_hours_shortfall' => max(0, 8 - $nextRestHours)
    //                         ] : null,
    //                         'restriction_reason' => $restrictionReason
    //                     ],
    //                     'roster_details' => [
    //                         'id' => $roster->id,
    //                         'site' => $roster->address,
    //                         'hours' => $roster->hours,
    //                         'asap' => $roster->asap
    //                     ]
    //                 ], 200);
    //             }

    //             // Calculate weekly hours
    //             $rosterStart = Carbon::parse($roster->start);
    //             $weekStart = $rosterStart->copy()->startOfWeek();
    //             $weekEnd = $rosterStart->copy()->endOfWeek();

    //             $currentWeekHours = DB::table('job_rosters')
    //                 ->where('assigned_to', $request->guard_id)
    //                 ->whereBetween('start', [$weekStart, $weekEnd])
    //                 ->sum('hours');

    //             $currentWeekHours = $currentWeekHours ?? 0;
    //             $currentJobHours = $roster->hours ?? 0;
    //             $totalHours = $currentWeekHours + $currentJobHours;

    //             // Get user with staff relationship
    //             $user = \App\Models\User::with('staff')->find($request->guard_id);

    //             if (!$user || !$user->staff) {
    //                 return response()->json([
    //                     'success' => false,
    //                     'message' => 'Staff data not found.',
    //                     'data' => null,
    //                     'details' => [
    //                         'guard_id' => $request->guard_id,
    //                         'user_exists' => $user ? true : false,
    //                         'staff_exists' => $user && $user->staff ? true : false
    //                     ]
    //                 ], 200);
    //             }

    //             // Check visa type and weekly limits
    //             $visaType = $user->staff->staff_document_type;
    //             $maxHours = $visaType === 'student_visa' ? 24 : 38;

    //             if ($totalHours > $maxHours) {
    //                 return response()->json([
    //                     'success' => false,
    //                     'message' => $visaType === 'student_visa' 
    //                         ? 'Weekly limit exceeded (24 hours for student visa).' 
    //                         : 'Weekly limit exceeded (38 hours allowed).',
    //                     'data' => null,
    //                     'details' => [
    //                         'guard_id' => $request->guard_id,
    //                         'visa_type' => $visaType,
    //                         'max_weekly_hours' => $maxHours,
    //                         'current_week_hours' => $currentWeekHours,
    //                         'current_job_hours' => $currentJobHours,
    //                         'total_hours' => $totalHours,
    //                         'hours_remaining' => $maxHours - $totalHours,
    //                         'week_start' => $weekStart->format('Y-m-d'),
    //                         'week_end' => $weekEnd->format('Y-m-d')
    //                     ],
    //                     'roster_details' => [
    //                         'id' => $roster->id,
    //                         'start' => $roster->start,
    //                         'end' => $roster->end,
    //                         'hours' => $roster->hours
    //                     ]
    //                 ], 200);
    //             }

    //             // Check if already assigned to this shift
    //             $is_already_assign = DB::table('job_rosters')
    //                 ->where('assigned_to', $request->guard_id)
    //                 ->whereBetween('start', [$roster->start, $roster->end])
    //                 ->first();
                    
    //             if ($is_already_assign != null) {
    //                 return response()->json([
    //                     'success' => false,
    //                     'message' => 'Staff is already assigned to a shift during this time.',
    //                     'data' => null,
    //                     'details' => [
    //                         'guard_id' => $request->guard_id,
    //                         'requested_shift' => [
    //                             'start' => $roster->start,
    //                             'end' => $roster->end
    //                         ],
    //                         'existing_shift' => [
    //                             'id' => $is_already_assign->id,
    //                             'start' => $is_already_assign->start,
    //                             'end' => $is_already_assign->end
    //                         ]
    //                     ]
    //                 ], 200);
    //             }
    //         }

    //         // Get guard details if provided
    //         $guardName = 'Guard';
    //         if ($request->has('guard_id') && !empty($request->guard_id)) {
    //             $guard = \App\Models\User::find($request->guard_id);
    //             $guardName = $guard ? $guard->name : 'Guard';
    //         }

    //         // Update the roster
    //         $updateData = ['accepted_by' => $id];
            
    //         // Only update assigned_to if guard_id is provided
    //         if ($request->has('guard_id') && !empty($request->guard_id)) {
    //             $updateData['assigned_to'] = $request->guard_id;
    //             $updateData['job_status'] = "confirmed";
    //             $updateData['publish_status'] = 1;
    //         }
            
    //         DB::table('job_rosters')
    //             ->where('id', '=', $request->roster_id)
    //             ->update($updateData);

    //         // Get updated roster data
    //         $updatedRoster = DB::table('job_rosters')
    //             ->join('sites', 'sites.id', '=', 'job_rosters.site_id')
    //             ->where('job_rosters.id', '=', $request->roster_id)
    //             ->select('job_rosters.*', 'sites.id as jobId', 'sites.address', 'sites.coordinates')
    //             ->first();

    //         $startTime = Carbon::parse($updatedRoster->start)->format('g:i A');
    //         $endTime = Carbon::parse($updatedRoster->end)->format('g:i A');

    //         // ============ SEND NOTIFICATIONS ============
            
    //         // 1. Send notification to Client (created_by)
    //         $client = DB::table('users')
    //             ->where('notification_token', '!=', '')
    //             ->where('id', '=', $updatedRoster->created_by)
    //             ->select('notification_token', 'name')
    //             ->first();
            
    //         if ($client && !empty($client->notification_token)) {
    //             $message = $request->has('guard_id') && !empty($request->guard_id) 
    //                 ? $guardName . ' accepted and confirmed the job.'
    //                 : 'Job has been accepted by contractor.';
                    
    //             $clientNotificationData = [
    //                 'message' => $message,
    //                 'title' => 'Job Accepted',
    //                 'notification_token' => $client->notification_token,
    //                 'page' => 'my-job-applications',
    //                 'roster_id' => $request->roster_id
    //             ];
    //             send_push_notification($clientNotificationData);
    //         }

    //         // 2. Send notification to Contractor (accepted_by)
    //         $contractorUser = DB::table('users')
    //             ->where('notification_token', '!=', '')
    //             ->where('id', '=', $id)
    //             ->select('notification_token', 'name')
    //             ->first();
            
    //         if ($contractorUser && !empty($contractorUser->notification_token)) {
    //             $message = $request->has('guard_id') && !empty($request->guard_id)
    //                 ? 'You have successfully accepted the job for ' . $guardName . '.'
    //                 : 'You have successfully accepted the job.';
                    
    //             $contractorNotificationData = [
    //                 'message' => $message,
    //                 'title' => 'Job Accepted Successfully',
    //                 'notification_token' => $contractorUser->notification_token,
    //                 'page' => 'my-job-applications',
    //                 'roster_id' => $request->roster_id
    //             ];
    //             send_push_notification($contractorNotificationData);
    //         }

    //         // 3. Send notification to Staff/Guard (only if guard_id is provided)
    //         if ($request->has('guard_id') && !empty($request->guard_id)) {
    //             $guardUser = DB::table('users')
    //                 ->where('notification_token', '!=', '')
    //                 ->where('id', '=', $request->guard_id)
    //                 ->select('notification_token', 'name')
    //                 ->first();
                
    //             if ($guardUser && !empty($guardUser->notification_token)) {
    //                 $guardNotificationData = [
    //                     'message' => ($contractor->name ?? 'Contractor') . " assigned you a shift from {$startTime} to {$endTime}.",
    //                     'title' => 'New Job Assignment',
    //                     'notification_token' => $guardUser->notification_token,
    //                     'page' => 'my-job-applications',
    //                     'roster_id' => $request->roster_id
    //                 ];
    //                 send_push_notification($guardNotificationData);
    //             }
    //         }

    //         // Prepare response data
    //         $responseData = [
    //             'roster' => $updatedRoster,
    //             'update_details' => $updateData,
    //         ];

    //         return response()->json([
    //             'success' => true,
    //             'message' => $request->has('guard_id') && !empty($request->guard_id) 
    //                 ? 'Job accepted and assigned to guard successfully.' 
    //                 : 'Job accepted successfully.',
    //             'data' => $responseData
    //         ], 200);
            
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'An error occurred while processing the request.',
    //             'error' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ], 500);
    //     }
    // }

    public function getJobsDetail(Request $request)
    {
        // Validate user_id
        if (!$request->has('user_id') || empty($request->user_id)) {
            return response()->json([
                'success' => false,
                'data' => null,
                'code' => 404
            ]);
        }

        $user = User::where('id', $request->user_id)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'data' => null,
                'code' => 404
            ]);
        }

        // Date Range
        $start = $request->has('start') && $request->start != ''
            ? dbFormate($request->start) . ' 00:00'
            : Carbon::now()->startOfWeek()->format('Y-m-d 00:00');

        $end = $request->has('end') && $request->end != ''
            ? dbFormate($request->end) . ' 23:59'
            : Carbon::now()->endOfWeek()->format('Y-m-d 23:59');

        $roster_id = $request->roster_id;

        // Pagination parameters
        $perPage = $request->has('per_page') && !empty($request->per_page) 
            ? (int)$request->per_page 
            : 16; // Default 15 items per page
        
        $page = $request->has('page') && !empty($request->page) 
            ? (int)$request->page 
            : 1; // Default page 1

        $notifyUserIds = [];

        if ($user->user_type === 'contractor') {
            $notifyUserIds = JobRoster::whereBetween('start', [$start, $end])
                ->pluck('assigned_to')
                ->unique()
                ->values()
                ->toArray();

            if (empty($notifyUserIds)) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'code' => 404
                ]);
            }
        }

        $contractorUserIds = [];
        $contractorUserIds = User::whereIn('id', $notifyUserIds)
            ->where('user_id', $user->id)
            ->pluck('id')
            ->toArray();

        // Build the query
        $query = JobRoster::whereBetween('start', [$start, $end])
            ->where('roster_id', $roster_id)
            ->orderBy('start', 'desc')
            ->with([
                'site', 'rosterActivity',
                'guards.staff', 'customer.customer', 'contractor.contractor',
            ])

            ->when($user->user_type === 'staff', function ($q) use ($user) {
                return $q->where('assigned_to', $user->id);
            })
            ->when($user->user_type === 'customer', function ($q) use ($user) {
                return $q->where('created_by', $user->id);
            })
            ->when($user->user_type === 'contractor', function ($q) use ($contractorUserIds, $user) {
                return $q->whereIn('assigned_to', $contractorUserIds)
                    ->orWhere('accepted_by', $user->id);
            });

        // Get paginated results
        $rosters = $query->paginate($perPage, ['*'], 'page', $page);

        // Check if data exists
        if ($rosters->count() > 0) {
            return response()->json([
                'success' => true,
                'data' => $rosters->items(),
                'pagination' => [
                    'current_page' => $rosters->currentPage(),
                    'per_page' => $rosters->perPage(),
                    'total' => $rosters->total(),
                    'last_page' => $rosters->lastPage(),
                    'next_page_url' => $rosters->nextPageUrl(),
                    'prev_page_url' => $rosters->previousPageUrl(),
                    'from' => $rosters->firstItem(),
                    'to' => $rosters->lastItem(),
                ]
            ]);
        }
        
        return response()->json([
            'success' => false, 
            'data' => [],
            'pagination' => [
                'current_page' => $rosters->currentPage(),
                'per_page' => $rosters->perPage(),
                'total' => 0,
                'last_page' => 0,
                'next_page_url' => null,
                'prev_page_url' => null,
                'from' => null,
                'to' => null,
            ]
        ]);
    }

/*
|--------------------------------------------------------------------------
| HOW TO USE THIS FILE
|--------------------------------------------------------------------------
| This is NOT a standalone file to drop into your project. It contains:
|
|   1. The full contractor_accept_job() method (with ONE addition near
|      the bottom — clearly marked "// >>> NEW").
|   2. A new private method sendContractorInvoice() to add to the same
|      controller class.
|
| Copy method #1 OVER your existing contractor_accept_job() method,
| and paste method #2 anywhere else inside the same controller class
| (e.g. right below contractor_accept_job).
|
| Make sure this is imported at the top of your controller file:
|   use App\Mail\ContractorJobInvoice;
|   use Illuminate\Support\Facades\Mail;   (you likely already have this)
*/

public function contractor_accept_job(Request $request, $id)
{
    $a = null;
    $b = '';

    // Get the roster with conditions
    $roster = DB::table('job_rosters')
        ->join('sites', 'sites.id', '=', 'job_rosters.site_id')
        ->where('job_rosters.id', '=', $request->input('roster_id'))
        ->where(function ($query) use ($a, $b) {
            return $query->where('job_rosters.assigned_to', '=', $a)
                ->orWhere('job_rosters.assigned_to', '=', $b)
                ->orWhere('job_rosters.accepted_by', '=', $a)
                ->orWhere('job_rosters.accepted_by', '=', $b);
        })
        ->select('job_rosters.*', 'sites.id as jobId', 'sites.address', 'sites.coordinates')
        ->first();

    if ($roster != null) {
        // Check if assigned_to is already set
        if (!is_null($roster->assigned_to) && $roster->assigned_to != '') {
            return response()->json([
                'success' => false,
                'message' => 'This job has already been assigned to a staff member.',
                'data' => null,
            ], 200);
        }

        // Check if accepted_by is already set by another contractor
        if (!is_null($roster->accepted_by) && $roster->accepted_by != '' && $roster->accepted_by != $id) {
            return response()->json([
                'success' => false,
                'message' => 'This job has already been accepted by another resource partner.',
                'data' => null,
            ], 200);
        }

        // ✅ FIX: Allow contractor to assign guard if they already accepted the job
        // Only return error if trying to accept again WITHOUT assigning a guard
        if ($roster->accepted_by == $id && !$request->has('guard_id')) {
            return response()->json([
                'success' => false,
                'message' => 'You have already accepted this job.',
                'data' => null,
            ], 200);
        }

        // ✅ Only check for rosterExists if NOT already accepted by this contractor
        if ($roster->accepted_by != $id) {
            $rosterExists = DB::table('job_rosters')
                ->where('id', '=', $request->input('roster_id'))
                ->whereNull('assigned_to')
                ->whereNull('accepted_by')
                ->first();

            if (!$rosterExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job already accepted or not available!',
                    'data' => null,
                ], 200);
            }
        }
    }

    try {
        $contractor = \App\Models\User::with('contractor')->find($id);

        if (!$contractor || !$contractor->contractor) {
            return response()->json([
                'success' => false,
                'message' => 'Resource partner data not found.',
                'data' => null,
            ], 200);
        }

        if ($request->has('guard_id') && !empty($request->guard_id)) {

        if (!$this->canAcceptJob($request->guard_id, $roster->start, $roster->end)) {
                // Get previous shift details
                $lastShift = DB::table('job_rosters')
                    ->where('assigned_to', $request->guard_id)
                    ->where('end', '<=', $roster->start)
                    ->orderBy('end', 'desc')
                    ->first();

                // Get next shift details
                $nextShift = DB::table('job_rosters')
                    ->where('assigned_to', $request->guard_id)
                    ->where('start', '>=', $roster->end)
                    ->orderBy('start', 'asc')
                    ->first();

                $previousRestHours = 0;
                $nextRestHours = 0;
                $restrictionReason = '';

                if ($lastShift) {
                    $previousRestHours = Carbon::parse($lastShift->end)->diffInHours(Carbon::parse($roster->start));
                    if ($previousRestHours < 8) {
                        $restrictionReason = 'Only ' . $previousRestHours . ' hours rest before this shift. Need 8 hours.';
                    }
                }

                if ($nextShift && empty($restrictionReason)) {
                    $nextRestHours = Carbon::parse($roster->end)->diffInHours(Carbon::parse($nextShift->start));
                    if ($nextRestHours < 8) {
                        $restrictionReason = 'Only ' . $nextRestHours . ' hours rest after this shift. Need 8 hours.';
                    }
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Staff must complete 8 hours rest before or after accepting this shift.',
                    'data' => null,
                    'details' => [
                        'guard_id' => $request->guard_id,
                        'shift_start' => $roster->start,
                        'shift_end' => $roster->end,
                        'previous_shift' => $lastShift ? [
                            'end' => $lastShift->end,
                            'rest_hours_available' => $previousRestHours,
                            'rest_hours_required' => 8,
                            'rest_hours_shortfall' => max(0, 8 - $previousRestHours)
                        ] : null,
                        'next_shift' => $nextShift ? [
                            'start' => $nextShift->start,
                            'rest_hours_available' => $nextRestHours,
                            'rest_hours_required' => 8,
                            'rest_hours_shortfall' => max(0, 8 - $nextRestHours)
                        ] : null,
                        'restriction_reason' => $restrictionReason
                    ],
                    'roster_details' => [
                        'id' => $roster->id,
                        'site' => $roster->address,
                        'hours' => $roster->hours,
                        'asap' => $roster->asap
                    ]
                ], 200);
            }

            // Calculate weekly hours
            $rosterStart = Carbon::parse($roster->start);
            $weekStart = $rosterStart->copy()->startOfWeek();
            $weekEnd = $rosterStart->copy()->endOfWeek();

            $currentWeekHours = DB::table('job_rosters')
                ->where('assigned_to', $request->guard_id)
                ->whereBetween('start', [$weekStart, $weekEnd])
                ->sum('hours');

            $currentWeekHours = $currentWeekHours ?? 0;
            $currentJobHours = $roster->hours ?? 0;
            $totalHours = $currentWeekHours + $currentJobHours;

            // Get user with staff relationship
            $user = \App\Models\User::with('staff')->find($request->guard_id);

            if (!$user || !$user->staff) {
                return response()->json([
                    'success' => false,
                    'message' => 'Staff data not found.',
                    'data' => null,
                    'details' => [
                        'guard_id' => $request->guard_id,
                        'user_exists' => $user ? true : false,
                        'staff_exists' => $user && $user->staff ? true : false
                    ]
                ], 200);
            }

            // Check visa type and weekly limits
            $visaType = $user->staff->staff_document_type;
            $maxHours = $visaType === 'student_visa' ? 24 : 38;

            if ($totalHours > $maxHours) {
                return response()->json([
                    'success' => false,
                    'message' => $visaType === 'student_visa'
                        ? 'Weekly limit exceeded (24 hours for student visa).'
                        : 'Weekly limit exceeded (38 hours allowed).',
                    'data' => null,
                    'details' => [
                        'guard_id' => $request->guard_id,
                        'visa_type' => $visaType,
                        'max_weekly_hours' => $maxHours,
                        'current_week_hours' => $currentWeekHours,
                        'current_job_hours' => $currentJobHours,
                        'total_hours' => $totalHours,
                        'hours_remaining' => $maxHours - $totalHours,
                        'week_start' => $weekStart->format('Y-m-d'),
                        'week_end' => $weekEnd->format('Y-m-d')
                    ],
                    'roster_details' => [
                        'id' => $roster->id,
                        'start' => $roster->start,
                        'end' => $roster->end,
                        'hours' => $roster->hours
                    ]
                ], 200);
            }

            // Check if already assigned to this shift
            $is_already_assign = DB::table('job_rosters')
                ->where('assigned_to', $request->guard_id)
                ->whereBetween('start', [$roster->start, $roster->end])
                ->first();

            if ($is_already_assign != null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Staff is already assigned to a shift during this time.',
                    'data' => null,
                    'details' => [
                        'guard_id' => $request->guard_id,
                        'requested_shift' => [
                            'start' => $roster->start,
                            'end' => $roster->end
                        ],
                        'existing_shift' => [
                            'id' => $is_already_assign->id,
                            'start' => $is_already_assign->start,
                            'end' => $is_already_assign->end
                        ]
                    ]
                ], 200);
            }
        }

        // Get guard details if provided
        $guardName = 'Guard';
        if ($request->has('guard_id') && !empty($request->guard_id)) {
            $guard = \App\Models\User::find($request->guard_id);
            $guardName = $guard ? $guard->name : 'Guard';
        }

        // Update the roster
        $updateData = ['accepted_by' => $id];

        // Only update assigned_to if guard_id is provided
        if ($request->has('guard_id') && !empty($request->guard_id)) {
            $updateData['assigned_to'] = $request->guard_id;
            $updateData['job_status'] = "confirmed";
            $updateData['publish_status'] = 1;
        }

        DB::table('job_rosters')
            ->where('id', '=', $request->roster_id)
            ->update($updateData);

        // Get updated roster data
        $updatedRoster = DB::table('job_rosters')
            ->join('sites', 'sites.id', '=', 'job_rosters.site_id')
            ->where('job_rosters.id', '=', $request->roster_id)
            ->select('job_rosters.*', 'sites.id as jobId', 'sites.address', 'sites.coordinates')
            ->first();

        $startTime = Carbon::parse($updatedRoster->start)->format('g:i A');
        $endTime = Carbon::parse($updatedRoster->end)->format('g:i A');

        // ============ SEND NOTIFICATIONS ============

        // 1. Send notification to Client (created_by)
        $client = DB::table('users')
            ->where('notification_token', '!=', '')
            ->where('id', '=', $updatedRoster->created_by)
            ->select('notification_token', 'name')
            ->first();

        if ($client && !empty($client->notification_token)) {
            $message = $request->has('guard_id') && !empty($request->guard_id)
                ? $guardName . ' accepted and confirmed the job.'
                : 'Job has been accepted by contractor.';

            $clientNotificationData = [
                'message' => $message,
                'title' => 'Job Accepted',
                'notification_token' => $client->notification_token,
                'page' => 'my-job-applications',
                'roster_id' => $request->roster_id
            ];
            send_push_notification($clientNotificationData);
        }        

        // 3. Send notification to Staff/Guard (only if guard_id is provided)
        if ($request->has('guard_id') && !empty($request->guard_id)) {
            $guardUser = DB::table('users')
                ->where('notification_token', '!=', '')
                ->where('id', '=', $request->guard_id)
                ->select('notification_token', 'name')
                ->first();

            if ($guardUser && !empty($guardUser->notification_token)) {
                $guardNotificationData = [
                    'message' => ($contractor->name ?? 'Contractor') . " assigned you a shift from {$startTime} to {$endTime}.",
                    'title' => 'New Job Assignment',
                    'notification_token' => $guardUser->notification_token,
                    'page' => 'my-job-applications',
                    'roster_id' => $request->roster_id
                ];
                send_push_notification($guardNotificationData);
            }
        }

        // >>> NEW: 4. Send invoice email to client + admin with contractor details,
        // only once a guard has actually been assigned (job confirmed).
        if ($request->has('guard_id') && !empty($request->guard_id)) {
            $this->sendContractorInvoice($contractor, $updatedRoster, $guardName);
        }

        // Prepare response data
        $responseData = [
            'roster' => $updatedRoster,
            'update_details' => $updateData,
        ];

        return response()->json([
            'success' => true,
            'message' => $request->has('guard_id') && !empty($request->guard_id)
                ? 'Job accepted and assigned to guard successfully.'
                : 'Job accepted successfully.',
            'data' => $responseData
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'An error occurred while processing the request.',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
}

// >>> NEW: add this method anywhere else in the same controller class

/**
 * Sends an invoice/confirmation email to the job's client and all admins,
 * clearly identifying the contractor (resource partner) who fulfilled it —
 * so billing/records reflect the contractor's name, not Staffoo.
 *
 * @param \App\Models\User $contractor  The contractor who accepted the job (has ->contractor relation loaded)
 * @param object           $roster      The updated job_rosters + sites row
 * @param string           $guardName   Name of the guard assigned to the shift
 */
private function sendContractorInvoice($contractor, $roster, $guardName)
{
    $clientEmail = DB::table('users')->where('id', $roster->created_by)->value('email');

    $adminEmails = DB::table('users')
        ->where('user_type', 'admin')
        ->where('is_active', 1)
        ->pluck('email');

    $invoiceData = [
        'contractor_name'    => $contractor->name,
        'contractor_company' => $contractor->contractor->company_name ?? null, // adjust field name to match your contractors table
        'contractor_email'   => $contractor->email,
        'contractor_phone'   => $contractor->phone,
        'contractor_abn'     => $contractor->contractor->abn ?? null,          // adjust/remove if you don't store ABN
        'guard_name'         => $guardName,
        'roster'             => $roster,
    ];

    try {
        if ($clientEmail) {
            \Illuminate\Support\Facades\Mail::to($clientEmail)
                ->queue(new \App\Mail\ContractorJobInvoice($invoiceData));
        }

        foreach ($adminEmails as $adminEmail) {
            if (!empty($adminEmail)) {
                \Illuminate\Support\Facades\Mail::to($adminEmail)
                    ->queue(new \App\Mail\ContractorJobInvoice($invoiceData));
            }
        }

        \Illuminate\Support\Facades\Log::info('Contractor job invoice queued.', [
            'contractor_id' => $contractor->id,
            'roster_id' => $roster->id,
            'client_email' => $clientEmail,
            'admin_count' => $adminEmails->count(),
        ]);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Failed to send contractor invoice: ' . $e->getMessage(), [
            'contractor_id' => $contractor->id ?? null,
            'roster_id' => $roster->id ?? null,
        ]);
    }
}

/**
 * Check whether a user (contractor OR Staffoo/id 1) is allowed to
 * receive job notifications for the given site state, based on their
 * states_allowed column (e.g. ["nsw","vic"]).
 */
private function userAllowedForState($user, ?string $siteState): bool
{
    if (!$user || !$siteState) {
        return false;
    }

    $allowed = $user->states_allowed;

    if (is_string($allowed)) {
        $allowed = json_decode($allowed, true) ?? [];
    }

    if (!is_array($allowed) || empty($allowed)) {
        return false;
    }

    $abbrMap = [
        'victoria'                      => 'vic',
        'new south wales'                => 'nsw',
        'queensland'                     => 'qld',
        'south australia'                => 'sa',
        'western australia'              => 'wa',
        'tasmania'                       => 'tas',
        'australian capital territory'   => 'act',
        'northern territory'             => 'nt',
        'punjab'                         => 'punjab',
    ];

    $siteStateNormalized = strtolower(trim($siteState));
    $siteStateAbbr = $abbrMap[$siteStateNormalized] ?? $siteStateNormalized;

    foreach ($allowed as $state) {
        $stateNormalized = strtolower(trim($state));
        $stateAbbr = $abbrMap[$stateNormalized] ?? $stateNormalized;

        if ($stateAbbr === $siteStateAbbr) {
            return true;
        }
    }

    return false;
}

public function checkState(Request $request)
{
    // Get user with ID 1
    $user = User::find(1);
    
    if (!$user) {
        return response()->json([
            'status' => false,
            'message' => 'User not found'
        ], 404);
    }
    
    $state = $request->input('state'); // "vic"
    $statesAllowed = $user->states_allowed; // ["vic"] or JSON string
    
    // If states_allowed is stored as JSON string, decode it
    if (is_string($statesAllowed)) {
        $statesAllowed = json_decode($statesAllowed, true);
    }
    
    $result = in_array($state, $statesAllowed);
    
    return response()->json([
        'state_match' => $result,
        'message' => $result ? 'State is allowed for user' : 'State is not allowed for user',
        'user_id' => $user->id,
        'user_states' => $statesAllowed
    ]);
}

public function calculateJobAmount(Request $request)
{
    // Validate request
    $validator = Validator::make($request->all(), [
        'shifts' => 'required|array|min:1',
        'shifts.*.start_time' => 'required',
        'shifts.*.end_time' => 'required',
        'shifts.*.number_of_guards' => 'required|integer|min:1',
        'state' => 'required|string'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    // Calculate total hours for all shifts
    $totalHours = [
        'morning' => 0,
        'night' => 0,
        'saturday_morning' => 0,
        'saturday_night' => 0,
        'sunday_morning' => 0,
        'sunday_night' => 0,
        'ph_morning' => 0,
        'ph_night' => 0
    ];

    foreach ($request->shifts as $shift) {
        $hours = getShiftHours($shift['start_time'], $shift['end_time']);
        $guards = $shift['number_of_guards'] ?? 1;
        
        foreach ($totalHours as $key => $value) {
            $totalHours[$key] += ($hours[$key] ?? 0) * $guards;
        }
    }

    // Get charge rates
    $chargeRates = ContractorChargeRate::where('state', $request->state)->get();

    if ($chargeRates->isEmpty()) {
        return response()->json([
            'success' => false,
            'message' => 'No charge rates found'
        ], 404);
    }

    // Calculate amounts
    $amounts = [];
    foreach ($chargeRates as $rate) {
        $amount = 
            ($rate->def_metro_mon_to_fri_day_rate * $totalHours['morning']) +
            ($rate->def_metro_mon_to_fri_night_rate * $totalHours['night']) +
            ($rate->def_metro_sat_day_rate * ($totalHours['saturday_morning'] + $totalHours['saturday_night'])) +
            ($rate->def_metro_sun_day_rate * ($totalHours['sunday_morning'] + $totalHours['sunday_night'])) +
            ($rate->def_metro_pub_holi_day_rate * ($totalHours['ph_morning'] + $totalHours['ph_night']));
        
        $amounts[] = round($amount, 2);
    }

    return response()->json([
        'success' => true,
        'data' => [
            'min' => min($amounts),
            'max' => max($amounts),
            'difference' => round(max($amounts) - min($amounts), 2),
            'average' => round(array_sum($amounts) / count($amounts), 2)
        ]
    ]);
}
}
