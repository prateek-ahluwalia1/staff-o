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
            $site = Site::where('coordinates', $request->coordinates)->first();
    
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
            $chargeRate           = ChargeRate::find(1);
    
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
                    ($chargeRate->def_metro_sun_day_rate          * (($hours['sunday_morning']   ?? 0) + ($hours['sunday_night']   ?? 0)));
    
                $serviceFee  = round($jobAmount * 0.10, 2);
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
                    'start'          => $start,
                    'end'            => $end,
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
                        'publish_status'   => 1,
                        'roster_id'        => $jobNewRoster->id,
                        'job_instrcutions' => $jobInstructionsValue,
                        'created_by'       => $request->user_id,
                        'assigned_to'      => null,
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
                    ];
    
                    $jobId = JobRoster::insertGetId($roster);
                    $createdJobIds[] = $jobId;
    
                    // TASKS
                    if (!empty($request->tasks)) {
                        foreach ($request->tasks as $task) {
                            JobRosterTask::create([
                                'job_roster_id' => $jobId,
                                'task'          => $task['task'],
                                'task_start'    => dbFormateDateTime($task['task_start']),
                                'task_end'      => dbFormateDateTime($task['task_end']),
                            ]);
                        }
                    }
    
                    $createdJob = JobRoster::with('site')->find($jobId);
    
                    $this->sendNotificationsWithinRadius(
                        $site->coordinates,
                        [$jobId],
                        $request->user_id,
                        $createdJob
                    );
                }
            }
    
            if (!$isAdminOverride) {
                Transaction::where('payment_intent_id', $paymentIntentId)
                    ->update(['job_roster_id' => json_encode($createdJobIds)]);
            }
    
            // ════════════════════════════════════════════════════════════════
            //  INVOICE  →  GENERATE PDF + SEND EMAIL
            // ════════════════════════════════════════════════════════════════
            if (!$isAdminOverride) {
                $this->sendJobInvoice(
                    user:             $user,
                    shifts:           $invoiceShifts,
                    baseTotal:        $invoiceBaseTotal,
                    transaction:      $transaction,
                    invoiceNumber:    'STAFFOO -' . strtoupper(substr($paymentIntentId, -8)),
                    paymentIntentId:  $paymentIntentId,
                );
            }
            // ════════════════════════════════════════════════════════════════
    
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
    
   private function sendJobInvoice(
    $user,
    array $shifts,
    float $baseTotal,
    $transaction,
    string $invoiceNumber,
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
        ];
 
        $pdfBytes  = app(\App\Services\InvoiceService::class)->generatePdf($invoiceData);
        $pdfBase64 = base64_encode($pdfBytes);
 
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

    /**
     * Send notifications to staff (user_id=1) within 5km radius
     */
    private function sendNotificationsWithinRadius($siteCoordinates, $jobIds, $userId, $roster)
    {
        $radiusKm = 500; // 5km radius
        $notifiedUsers = [];

        // Get all staff with user_id = 1
        $staff = User::where('user_id', 1)
        ->where('is_active', 1)
        ->where('user_type', 'staff')
        ->whereNotNull('coordinates')
        ->whereNotNull('notification_token')
        ->whereHas('guardQuestionnaireDetails', function ($query) {
            $query->whereNotNull('certificate_path');
        })
        ->whereDoesntHave('guardQuestionnaireDetails', function ($query) {
            $query->whereNull('certificate_path');
        })
        ->select('id', 'name', 'coordinates', 'notification_token')
        ->get();

        if($staff->isEmpty()){
            $staff = User::where('is_active', 1)
            // ->whereNotIn('user_id', $userId)
            ->where('user_type', 'contractor')
            ->whereNotNull('coordinates')
            ->whereNotNull('notification_token')
            ->select('id', 'name', 'coordinates', 'notification_token')
            ->get();
        }


        foreach ($staff as $staffMember) {
            // Calculate distance between site and staff
            $distance = $this->calculateDistance($siteCoordinates, $staffMember->coordinates);

            // Check if within 5km radius
            if ($distance <= $radiusKm) {

                // Send notification if token exists
                if ($staffMember->notification_token) {
                    $notificationSent = send_push_notification([
                        'notification_token' => $staffMember->notification_token,
                        'message'            => "New ASAP job available within 5km of your location. Please check your app.",
                        'title'              => 'ASAP Job Nearby',
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
            }
        }

        // Update each job roster with notified users
        $this->updateJobRosterWithNotifiedUsers($jobIds, $notifiedUsers, $radiusKm);

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

    public function getContractorStaff($id)
    {
        $guards = User::where('user_id', $id)->with('staff')->where('user_type', 'staff')->get();

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

    public function getContractorActiveStaff($id)
    {
        // $guards = User::where('user_id', $id)->with('staff')->where('is_active', 1)->where('user_type', 'staff')->get();
         $guards = User::where('user_id', $id)
        ->where('is_active', 1)
        ->where('user_type', 'staff')
        ->whereNotNull('coordinates')
        ->whereHas('guardQuestionnaireDetails', function ($query) {
            $query->whereNotNull('certificate_path');
        })
        ->whereDoesntHave('guardQuestionnaireDetails', function ($query) {
            $query->whereNull('certificate_path');
        })
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

    // public function getShiftHours($start, $end, $siteID = null, $continuation = false, $public_holiday = null, $ph_duration = null)
    // {
    //     $actual_start = $start;
    //     $actual_end = $end;
    //     $day_start = Carbon::parse($start)->format('l');
    //     $day_end = Carbon::parse($end)->format('l');

    //     $start = strtotime($start);
    //     $end = strtotime($end);

    //     $diff = $end - $start;
    //     $hours = round($diff / (60 * 60), 2);
    //     $hoursCond = round($diff / (60 * 60), 2);

    //     $morning_start = 6;
    //     $morning_end = 18;

    //     $night_start = 18;
    //     $night_end = 6;

    //     $shift_start = $this->convert_into_fraction($start);
    //     $shift_end = $this->convert_into_fraction($end);

    //     if ($shift_end < $shift_start) {
    //         $diff_new = $shift_end + 24 - $shift_start;
    //         if ($diff > $diff_new) {
    //             $hours = $diff_new;
    //         }
    //     }

    //     $saturday_start = 0;
    //     $saturday_end = 0;
    //     $total_saturday_hours = 0;

    //     $total_ph_hours = 0;
    //     $ph_start = 0;
    //     $ph_end = 0;

    //     // publid holiday calculation start here
    //     $start_in_public_holiday = false;
    //     $end_in_public_holiday = false;
    //     // if ($siteID != null) {
    //     //     $site_state = Site::where('id', $siteID)->select('state')->first();
    //     //     $states_array = array(
    //     //         'Victoria' => 'vic',
    //     //         'New South Wales' => 'nsw',
    //     //         'NSW' => 'nsw',
    //     //         'Queensland' => 'qld',
    //     //         'Tasmania' => 'tas',
    //     //         'Western Australia' => 'wa',
    //     //         'South Australia' => 'sa',
    //     //         'ACT' => 'act'
    //     //     );
    //     //     $state = $site_state->state != '' ? $states_array[$site_state->state] : 'vic';
    //     // } else {
    //     $state = 'vic';
    //     // }

    //     if ($day_start == 'Saturday' && $day_end == 'Saturday') {
    //         $total_saturday_hours = $hours;
    //         $saturday_start = $shift_start;
    //         $saturday_end = $shift_end;
    //         $shift_start = 0;
    //         $shift_end = 0;
    //         $hours = 0;
    //     } elseif ($day_start == 'Saturday' && $day_end != 'Saturday') {
    //         $sat_end = strtotime(date('m/d/Y 23:59:59', $start));
    //         $diff = $sat_end - $start;
    //         $total_saturday_hours = round($diff / (60 * 60), 2);
    //         $saturday_start = $shift_start;
    //         $saturday_end = $this->convert_into_fraction($sat_end);
    //         $shift_start = 0;
    //         $shift_end = 0;
    //         $hours = $hours - $total_saturday_hours;
    //     } elseif ($day_start != 'Saturday' && $day_end == 'Saturday') {
    //         $sat_start = strtotime(date('m/d/Y 00:00:00', $end));
    //         $diff = $end - $sat_start;
    //         $total_saturday_hours = round($diff / (60 * 60), 2);
    //         $saturday_start = $this->convert_into_fraction($sat_start);
    //         $saturday_end = $shift_end;
    //         $shift_end = 24;
    //         $hours = $hours - $total_saturday_hours;
    //     }
    //     // sunday_calcultaon
    //     $sunday_start = 0;
    //     $sunday_end = 0;
    //     $total_sunday_hours = 0;
    //     if ($day_start == 'Sunday' && $day_end == 'Sunday') {
    //         $total_sunday_hours = $hours;
    //         $sunday_start = $shift_start;
    //         $sunday_end = $shift_end;
    //         $shift_start = 0;
    //         $shift_end = 0;
    //         $hours = 0;
    //     } elseif ($day_start == 'Sunday' && $day_end != 'Sunday') {
    //         $sun_end = strtotime(date('m/d/Y 23:59:59', $start));
    //         $diff = $sun_end - $start;
    //         $total_sunday_hours = round($diff / (60 * 60), 2);
    //         $sunday_start = $shift_start;
    //         $sunday_end = $this->convert_into_fraction($sun_end);

    //         $shift_start = 0;
    //         $hours = $hours - $total_sunday_hours;
    //     } elseif ($day_start != 'Sunday' && $day_end == 'Sunday') {
    //         $sun_start = strtotime(date('m/d/Y 00:00:00', $end));
    //         // $diff = $end - $sun_start;
    //         // $total_sunday_hours = round($diff / ( 60 * 60 ), 2);
    //         $sunday_start = $this->convert_into_fraction($sun_start);
    //         $sunday_end = $this->convert_into_fraction($end);
    //         $total_sunday_hours = $sunday_end - $sunday_start;
    //         $shift_end = 24;
    //         $shift_start = 24;
    //         $hours = $hours - $total_sunday_hours;
    //     }
    //     if ($start_in_public_holiday && $end_in_public_holiday) {
    //         $shift_start = 0;
    //         $shift_end = 0;
    //         $saturday_start = 0;
    //         $saturday_end = 0;
    //         $sunday_start = 0;
    //         $sunday_end = 0;
    //         $total_sunday_hours = 0;
    //         $total_saturday_hours = 0;
    //     }



    //     // print('<br>total sat: ');   
    //     // print_r($total_saturday_hours);
    //     // print('<br>start: ');   

    //     // print('<br>hours : ');   
    //     // print_r($hours);
    //     // exit();
    //     // print_r($shift_end);
    //     // print('<br>');

    //     // exit();
    //     if ($shift_end < $shift_start && $shift_end < 6 && $shift_end >= 1) {
    //         $shift_end += 24;
    //     }

    //     // print_r($morning_start);
    //     // print('<br>');
    //     // print_r($morning_end);
    //     // print('<br>');
    //     // print_r($shift_start);
    //     // print('<br>end:     ');   
    //     // print_r($shift_end);
    //     $morning = $this->calculateHoursMorning($shift_start, $shift_end, $morning_start, $morning_end, $actual_start, $actual_end);
    //     if ($morning > 12) {
    //         $morning = $morning - 12;
    //     }
    //     $saturday_morning = round($this->calculateHoursMorning($saturday_start, $saturday_end, $morning_start, $morning_end, $actual_start, $actual_end), 2);

    //     $sunday_morning = round($this->calculateHoursMorning($sunday_start, $sunday_end, $morning_start, $morning_end, $actual_start, $actual_end), 2);

    //     $ph_morning = round($this->calculateHoursMorning($ph_start, $ph_end, $morning_start, $morning_end, $actual_start, $actual_end), 2);
    //     if ($hoursCond > 40) {
    //         $startedDate = Carbon::parse($actual_start);
    //         $startedTime = $startedDate->format('H.i');
    //         $endedDate = Carbon::parse($actual_end);
    //         $endedTime = $endedDate->format('H.i');
    //         // return [$actual_start,$startedTime,$endedTime];
    //         $morningTiming = 0;
    //         $nightTiming = 0;
    //         $saturday_morning = 0;
    //         $saturday_night = 0;
    //         $sunday_morning = 0;
    //         $sunday_night = 0;
    //         $sunday_night = 0;
    //         $ph_morning = 0;
    //         $ph_night = 0;
    //         $morning = 0;
    //         $night = 0;

    //         $morningTiming = ($startedTime >= 6 && $startedTime < 18 && $endedTime >= 6 && $endedTime < 18) ? 1 : 0;
    //         $nightTiming = (($startedTime >= 18 || $startedTime < 6) && ($endedTime >= 18 || $endedTime < 6)) ? 1 : 0;
    //         // return [$morningTiming, $nightTiming];
    //         // If both $morningTiming and $nightTiming are 0, determine if the time lies in day or night
    //         if ($morningTiming === 0 && $nightTiming === 0) {
    //             $morningTiming = ($startedTime > 6 && $startedTime < 18 || $endedTime > 6 && $endedTime < 18) ? 1 : 0;
    //             $nightTiming = ($startedTime > 18 || $startedTime < 6 || $endedTime > 18 || $endedTime < 6) ? 1 : 0;
    //         }
    //         //     return $spansDayAndNight = 
    //         // (($startedTime >= 6 && $startedTime < 18) && ($endedTime >= 18 || $endedTime < 6)) ||
    //         // (($startedTime >= 18 || $startedTime < 6) && ($endedTime >= 6 && $endedTime < 18)) ? 1 : 0;
    //         if ($morningTiming <= 1 && $nightTiming <= 1) {
    //             $start_date = Carbon::parse($actual_start);
    //             $end_date = Carbon::parse($actual_end);
    //             // return [$actual_start, $actual_end];
    //             $public_holidays = ['2029-05-10', '2029-05-15'];

    //             $morning_shift_start = $start_date->copy()->setTime(6, 0, 0);
    //             $morning_shift_end = $start_date->copy()->setTime(18, 0, 0);

    //             $night_shift_start = $start_date->copy()->setTime(18, 0, 0);
    //             $night_shift_end = $night_shift_start->copy()->setTime(6, 0, 0);

    //             if ($night_shift_end->lt($night_shift_start)) {
    //                 $night_shift_end->addDay();
    //             }

    //             $morning_shift_times = [];
    //             $night_shift_times = [];
    //             $saturday_morning = [];
    //             $saturday_night = [];
    //             $sunday_morning = [];
    //             $sunday_night = [];
    //             $ph_morning = [];
    //             $ph_night = [];

    //             $night_hours = 0;
    //             $morning_hours = 0;
    //             $saturday_morning_hours = 0;
    //             $saturday_night_hours = 0;
    //             $sunday_morning_hours = 0;
    //             $sunday_night_hours = 0;

    //             if (in_array($start_date->toDateString(), $public_holidays)) {
    //                 // Implement logic for public holiday
    //                 // Add shift times to $ph_morning and $ph_night arrays
    //                 $ph_morning[] = [$morning_shift_start->format('H:i'), $morning_shift_end->format('H:i')];
    //                 $ph_night[] = [$night_shift_start->format('H:i'), $night_shift_end->format('H:i')];
    //             } else {

    //                 if ($start_date->isFriday() && $end_date->isSaturday()) {

    //                     $friday_end = $start_date->copy()->endOfDay();
    //                     $friday_minutes = $start_date->diffInMinutes($friday_end);

    //                     $friday_hours = $friday_minutes / 60;

    //                     $night_shift_times[] = [$start_date->format('H:i'), '23:59'];

    //                     $saturday_start = $end_date->copy()->startOfDay();
    //                     $saturday_minutes = $saturday_start->diffInMinutes($end_date);

    //                     $saturday_hours = $saturday_minutes / 60;

    //                     // $saturday_night[] = ['00:01', $end_date->format('H:i')];

    //                     $total_shift_hours = $friday_hours + $saturday_hours;

    //                     if ($total_shift_hours < 4) {

    //                         $remaining_hours = 4 - $total_shift_hours;

    //                         $whole_hours = floor($remaining_hours);
    //                         $fractional_hours = $remaining_hours - $whole_hours;
    //                         $additional_minutes = $fractional_hours * 60;
    //                         $extended_end = $end_date->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                         $saturday_night[] = ['00:01', $extended_end->format('H:i')];
    //                     }

    //                     foreach ($saturday_night as $time_range) {
    //                         // Parse the start and end times using Carbon
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         // Calculate the difference in hours
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         // Add to total morning hours
    //                         $saturday_night_hours += $hours;
    //                         $saturday_night_hours = round($saturday_night_hours * 2) / 2;
    //                     }

    //                     foreach ($night_shift_times as $time_range) {
    //                         // Parse the start and end times using Carbon
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         // Calculate the difference in hours
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         // Add to total morning hours
    //                         $night_hours += $hours;
    //                         $night_hours = round($night_hours * 2) / 2;
    //                     }
    //                 } elseif ($start_date->isSaturday() && $end_date->isSunday()) {
    //                     if ($start_date->lt($morning_shift_end) && $end_date->gt($morning_shift_start)) {
    //                         $morning_start = max($start_date, $morning_shift_start);
    //                         $morning_end = min($end_date, $morning_shift_end);

    //                         $saturday_morning[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];
    //                     }

    //                     $saturday_end = $start_date->copy()->endOfDay();
    //                     $saturday_minutes = $start_date->diffInMinutes($saturday_end);
    //                     $saturday_hours = $saturday_minutes / 60;

    //                     $saturday_night[] = [$start_date->format('H:i'), '23:59'];

    //                     $sunday_start = $end_date->copy()->startOfDay();
    //                     $sunday_minutes = $sunday_start->diffInMinutes($end_date);
    //                     $sunday_hours = $sunday_minutes / 60;

    //                     $total_shift_hours = $saturday_hours + $sunday_hours;

    //                     if ($total_shift_hours < 4) {
    //                         $remaining_hours = 4 - $total_shift_hours;

    //                         $whole_hours = floor($remaining_hours);
    //                         $fractional_hours = $remaining_hours - $whole_hours;

    //                         $additional_minutes = $fractional_hours * 60;

    //                         $extended_end = $end_date->copy()->addHours($whole_hours)->addMinutes($additional_minutes);

    //                         $sunday_night[] = ['00:01', $extended_end->format('H:i')];
    //                     }

    //                     foreach ($sunday_night as $time_range) {
    //                         // Parse the start and end times using Carbon
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         // Calculate the difference in hours
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         // Add to total morning hours
    //                         $sunday_night_hours += $hours;
    //                         $sunday_night_hours = round($sunday_night_hours * 2) / 2;
    //                     }

    //                     foreach ($saturday_night as $time_range) {
    //                         // Parse the start and end times using Carbon
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         // Calculate the difference in hours
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         // Add to total morning hours
    //                         $saturday_night_hours += $hours;
    //                         $saturday_night_hours = round($saturday_night_hours * 2) / 2;
    //                     }

    //                     foreach ($saturday_morning as $time_range) {
    //                         // Parse the start and end times using Carbon
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         // Calculate the difference in hours
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         // Add to total morning hours
    //                         $saturday_morning_hours += $hours;
    //                         $saturday_morning_hours = round($saturday_morning_hours * 2) / 2;
    //                     }
    //                 } elseif ($start_date->isSunday() && $end_date->isMonday()) {
    //                     // Check for Sunday morning shift
    //                     if ($start_date->lt($morning_shift_end) && $end_date->gt($morning_shift_start)) {
    //                         $morning_start = max($start_date, $morning_shift_start);
    //                         $morning_end = min($end_date, $morning_shift_end);

    //                         $sunday_morning[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];
    //                     }

    //                     $sunday_end = $start_date->copy()->endOfDay();
    //                     $sunday_minutes = $start_date->diffInMinutes($sunday_end);
    //                     $sunday_hours = $sunday_minutes / 60;

    //                     $sunday_night[] = [$start_date->format('H:i'), '23:59'];

    //                     $monday_start = $end_date->copy()->startOfDay();
    //                     $monday_minutes = $monday_start->diffInMinutes($end_date);
    //                     $monday_hours = $monday_minutes / 60;

    //                     // $night_shift_times[] = ['00:01', $end_date->format('H:i')];

    //                     $total_shift_hours = $sunday_hours + $monday_hours;

    //                     if ($total_shift_hours < 4) {
    //                         $remaining_hours = 4 - $total_shift_hours;

    //                         $whole_hours = floor($remaining_hours);
    //                         $fractional_hours = $remaining_hours - $whole_hours;

    //                         $additional_minutes = $fractional_hours * 60;

    //                         $extended_end = $end_date->copy()->addHours($whole_hours)->addMinutes($additional_minutes);

    //                         $night_shift_times[] = ['00:01', $extended_end->format('H:i')];
    //                     }

    //                     foreach ($night_shift_times as $time_range) {
    //                         // Parse the start and end times using Carbon
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         // Calculate the difference in hours
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         // Add to total morning hours
    //                         $night_hours += $hours;
    //                         $night_hours = round($night_hours * 2) / 2;
    //                     }

    //                     foreach ($sunday_night as $time_range) {
    //                         // Parse the start and end times using Carbon
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         // Calculate the difference in hours
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         // Add to total morning hours
    //                         $sunday_night_hours += $hours;
    //                         $sunday_night_hours = round($sunday_night_hours * 2) / 2;
    //                     }

    //                     foreach ($sunday_morning as $time_range) {
    //                         // Parse the start and end times using Carbon
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         // Calculate the difference in hours
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         // Add to total morning hours
    //                         $sunday_morning_hours += $hours;
    //                         $sunday_morning_hours = round($sunday_morning_hours * 2) / 2;
    //                     }
    //                 } elseif ($start_date->isSaturday() && $end_date->isSaturday()) {
    //                     $total_hours = 0;

    //                     // Check and calculate night shift hours
    //                     if ($start_date->lt($night_shift_end) && $end_date->gt($night_shift_start)) {
    //                         $night_start = max($start_date, $night_shift_start);
    //                         $night_end = min($end_date, $night_shift_end);
    //                         $night_duration = $night_start->diffInMinutes($night_end) / 60; // Convert minutes to hours
    //                         $total_hours += $night_duration;

    //                         $saturday_night[] = [$night_start->format('H:i'), $night_end->format('H:i')];
    //                     }

    //                     // Check and calculate morning shift hours
    //                     if ($start_date->lt($morning_shift_end) && $end_date->gt($morning_shift_start)) {
    //                         $morning_start = max($start_date, $morning_shift_start);
    //                         $morning_end = min($end_date, $morning_shift_end);
    //                         $morning_duration = $morning_start->diffInMinutes($morning_end) / 60; // Convert minutes to hours
    //                         $total_hours += $morning_duration;

    //                         $saturday_morning[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];
    //                     }

    //                     // If total hours are less than 4, add remaining hours to make it 4
    //                     if ($total_hours < 4) {
    //                         $remaining_hours = 4 - $total_hours;

    //                         // Split the remaining hours into whole hours and minutes
    //                         $whole_hours = floor($remaining_hours);
    //                         $fractional_hours = $remaining_hours - $whole_hours;
    //                         $additional_minutes = $fractional_hours * 60; // Convert fractional hours to minutes

    //                         // If both night and morning shifts exist, add hours based on the later end time
    //                         if (!empty($saturday_night) && !empty($saturday_morning)) {
    //                             $last_night_shift = end($saturday_night);
    //                             $last_morning_shift = end($saturday_morning);

    //                             $last_night_end = \Carbon\Carbon::createFromFormat('H:i', $last_night_shift[1]);
    //                             $last_morning_end = \Carbon\Carbon::createFromFormat('H:i', $last_morning_shift[1]);

    //                             // Extend the shift with the later end time
    //                             if ($last_night_end->gte($last_morning_end)) {
    //                                 $extended_night_end = $last_night_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                                 $saturday_night[count($saturday_night) - 1][1] = $extended_night_end->format('H:i');
    //                             } else {
    //                                 $extended_morning_end = $last_morning_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                                 $saturday_morning[count($saturday_morning) - 1][1] = $extended_morning_end->format('H:i');
    //                             }
    //                         }
    //                         // If only the night shift exists, extend it
    //                         elseif (!empty($saturday_night)) {
    //                             $last_night_shift = end($saturday_night);
    //                             $last_night_end = \Carbon\Carbon::createFromFormat('H:i', $last_night_shift[1]);
    //                             $extended_night_end = $last_night_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                             $saturday_night[count($saturday_night) - 1][1] = $extended_night_end->format('H:i');
    //                         }
    //                         // If only the morning shift exists, extend it
    //                         elseif (!empty($saturday_morning)) {
    //                             $last_morning_shift = end($saturday_morning);
    //                             $last_morning_end = \Carbon\Carbon::createFromFormat('H:i', $last_morning_shift[1]);
    //                             $extended_morning_end = $last_morning_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                             $saturday_morning[count($saturday_morning) - 1][1] = $extended_morning_end->format('H:i');
    //                         }
    //                     }

    //                     foreach ($saturday_morning as $time_range) {
    //                         // Parse the start and end times using Carbon
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         // Calculate the difference in hours
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         // Add to total morning hours
    //                         $saturday_morning_hours += $hours;
    //                         $saturday_morning_hours = round($saturday_morning_hours * 2) / 2;
    //                     }

    //                     foreach ($saturday_night as $time_range) {
    //                         // Parse the start and end times using Carbon
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         // Calculate the difference in hours
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         // Add to total morning hours
    //                         $saturday_night_hours += $hours;
    //                         $saturday_night_hours = round($saturday_night_hours * 2) / 2;
    //                     }
    //                 } elseif ($start_date->isSunday() && $end_date->isSunday()) {
    //                     $total_hours = 0;
    //                     if ($start_date->lt($night_shift_end) && $end_date->gt($night_shift_start)) {
    //                         $night_start = max($start_date, $night_shift_start);
    //                         $night_end = min($end_date, $night_shift_end);
    //                         $night_duration = $night_start->diffInMinutes($night_end) / 60; // Convert minutes to hours
    //                         $total_hours += $night_duration;
    //                         $sunday_night[] = [$night_start->format('H:i'), $night_end->format('H:i')];
    //                     }
    //                     if ($start_date->lt($morning_shift_end) && $end_date->gt($morning_shift_start)) {
    //                         $morning_start = max($start_date, $morning_shift_start);
    //                         $morning_end = min($end_date, $morning_shift_end);
    //                         $morning_duration = $morning_start->diffInMinutes($morning_end) / 60; // Convert minutes to hours
    //                         $total_hours += $morning_duration;

    //                         $sunday_morning[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];
    //                     }
    //                     if ($start_date->lt($morning_shift_start)) {
    //                         $sunday_night[] = [$start_date->format('H:i'), '06:00'];
    //                     }

    //                     // If total hours are less than 4, add remaining hours to make it 4
    //                     if ($total_hours < 4) {
    //                         $remaining_hours = 4 - $total_hours;

    //                         // Split the remaining hours into whole hours and minutes
    //                         $whole_hours = floor($remaining_hours);
    //                         $fractional_hours = $remaining_hours - $whole_hours;
    //                         $additional_minutes = $fractional_hours * 60; // Convert fractional hours to minutes

    //                         // If both night and morning shifts exist, add hours based on the later end time
    //                         if (!empty($sunday_night) && !empty($sunday_morning)) {
    //                             $last_night_shift = end($sunday_night);
    //                             $last_morning_shift = end($sunday_morning);

    //                             $last_night_end = \Carbon\Carbon::createFromFormat('H:i', $last_night_shift[1]);
    //                             $last_morning_end = \Carbon\Carbon::createFromFormat('H:i', $last_morning_shift[1]);

    //                             // Extend the shift with the later end time
    //                             if ($last_night_end->gte($last_morning_end)) {
    //                                 $extended_night_end = $last_night_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                                 $sunday_night[count($sunday_night) - 1][1] = $extended_night_end->format('H:i');
    //                             } else {
    //                                 $extended_morning_end = $last_morning_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                                 $sunday_morning[count($sunday_morning) - 1][1] = $extended_morning_end->format('H:i');
    //                             }
    //                         }
    //                         // If only the night shift exists, extend it
    //                         elseif (!empty($sunday_night)) {
    //                             $last_night_shift = end($sunday_night);
    //                             $last_night_end = \Carbon\Carbon::createFromFormat('H:i', $last_night_shift[1]);
    //                             $extended_night_end = $last_night_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                             $sunday_night[count($sunday_night) - 1][1] = $extended_night_end->format('H:i');
    //                         }
    //                         // If only the morning shift exists, extend it
    //                         elseif (!empty($sunday_morning)) {
    //                             $last_morning_shift = end($sunday_morning);
    //                             $last_morning_end = \Carbon\Carbon::createFromFormat('H:i', $last_morning_shift[1]);
    //                             $extended_morning_end = $last_morning_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                             $sunday_morning[count($sunday_morning) - 1][1] = $extended_morning_end->format('H:i');
    //                         }
    //                     }

    //                     foreach ($sunday_morning as $time_range) {
    //                         // Parse the start and end times using Carbon
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         // Calculate the difference in hours
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         // Add to total morning hours
    //                         $sunday_morning_hours += $hours;
    //                         $sunday_morning_hours = round($sunday_morning_hours * 2) / 2;
    //                     }

    //                     foreach ($sunday_night as $time_range) {
    //                         // Parse the start and end times using Carbon
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         // Calculate the difference in hours
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         // Add to total morning hours
    //                         $sunday_night_hours += $hours;
    //                         $sunday_night_hours = round($sunday_night_hours * 2) / 2;
    //                     }
    //                 } else {

    //                     $total_hours = 0;

    //                     // Initialize variables to track processed ranges
    //                     $processed_night_end = null;
    //                     $processed_morning_start = null;

    //                     // Check for night shift hours (this handles time spanning over midnight and before 6:00 AM)
    //                     if ($start_date->lt($morning_shift_start)) {
    //                         // Special case where the shift starts before 6:00 AM (night shift) and ends after 6:00 AM (morning shift)
    //                         if ($end_date->gte($morning_shift_start)) {
    //                             // Case: Shift starts in night and ends in the morning
    //                             $night_start = $start_date;
    //                             $night_end = $morning_shift_start; // End night shift at 6:00 AM

    //                             // Calculate night shift duration in hours
    //                             $night_duration = $night_start->diffInMinutes($night_end) / 60;
    //                             $night_shift_times[] = [$night_start->format('H:i'), $night_end->format('H:i')];
    //                             $total_hours += $night_duration;

    //                             // Mark the end of the night shift as processed
    //                             $processed_night_end = $night_end;

    //                             // Calculate morning shift hours (from 6:00 AM onwards)
    //                             $morning_start = $morning_shift_start;
    //                             $morning_end = min($end_date, $morning_shift_end);
    //                             $morning_shift_times[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];

    //                             // Calculate morning shift duration in hours
    //                             $morning_duration = $morning_start->diffInMinutes($morning_end) / 60;
    //                             $total_hours += $morning_duration;

    //                             // Mark the start of the morning shift as processed
    //                             $processed_morning_start = $morning_start;
    //                         } else {
    //                             // Case: Entire shift is within the night shift (before 6:00 AM)
    //                             $night_start = $start_date;
    //                             $night_end = $end_date;

    //                             // Calculate night shift duration in hours
    //                             $night_duration = $night_start->diffInMinutes($night_end) / 60;
    //                             $night_shift_times[] = [$night_start->format('H:i'), $night_end->format('H:i')];
    //                             $total_hours += $night_duration;

    //                             // Mark the end of the night shift as processed
    //                             $processed_night_end = $night_end;
    //                         }
    //                     }

    //                     // Check for morning shift hours (this handles cases when the shift is fully in the morning shift)
    //                     if ($start_date->lt($morning_shift_end) && $end_date->gt($morning_shift_start)) {
    //                         $morning_start = max($start_date, $morning_shift_start);
    //                         $morning_end = min($end_date, $morning_shift_end);

    //                         // Make sure we're not counting the same time range that was counted as part of the night shift
    //                         if (!$processed_morning_start || $morning_start->gt($processed_night_end)) {
    //                             $morning_shift_times[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];

    //                             // Calculate morning shift duration in hours
    //                             $morning_duration = $morning_start->diffInMinutes($morning_end) / 60;
    //                             $total_hours += $morning_duration;
    //                         }
    //                     }

    //                     // Check for night shift hours (this handles time spanning over midnight and after 6:00 PM)
    //                     if ($start_date->lt($night_shift_end) && $end_date->gt($night_shift_start)) {
    //                         $night_start = max($start_date, $night_shift_start);
    //                         $night_end = min($end_date, $night_shift_end);

    //                         // Ensure no overlapping time ranges with previously calculated night shift
    //                         if (!$processed_night_end || $night_start->gt($processed_night_end)) {
    //                             $night_shift_times[] = [$night_start->format('H:i'), $night_end->format('H:i')];

    //                             // Calculate night shift duration in hours
    //                             $night_duration = $night_start->diffInMinutes($night_end) / 60;
    //                             $total_hours += $night_duration;
    //                         }

    //                         // Handle transition from night shift to morning shift
    //                         if ($end_date->gt($night_shift_end)) {
    //                             $morning_start = $night_shift_end;
    //                             $morning_end = min($end_date, $morning_shift_end);

    //                             // Ensure no overlapping time ranges with previously calculated morning shift
    //                             if (!$processed_morning_start || $morning_start->gt($processed_morning_start)) {
    //                                 $morning_shift_times[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];

    //                                 // Calculate additional morning shift hours
    //                                 $morning_extra_duration = $morning_start->diffInMinutes($morning_end) / 60;
    //                                 $total_hours += $morning_extra_duration;
    //                             }
    //                         }
    //                     }

    //                     // If total hours worked is less than 4, extend based on the end time
    //                     if ($total_hours < 4) {
    //                         $remaining_hours = 4 - $total_hours;
    //                         $whole_hours = floor($remaining_hours);
    //                         $fractional_hours = $remaining_hours - $whole_hours;
    //                         $additional_minutes = $fractional_hours * 60;
    //                         // Check if both night and morning shifts are not empty
    //                         if (!empty($night_shift_times) && !empty($morning_shift_times)) {
    //                             // Determine the last end time of both shifts
    //                             $last_night_shift = end($night_shift_times);
    //                             $last_night_end = \Carbon\Carbon::createFromFormat('H:i', $last_night_shift[1]);

    //                             $last_morning_shift = end($morning_shift_times);
    //                             $last_morning_end = \Carbon\Carbon::createFromFormat('H:i', $last_morning_shift[1]);

    //                             // Determine which shift end time is closer to the overall shift end time
    //                             $shift_end_time = \Carbon\Carbon::createFromFormat('H:i', $end_date->format('H:i'));

    //                             if ($last_night_end->lte($shift_end_time) && $last_night_end->gt($last_morning_end)) {
    //                                 // If the last night shift end time is closer to or at the shift end time
    //                                 $extended_night_end = $last_night_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                                 $night_shift_times[count($night_shift_times) - 1][1] = $extended_night_end->format('H:i');
    //                             } else {
    //                                 // If the last morning shift end time is closer to or at the shift end time
    //                                 $extended_morning_end = $last_morning_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                                 $morning_shift_times[count($morning_shift_times) - 1][1] = $extended_morning_end->format('H:i');
    //                             }
    //                         } elseif (!empty($night_shift_times)) {
    //                             // Handle case where only night shift times are present
    //                             $last_night_shift = end($night_shift_times);
    //                             $last_night_end = \Carbon\Carbon::createFromFormat('H:i', $last_night_shift[1]);

    //                             $extended_night_end = $last_night_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                             $night_shift_times[count($night_shift_times) - 1][1] = $extended_night_end->format('H:i');
    //                         } elseif (!empty($morning_shift_times)) {
    //                             // Handle case where only morning shift times are present
    //                             $last_morning_shift = end($morning_shift_times);
    //                             $last_morning_end = \Carbon\Carbon::createFromFormat('H:i', $last_morning_shift[1]);

    //                             $extended_morning_end = $last_morning_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
    //                             $morning_shift_times[count($morning_shift_times) - 1][1] = $extended_morning_end->format('H:i');
    //                         }
    //                     }

    //                     foreach ($morning_shift_times as $time_range) {
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         $morning_hours += $hours;
    //                         $morning_hours = round($morning_hours * 2) / 2;
    //                     }

    //                     foreach ($night_shift_times as $time_range) {
    //                         $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
    //                         $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

    //                         if ($end_time->lt($start_time)) {
    //                             $end_time->addDay();
    //                         }
    //                         $hours = $start_time->diffInMinutes($end_time) / 60;

    //                         $night_hours += $hours;
    //                         $night_hours = round($night_hours * 2) / 2;
    //                     }
    //                 }
    //             }

    //             // return [
    //             //     // 'morning' => $this->intersection( $start1, $end, $morning_start, $morning_end ) / 3600,
    //             //     'morning' =>  $morning,
    //             //     'night' => round(((($hours - $morning) < 0) ? 0 : ($hours - $morning)), 2),
    //             //     'saturday_morning' => $saturday_morning,
    //             //     'saturday_night' => round(((($total_saturday_hours - $saturday_morning) < 0) ? 0 : ($total_saturday_hours - $saturday_morning)), 2),
    //             //     'sunday_morning' => $sunday_morning,
    //             //     'sunday_night' => round(((($total_sunday_hours - $sunday_morning) < 0) ? 0 : ($total_sunday_hours - $sunday_morning)), 2),
    //             //     'ph_morning' => $ph_morning,
    //             //     'ph_night' => round(((($total_ph_hours - $ph_morning) < 0) ? 0 : ($total_ph_hours - $ph_morning)), 2),

    //             //     // 'night' => $this->calculateHoursNight($shift_start, $shift_end, $night_start, $night_end ),
    //             // ];

    //             return [
    //                 // 'morning' => $this->intersection( $start1, $end, $morning_start, $morning_end ) / 3600,
    //                 'morning' =>  $morning_hours,
    //                 'night' => $night_hours,
    //                 'saturday_morning' => $saturday_morning_hours,
    //                 'saturday_night' => $saturday_night_hours,
    //                 'sunday_morning' => $sunday_morning_hours,
    //                 'sunday_night' => $sunday_night_hours,
    //                 'ph_morning' => 0,
    //                 'ph_night' => 0,
    //             ];
    //         } else {
    //             if ($endedTime > 6 && $endedTime < 18) {
    //                 $morningTiming = 1;
    //             }
    //             if ($endedTime > 18 || $endedTime < 6) {
    //                 $nightTiming = 1;
    //             }
    //             if ($startedTime > 6 && $startedTime < 18) {
    //                 $startedMorningTiming = 1;
    //             }
    //             if ($startedTime > 18 || $startedTime < 6) {
    //                 $startedNightTiming = 1;
    //             }
    //             if ($endedTime > 6 && $endedTime < 18) {
    //                 $morningTiming = 1;
    //             }
    //             if ($endedTime > 18 || $endedTime < 6) {
    //                 $nightTiming = 1;
    //             }
    //             if ($morningTiming == 1) {
    //                 $morning = 4;
    //             }
    //             if ($nightTiming == 1) {
    //                 $night = 4;
    //             }
    //             if ($morning < 0) {
    //                 $morning = 0;
    //             }
    //             if ($saturday_morning < 0) {
    //                 $saturday_morning = 0;
    //             } else if ($saturday_morning > 0) {
    //                 if ($morningTiming == 1) {
    //                     $saturday_morning = 4;
    //                 }
    //                 if ($nightTiming == 1) {
    //                     $saturday_night = 4;
    //                 }
    //             }
    //             if ($sunday_morning < 0) {
    //                 $sunday_morning = 0;
    //             } else if ($sunday_morning > 0) {
    //                 if ($morningTiming == 1) {
    //                     $sunday_morning = 4;
    //                 }
    //                 if ($nightTiming == 1) {
    //                     $sunday_night = 4;
    //                 }
    //             }
    //             if ($ph_morning < 0) {
    //                 $ph_morning = 0;
    //             } else if ($ph_morning > 0) {
    //                 if ($morningTiming == 1) {
    //                     $ph_morning = 4;
    //                 }
    //                 if ($nightTiming == 1) {
    //                     $ph_night = 4;
    //                 }
    //             }
    //             return [
    //                 'morning' =>  $morning,
    //                 'night' => $night,
    //                 'saturday_morning' => $saturday_morning,
    //                 'saturday_night' => $saturday_night,
    //                 'sunday_morning' => $sunday_morning,
    //                 'sunday_night' => $sunday_night,
    //                 'ph_morning' => $ph_morning,
    //                 'ph_night' => $ph_night,
    //             ];
    //         }
    //     }

    //     // echo $ph_end;
    //     // exit();

    //     if ($morning < 0) {
    //         $morning = 0;
    //     }
    //     if ($saturday_morning < 0) {
    //         $saturday_morning = 0;
    //     }
    //     if ($sunday_morning < 0) {
    //         $sunday_morning = 0;
    //     }
    //     // print_r($shift_end);
    //     return [
    //         // 'morning' => $this->intersection( $start1, $end, $morning_start, $morning_end ) / 3600,
    //         'morning' =>  $morning,
    //         'night' => round(((($hours - $morning) < 0) ? 0 : ($hours - $morning)), 2),
    //         'saturday_morning' => $saturday_morning,
    //         'saturday_night' => round(((($total_saturday_hours - $saturday_morning) < 0) ? 0 : ($total_saturday_hours - $saturday_morning)), 2),
    //         'sunday_morning' => $sunday_morning,
    //         'sunday_night' => round(((($total_sunday_hours - $sunday_morning) < 0) ? 0 : ($total_sunday_hours - $sunday_morning)), 2),
    //         'ph_morning' => $ph_morning,
    //         'ph_night' => round(((($total_ph_hours - $ph_morning) < 0) ? 0 : ($total_ph_hours - $ph_morning)), 2),

    //         // 'night' => $this->calculateHoursNight($shift_start, $shift_end, $night_start, $night_end ),
    //     ];
    // }

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
            ->where('job_rosters.id', '=', $request->input('roster_id'))->where(
                function ($query) use ($a, $b) {
                    return $query->where('job_rosters.assigned_to', '=', $a)
                        ->orWhere('job_rosters.assigned_to', '=', $b);
                }
            )
            ->select('job_rosters.*', 'sites.id as jobId', 'sites.address', 'sites.coordinates')
            ->first();

            if ($roster != null) {

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
                    ->where('created_by', $id)
                    ->whereBetween('end', [$roster->start, $roster->end])
                    ->select('job_rosters.*')->first();
                if ($is_already_assign != null) {
                    $flag = 1;
                }
            }
            if ($flag == 0) {

                if ($roster->is_document == 1) {
                    $document_types = $roster->document_list;

                    $document_category = DocumentCategory::where('document_category', 'job_doc')->first();

                    if ($document_category && !empty($document_types)) {
                        foreach (json_decode($document_category->document_type) as $doc_key => $doc_name) {
                            $document_types_array = json_decode($document_types, true) ?? [];
                            if (in_array($doc_key, $document_types_array)) {

                                $already_exists = Document::where([
                                    'user_id'       => $id,
                                    'document_type' => $doc_key,
                                ])->first();

                                if ($already_exists) {
                                    continue;
                                }

                                $guard_document                    = new Document();
                                $guard_document->user_id           = $id;
                                $guard_document->document_category = $document_category->document_category;
                                $guard_document->document_type     = $doc_key;
                                $guard_document->document_name     = $doc_name;
                                $guard_document->save();
                            }
                        }
                    }
                }


                DB::table('job_rosters')
                    ->where('id', '=', $request->input('roster_id'))
                    ->update(['assigned_to' => $id, 'publish_status' => 1, 'job_status' => 'confirmed']);
                $guard = DB::table('users')->where('id', $id)->first();

                //push notification
                $admins = DB::table('users')->where('notification_token', '!=', '')->where('id', '=', $roster->created_by)->select('notification_token')->get();
                foreach ($admins as $a) {
                    $notification_data = [
                        'message' => $guard->name . ' accepted and confirmed the job.',
                        'title' => 'Job Signin',
                        'notification_token' => $a->notification_token,
                        'page' => 'homepage',
                        'roster_id' =>  $id
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

    public function jobSignin(Request $request, $id)
    {

        // $this->request = $request;
        // $this->setValidationRules(['time' => 'required', 'selfie' => 'required', 'location' => 'required']);
        // if ($this->isValidRequest()) {
        // $this->response = ['success' => false, 'error' => $this->getErrors()];
        // $this->statusCode = self::STATUS_CODE_200;
        // return $this->sendResponse();
        // }

        $job = JobRoster::where('id', $id)->with('site')->first();
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

        $coordinates = explode(',', $request->input('location'));


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
        // if ($distance > $signin_radius) {
        //     return response()->json(['success' => false, 'error' => 'You are ' . number_format($distance, 2) . ' km away from your job!', 'message' => 'You are ' . number_format($distance, 2) . ' km away from your job!', 'code' => 404]);
        // }
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
                    'page' => 'homepage',
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
            $public_path = str_replace('portal/public', '', $public_path);
            $public_path = str_replace('apis/public', '', $public_path);
            $public_path = str_replace('https://apis.staffoo.com.au/', 'apis.247staffingsolutions.com.au/public', $public_path);
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

        $model = JobRoster::with('guards', 'rosterActivity', 'site', 'jobRosterTask');

        if ($week < 0) {
            $model->where(['publish_status' => 1, 'assigned_to' => $guardId]);
        } else {
            $model->where(['publish_status' => 1, 'job_status' => $type, 'assigned_to' => $guardId]);
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
                    'page' => 'homepage',
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
                'page' => 'homepage',
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
                'page' => 'homepage',
                'roster_id' => $id
            ];
            send_push_notification($notification_data);
        }

        // ─── FINAL RESPONSE ───────────────────────
        return response()->json([
            'success' => true,
            'message' => 'Clocked-out Successfully & Payment processed!'
        ], 200);
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
                ->whereNotNull('notified_users')
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
                $q->whereIn('assigned_to', $contractorUserIds);
            }
        });

        if (!empty($states)) {
        $sites->whereIn('state', $states);
        }
        $sites = $sites->with(['jobRoster' => function ($q) use ($start, $end, $roster_id, $user, $contractorUserIds) {
                $q->whereBetween('start', [$start, $end])
                    ->where('roster_id', $roster_id)
                    ->orderBy('start', 'asc')
                    ->with('guards');

                if ($user->user_type === 'staff') {
                    $q->where('assigned_to', $user->id);
                }

                if ($user->user_type === 'customer') {
                    $q->where('created_by', $user->id);
                }

                if ($user->user_type === 'contractor') {
                    $q->whereIn('assigned_to', $contractorUserIds);
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
            ->when($user->user_type === 'contractor', function ($q) use ($contractorUserIds) {
                $q->whereIn('assigned_to', $contractorUserIds);
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
                ->when($user->user_type === 'contractor', function ($q) use ($contractorUserIds) {
                    $q->whereIn('assigned_to', $contractorUserIds);
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
                'page' => 'homepage',
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
                'page' => 'homepage',
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
                'page' => 'homepage',
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
        if ($request->has('guard_id') && !empty($request->guard_id)) {
            $baseQuery->whereIn('job_rosters.assigned_to', $request->guard_id);
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

        $chargeRate = ChargeRate::find(1);

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
                ($chargeRate->def_metro_sun_night_rate * ($hours['sunday_night'] ?? 0));

            $hours_array[] = $hours;
            $baseTotal_arr[] = $shiftAmount; 
            $baseTotal += ($shiftAmount * $shift['numberOfGuards']);
        }

        // APPLY DISCOUNT (ONLY FULL)
        $discount = 0;

        if ($request->payment_option === 'full') {
            $discount = round($baseTotal * 0.05, 2);
        }

        $discountedTotal = $baseTotal - $discount;

        // GST / SERVICE FEE (UNCHANGED LOGIC)
        $serviceFee = round($discountedTotal * 0.10, 2);
        $grandTotal = round($discountedTotal + $serviceFee, 2);

        // SPLIT LOGIC (AFTER GST)
        if ($request->payment_option === 'split') {
            $amountToCharge = round($grandTotal * 0.5, 2);
            $balance = $grandTotal - $amountToCharge;
        } else {
            $amountToCharge = $grandTotal;
            $balance = 0;
        }
        // return [$baseTotal, $discount. $discountedTotal, $serviceFee, $grandTotal, $amountToCharge, $hours_array,$baseTotal_arr];

        $amountInCents = (int) round($amountToCharge * 100);

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
            'service_fee'       => $serviceFee,
            'total_amount'      => $grandTotal,

            'amount_charged'    => $amountToCharge,
            'balance'           => $balance,

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
                            'page' => 'homepage'
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
            ->orderBy('created_at', 'desc') // or 'transaction_date'
            ->get();

        // Check if transactions exist
        if ($transactions->isEmpty()) {
            return response()->json([
                'message' => 'No transactions found for this user',
                'data' => []
            ], 200);
        }

        return response()->json([
            'message' => 'Transactions retrieved successfully',
            'data' => $transactions
        ], 200);
    }

    /**
     * STEP 2 — Guard 1 generates QR code
     * GET /api/roster/qr-code/{roster_id}
     */
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

    /**
     * STEP 3 — Guard 2 scans QR
     * POST /api/roster/handover/scan
     * Body: { "roster_id": 1, "token": "uuid-here" }
     */
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

}
