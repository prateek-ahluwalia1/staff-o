<?php

namespace App\Http\Controllers\Api;

use App\Exports\PaysheetExport;
use App\Http\Controllers\Controller;
use App\Models\ChargeRate;
use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Services\ReportPdfService;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\WeeklyTimesheetMail;
use App\Models\JobRoster;
use App\Models\Payrate;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{

    function generateJobTrackerReport(Request $request)
    {
        if($request->type == 'preview'){
            $data = $this->timesheet_search($request);
            return response()->json([
                'success' => true,
                'data' => $data,
                'status' => $request->status
            ]);
        }
        $filename = time().'_job_tracker_report.xlsx';  
        // Excel::store(new JobtrackerReportExport, 'excel/guard/'.$filename, 'excels');
        return response()->json(['success' =>  true, 'message' => 'Report generate successfully.','path' => 'https://'.request()->getHttpHost().'/excel/guard/'.$filename]);
    }

    private function getTimeDiff($start, $end) {
        $return =  [
            'years' => 0,
            'months' => 0,
            'days' => 0,
            'hours' => 0,
            'minutes' => 0,
            'seconds' => 0
        ];
        $date1 = strtotime($start);
        $date2 = strtotime($end);
    
        $diff = abs($date2 - $date1);
    
        $years = floor($diff / (365*60*60*24));
    
        $months = floor(($diff - $years * 365*60*60*24)
            / (30*60*60*24));
    
        $days = floor(($diff - $years * 365*60*60*24 -
            $months*30*60*60*24)/ (60*60*24));
    
        $hours = floor(($diff - $years * 365*60*60*24
            - $months*30*60*60*24 - $days*60*60*24)
        / (60*60));
    
        $minutes = floor(($diff - $years * 365*60*60*24
            - $months*30*60*60*24 - $days*60*60*24
            - $hours*60*60)/ 60);
    
        $seconds = floor(($diff - $years * 365*60*60*24
            - $months*30*60*60*24 - $days*60*60*24
            - $hours*60*60 - $minutes*60));
    
        return $return = [
            'years' => $years,
            'months' => $months,
            'days' => $days,
            'hours' => $hours,
            'minutes' => $minutes,
            'seconds' => $seconds
        ];
    } 

    public function timesheet_search($request)
    {
        $customer_id = $request['user_id'] ?? null;
        $status      = $request['status'] ?? null;
        $date        = $request['from_to'] ?? null;
        $job_status  = $request['job_status'] ?? null;

        $results = $this->get_timesheet_record();
        
        if ($job_status == 'pending') {
            $results->where('job_rosters.job_status', 'pending');
        } elseif ($job_status == 'inprogress') {
            $results->where('job_rosters.job_status', 'confirmed')->where('job_roster_activities.status', 1);
        } elseif ($job_status == 'missed') {
            $results->where('job_rosters.job_status', 'missed');
        } elseif ($job_status == 'completed') {
            $results->where('job_rosters.job_status', 'completed');
        }

        if ($customer_id != null && $customer_id != '') {
            // Handle both single ID and array of IDs
            if (is_array($customer_id)) {
                $results->whereIn('job_rosters.created_by', $customer_id);
            } else {
                $results->where('job_rosters.created_by', $customer_id);
            }
        }

        if ($date != null) {
            $from_to = explode("-", $date);
            
            if (count($from_to) == 2) {
                $from = trim($from_to[0]);
                $to = trim($from_to[1]);

                $from_date = date("Y-m-d", strtotime($from)) . ' 00:00:00';
                $to_date = date("Y-m-d", strtotime($to)) . ' 23:59:59';

                $results->where('job_rosters.start', '>=', $from_date)
                        ->where('job_rosters.start', '<=', $to_date);
            }
        }

        // Add pagination option
        if (isset($request['per_page'])) {
            $data = $results->orderBy('job_rosters.start', 'asc')->paginate($request['per_page']);
        } else {
            $data = $results->orderBy('job_rosters.start', 'asc')->get();
        }

        // Process hours calculation for each result
        if ($data->isNotEmpty()) {
            foreach ($data as $result) {
                $this->calculateJobHours($result);
            }
        }

        return [
            'results' => $data, 
            'parameter_status' => $status,
            'total_count' => $data instanceof \Illuminate\Pagination\LengthAwarePaginator ? $data->total() : $data->count()
        ];
    }

    /**
     * Calculate job hours and format them properly
     */
    private function calculateJobHours($result)
    {
        $hours = $this->getTimeDiff($result->start, $result->end);
        
        // Calculate total hours including days
        if ($hours['days'] > 0) {
            $hours['hours'] = $hours['hours'] + ($hours['days'] * 24);
        }
        
        // Store raw hours data
        $result->hours_data = $hours;
        
        // Calculate decimal hours
        $decimal_hours = $hours['hours'] + ($hours['minutes'] / 60);
        
        // Round to nearest quarter hour (optional - remove if not needed)
        $rounded_hours = $this->roundToQuarterHour($decimal_hours);
        
        $result->calculated_hours = round($decimal_hours, 2);
        $result->rounded_hours = $rounded_hours;
        
        // Add travel time if exists
        if (isset($result->travel_time) && $result->travel_time > 0) {
            $result->total_hours_with_travel = $rounded_hours + $result->travel_time;
        }
        
        // Format times for display
        $result->formatted_start = date('d M Y H:i', strtotime($result->start));
        $result->formatted_end = date('d M Y H:i', strtotime($result->end));
        
        return $result;
    }

    /**
     * Round decimal hours to nearest quarter hour
     */
    private function roundToQuarterHour($hours)
    {
        $whole_hours = floor($hours);
        $fraction = $hours - $whole_hours;
        
        if ($fraction < 0.13) {
            return $whole_hours;
        } elseif ($fraction < 0.27) {
            return $whole_hours + 0.25;
        } elseif ($fraction < 0.52) {
            return $whole_hours + 0.5;
        } elseif ($fraction < 0.77) {
            return $whole_hours + 0.75;
        } else {
            return $whole_hours + 1;
        }
    }

    /**
     * Updated get_timesheet_record with proper joins
     */
    public function get_timesheet_record()
    {
        $results = DB::table('job_rosters')
            ->join('sites', 'job_rosters.site_id', '=', 'sites.id')
            ->join('users as customers', 'sites.user_id', '=', 'customers.id')
            ->leftJoin('customers as customer_detail', 'customers.id', '=', 'customer_detail.user_id')
            ->leftJoin('users as guards', 'job_rosters.assigned_to', '=', 'guards.id')
            ->leftJoin('staff as staff_detail', 'guards.id', '=', 'staff_detail.user_id') // Fix: staff_detail.user_id
            ->leftJoin('job_roster_activities', 'job_rosters.id', '=', 'job_roster_activities.job_roster_id')
            ->select(
                'job_rosters.*', 
                'sites.id AS job_id',
                'sites.user_id AS customer_id',
                'sites.state',
                'sites.address',
                'sites.site_name',
                'customers.name AS customer_name', // Add customer name
                'customer_detail.company_name AS customer_company', // Optional
                'guards.name AS guard_name',
                'guards.email AS guard_email',
                'guards.state AS guard_state',
                'staff_detail.phone AS guard_phone',
                'guards.id AS guard_ID',
                'job_roster_activities.status',
                'job_roster_activities.signin_time',
                'job_roster_activities.signout_time',
                'job_roster_activities.auto_signout'
            );
        
        return $results;
    }

    /**
     * Helper function to debug job_status values in database
     */
    public function checkJobStatusValues()
    {
        $statuses = DB::table('job_rosters')
            ->select('job_status', DB::raw('count(*) as total'))
            ->groupBy('job_status')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $statuses
        ]);
    }
 
    // -------------------------------------------------------------------------
    // Export paysheet to Excel (matches the uploaded report format exactly)
    // -------------------------------------------------------------------------
    public function exportPaysheet(Request $request)
    {
        // Re-use the same logic but without pagination
        $request->merge(['pageIndex' => 0, 'pageSize' => 99999]);
        $response = $this->getPaysheet($request);
        $payload  = $response->getData(true);
 
        if (empty($payload['data'])) {
            return response()->json(['success' => false, 'message' => 'No data to export.']);
        }
 
        return (new PaysheetExport($payload['data']))->download('paysheet_report.xlsx');
    }
 
    // -------------------------------------------------------------------------
    // Helper: gross amount for a single shift
    // -------------------------------------------------------------------------
    private function calculateGross(
        array $hours,
        float $mfDay,   float $mfNight,
        float $satMorn, float $satNight,
        float $sunMorn, float $sunNight,
        float $phMorn,  float $phNight
    ): float {
        return ($hours['morning']          * $mfDay)
             + ($hours['night']            * $mfNight)
             + ($hours['saturday_morning'] * $satMorn)
             + ($hours['saturday_night']   * $satNight)
             + ($hours['sunday_morning']   * $sunMorn)
             + ($hours['sunday_night']     * $sunNight)
             + ($hours['ph_morning']       * $phMorn)
             + ($hours['ph_night']         * $phNight);
    }

       public function getPaysheet(Request $request)
    {
        ini_set('memory_limit', '64M');
        if (isset($request['date']) && $request['date'] != '') {
            $date = $request['date'];
            $date = explode(' - ', $date);
            $from = strtotime(trim(str_replace('-', '/', $date[0])));
            $to = strtotime(trim(str_replace('-', '/', $date[1])));
        }else{
            $to = time();
            $from = time() - (60*60*24*14);
        }
        $startDate = date('Y-m-d 00:00', $from);
        $endDate = date('Y-m-d 23:59', $to);


$extra_query = '(jr.`job_status` = "completed" OR jr.`job_status` = "pending" OR jr.`job_status` = "confirmed") AND ';

if (isset($request['customer_id']) && !empty($request['customer_id'])) {
    $customerConditions = "(";
    $i = 0;
    foreach ($request['customer_id'] as $key => $id) {
        $customerConditions .= "j.`customer_id` = '".$id."'";
        if ($i < sizeof($request['customer_id']) -1) {
            $customerConditions .= " OR ";
        }
        $i++;
    }
    $customerConditions .= ") AND ";

    $extra_query .= $customerConditions;
}

if (isset($request['state']) && !empty($request['state'])) {
    $stateConditions = "(";
    $i = 0;
    foreach ($request['state'] as $key => $id) {
        $stateConditions .= "j.`state` = '".$id."'";
        if ($i < sizeof($request['state']) -1) {
            $stateConditions .= " OR ";
        }
        $i++;
    }
    $stateConditions .= ") AND ";

    $extra_query .= $stateConditions;
}

if (isset($request['sites']) && !empty($request['sites'])) {
    $siteConditions = "(";
    $i = 0;
    foreach ($request['sites'] as $key => $id) {
        $siteConditions .= "j.`id` = '".$id."'";
        if ($i < sizeof($request['sites']) -1) {
            $siteConditions .= " OR ";
        }
        $i++;
    }
    $siteConditions .= ") AND ";

    $extra_query .= $siteConditions;
}

$results = DB::table('job_rosters AS jr')
    ->select(
        'jr.*',
        'j.id',
        'j.user_id',
        'j.state',
        'j.address',
        'j.site_name',
        'j.site_description',
        // 'j.level',
        // 'j.payrol',
        // 'j.site_payrate',
        // 'j.break_payable',
        // 'j.break',
        // 'j.payrate_affective_from',
        // 'cust.name AS customer_name',
        'g.*',
        'cust.name AS customer_name',
        // 'gw.account_holder AS account_holder',
        // 'gw.bank_name AS payroll_bank_name',
        // 'gw.bank_account_no AS payroll_bank_account_number',
        // 'latest_jra_sub.reason AS operation_notes',
        'ja.signin_time AS signin_time',
        'ja.signout_time AS signout_time',
        // 'g.guard_postion AS position',
        'jr.id AS id'
    )
    ->join('sites AS j', 'j.id', '=', 'jr.site_id')
    ->leftJoin('job_roster_activities AS ja', 'ja.job_roster_id', '=', 'jr.id')
    ->leftJoin('staff AS gw', 'gw.user_id', '=', 'jr.assigned_to')
    ->leftJoin('users AS g', 'g.id', '=', 'jr.assigned_to')
    ->leftJoin('users AS cust', 'jr.created_by', '=', 'cust.id')
    // ->leftJoinSub($subqueryReason, 'latest_jra_sub', 'latest_jra_sub.roster_id', '=', 'jr.id')
    ->whereRaw($extra_query . '(jr.job_status = ? OR jr.in_paysheet = ?) AND jr.shift_payable = ? AND jr.start BETWEEN ? AND ?',
    ['completed', 1, 'yes', $startDate, $endDate])
    ->orderBy('g.name', 'ASC')
    // ->orderBy('g.last_name')
    ->orderBy('jr.start')
    ->get();

    $results = json_decode(json_encode($results), true);

    foreach ($results as $key => $roster) {
    $roster['day_rate'] = 0;
    $roster['night_rate'] = 0;
    $roster['public_holiday_rate'] = 0;
    $roster['saturday_rate'] = 0;
    $roster['sunday_rate'] = 0;
    $roster['total_amount'] = 0;
    $roster['ot'] = 0;

    // $payrate = Payrate::where('level', $roster['level'])->where('status', 'active')->first();
    $payrate = Payrate::where('id', 1)->where('status', 'active')->first();
    
    if (!empty($payrate)) {
        // if ($site->type == 'metro') {
            // if ($roster['payrol'] == 'award') {
            //     $roster['day_rate'] = $payrate->award_metro_mon_to_fri_day_rate;
            //     $roster['night_rate'] = $payrate->award_metro_mon_to_fri_night_rate;
            //     $roster['public_holiday_rate'] = $payrate->award_metro_pub_holi_day_rate;
            //     $roster['saturday_rate'] = $payrate->award_metro_sat_day_rate;
            //     $roster['sunday_rate'] = $payrate->award_metro_sun_day_rate;
            // } elseif ($roster['payrol'] == 'eba') {
            //     $roster['day_rate'] = $payrate->eba_metro_mon_to_fri_day_rate;
            //     $roster['night_rate'] = $payrate->eba_metro_mon_to_fri_night_rate;
            //     $roster['public_holiday_rate'] = $payrate->eba_metro_pub_holi_day_rate;
            //     $roster['saturday_rate'] = $payrate->eba_metro_sat_day_rate;
            //     $roster['sunday_rate'] = $payrate->eba_metro_sun_day_rate;
            // } else {
                $roster['day_rate'] = $payrate->def_metro_mon_to_fri_day_rate;
                $roster['night_rate'] = $payrate->def_metro_mon_to_fri_night_rate;
                $roster['public_holiday_rate'] = $payrate->def_metro_pub_holi_day_rate;
                $roster['saturday_rate'] = $payrate->def_metro_sat_day_rate;
                $roster['sunday_rate'] = $payrate->def_metro_sun_day_rate;
            // }
        // } else {
        //     if ($roster['payrol'] == 'award') {
        //         $roster['day_rate'] = $payrate->award_reg_mon_to_fri_day_rate;
        //         $roster['night_rate'] = $payrate->award_reg_mon_to_fri_night_rate;
        //         $roster['public_holiday_rate'] = $payrate->award_reg_pub_holi_day_rate;
        //         $roster['saturday_rate'] = $payrate->award_reg_sat_day_rate;
        //         $roster['sunday_rate'] = $payrate->award_reg_sun_day_rate;
        //     } elseif ($roster['payrol'] == 'eba') {
        //         $roster['day_rate'] = $payrate->eba_reg_mon_to_fri_day_rate;
        //         $roster['night_rate'] = $payrate->eba_reg_mon_to_fri_night_rate;
        //         $roster['public_holiday_rate'] = $payrate->eba_reg_pub_holi_day_rate;
        //         $roster['saturday_rate'] = $payrate->eba_reg_sat_day_rate;
        //         $roster['sunday_rate'] = $payrate->eba_reg_sun_day_rate;
        //     } else {
        //         $roster['day_rate'] = $payrate->def_reg_mon_to_fri_day_rate;
        //         $roster['night_rate'] = $payrate->def_reg_mon_to_fri_night_rate;
        //         $roster['public_holiday_rate'] = $payrate->def_reg_pub_holi_day_rate;
        //         $roster['saturday_rate'] = $payrate->def_reg_sat_day_rate;
        //         $roster['sunday_rate'] = $payrate->def_reg_sun_day_rate;
        //     }
        // }
    }

    $shift_hours = $roster['morning_hours'] + $roster['night_hours'] +  $roster['saturday_morning_hours'] + $roster['saturday_night_hours'] + $roster['sunday_morning_hours'] + $roster['sunday_night_hours'] + $roster['ph_morning_hours'] + $roster['ph_night_hours'];

    
    $roster['total_amount'] = ($roster['day_rate'] * $roster['morning_hours']) + ($roster['night_rate'] * $roster['night_hours']) + ($roster['public_holiday_rate'] * ($roster['ph_morning_hours'] + $roster['ph_night_hours'])) + ($roster['saturday_rate'] * ($roster['saturday_morning_hours'] + $roster['saturday_night_hours'])) + ($roster['sunday_rate'] * ($roster['sunday_morning_hours'] + $roster['sunday_night_hours']));
    
    $results[$key] = $roster;
}

return $results;
    
}
//timesheet job
    /**
     * Get email recipients who worked in the previous week
     */
    private function getEmailRecipients($start, $end)
    {
        // Get all users who had shifts in the previous week
        $usersWithShifts = JobRoster::query()
            ->whereDate('job_rosters.start', '>=', $start)
            ->whereDate('job_rosters.start', '<=', $end)
            ->whereNotNull('job_rosters.assigned_to')
            ->distinct()
            ->pluck('job_rosters.assigned_to')
            ->toArray();

        // Get all contractors who accepted shifts in the previous week
        $contractorsWithShifts = JobRoster::query()
            ->whereDate('job_rosters.start', '>=', $start)
            ->whereDate('job_rosters.start', '<=', $end)
            ->whereNotNull('job_rosters.accepted_by')
            ->distinct()
            ->pluck('job_rosters.accepted_by')
            ->toArray();

        // Get admin users (always get admins, they need the report)
        // $admins = User::where('role', 'admin')->get();
        
        // // Get staff users who had shifts in the previous week
        // $staff = User::whereIn('id', $usersWithShifts)
        //     ->where('role', 'staff')
        //     ->get();

        // // Get contractors who accepted shifts in the previous week
        // $contractors = User::whereIn('id', $contractorsWithShifts)
        //     ->where('role', 'contractor')
        //     ->get();
        
        // Get staff users who had shifts in the previous week
        $staff = User::where('id', 324)
            ->where('user_type', 'staff')
            ->get();
        $admins = User::where('id', 324)
            ->where('user_type', 'staff')
            ->get();
        $contractors = User::where('id', 324)
            ->where('user_type', 'staff')
            ->get();

        return [
            'admins' => $admins,
            'staff' => $staff,
            'contractors' => $contractors
        ];
    }

      public function sendWeeklyTimesheetEmails()
    {
        try {
            // Get previous week's date range (Monday to Sunday)
            $start = Carbon::now()->subWeek()->startOfWeek()->toDateString();
            $end = Carbon::now()->subWeek()->endOfWeek()->toDateString();

            Log::info('Generating weekly timesheet report', [
                'start' => $start,
                'end' => $end
            ]);

            // Get all timesheet data for previous week
            $allTimesheetData = $this->getWeeklyTimesheetData($start, $end);

            if (empty($allTimesheetData)) {
                Log::info('No timesheet data found for previous week: ' . $start . ' to ' . $end);
                return response()->json([
                    'success' => false,
                    'message' => 'No timesheet data found for previous week'
                ]);
            }

            // Get recipients who worked in the previous week
            $recipients = $this->getEmailRecipients($start, $end);

            // Log recipient counts
            Log::info('Email recipients found', [
                'admins' => count($recipients['admins']),
                'staff' => count($recipients['staff']),
                'contractors' => count($recipients['contractors'])
            ]);

            // Send emails to each recipient group
            $emailResults = $this->sendTimesheetEmails($recipients, $allTimesheetData, $start, $end);

            return response()->json([
                'success' => true,
                'message' => 'Weekly timesheet emails sent successfully',
                'data' => $emailResults
            ]);

        } catch (\Exception $e) {
            Log::error('Error sending weekly timesheet emails: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send weekly timesheet emails',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get weekly timesheet data
     */
    private function getWeeklyTimesheetData($start, $end)
    {
        $baseQuery = JobRoster::query()
            ->whereDate('job_rosters.start', '>=', $start)
            ->whereDate('job_rosters.start', '<=', $end)
            ->whereNotNull('job_rosters.assigned_to');

        $timesheet = $baseQuery
            ->leftJoin('users', 'users.id', '=', 'job_rosters.assigned_to')
            ->leftJoin('sites', 'sites.id', '=', 'job_rosters.site_id')
            ->leftJoin('users as contractors', 'contractors.id', '=', 'job_rosters.accepted_by')
            ->select(
                'job_rosters.id as shift_id',
                'job_rosters.start',
                'job_rosters.end',
                'users.id as user_id',
                'users.name',
                'users.email as user_email',
                'job_rosters.in_paysheet',
                'job_rosters.morning_hours',
                'job_rosters.night_hours',
                'job_rosters.saturday_morning_hours',
                'job_rosters.saturday_night_hours',
                'job_rosters.sunday_morning_hours',
                'job_rosters.sunday_night_hours',
                'job_rosters.ph_morning_hours',
                'job_rosters.ph_night_hours',
                'job_rosters.hours',
                'job_rosters.site_id',
                'sites.site_name as site_name',
                'job_rosters.accepted_by',
                'contractors.name as contractor_name'
            )
            ->orderBy('users.name')
            ->orderBy('job_rosters.start')
            ->get();

        // Group by user
        $groupedData = [];
        foreach ($timesheet as $shift) {
            $userId = $shift['user_id'];
            
            // Get shift hours breakdown
            $job_hours = getShiftHours(
                date('m/d/Y H:i', strtotime($shift['start'])),
                date('m/d/Y H:i', strtotime($shift['end']))
            );

            if (!isset($groupedData[$userId])) {
                $groupedData[$userId] = [
                    'user_id' => $shift['user_id'],
                    'name' => $shift['name'],
                    'email' => $shift['user_email'],
                    'total_hours' => (float)$shift['hours'],
                    'morning_hours' => (float)$job_hours['morning'],
                    'night_hours' => (float)$job_hours['night'],
                    'saturday_morning_hours' => (float)$job_hours['saturday_morning'],
                    'saturday_night_hours' => (float)$job_hours['saturday_night'],
                    'sunday_morning_hours' => (float)$job_hours['sunday_morning'],
                    'sunday_night_hours' => (float)$job_hours['sunday_night'],
                    'ph_morning_hours' => (float)$job_hours['ph_morning'],
                    'ph_night_hours' => (float)$job_hours['ph_night'],
                    'shifts' => []
                ];
            } else {
                $groupedData[$userId]['total_hours'] += (float)$shift['hours'];
                $groupedData[$userId]['morning_hours'] += (float)$job_hours['morning'];
                $groupedData[$userId]['night_hours'] += (float)$job_hours['night'];
                $groupedData[$userId]['saturday_morning_hours'] += (float)$job_hours['saturday_morning'];
                $groupedData[$userId]['saturday_night_hours'] += (float)$job_hours['saturday_night'];
                $groupedData[$userId]['sunday_morning_hours'] += (float)$job_hours['sunday_morning'];
                $groupedData[$userId]['sunday_night_hours'] += (float)$job_hours['sunday_night'];
                $groupedData[$userId]['ph_morning_hours'] += (float)$job_hours['ph_morning'];
                $groupedData[$userId]['ph_night_hours'] += (float)$job_hours['ph_night'];
            }

            // Add shift details
            $groupedData[$userId]['shifts'][] = [
                'shift_id' => $shift['shift_id'],
                'start' => $shift['start'],
                'end' => $shift['end'],
                'site_id' => $shift['site_id'],
                'site_name' => $shift['site_name'],
                'accepted_by' => $shift['accepted_by'],
                'contractor_name' => $shift['contractor_name'],
                'hours_breakdown' => $job_hours
            ];
        }

        return array_values($groupedData);
    }

    /**
     * Get email recipients who worked in the previous week
     */
    // private function getEmailRecipients($start, $end)
    // {
    //     // Get all users who had shifts in the previous week
    //     $usersWithShifts = JobRoster::query()
    //         ->whereDate('job_rosters.start', '>=', $start)
    //         ->whereDate('job_rosters.start', '<=', $end)
    //         ->whereNotNull('job_rosters.assigned_to')
    //         ->distinct()
    //         ->pluck('job_rosters.assigned_to')
    //         ->toArray();

    //     // Get all contractors who accepted shifts in the previous week
    //     $contractorsWithShifts = JobRoster::query()
    //         ->whereDate('job_rosters.start', '>=', $start)
    //         ->whereDate('job_rosters.start', '<=', $end)
    //         ->whereNotNull('job_rosters.accepted_by')
    //         ->distinct()
    //         ->pluck('job_rosters.accepted_by')
    //         ->toArray();

    //     // Get admin users (always get admins, they need the report)
    //     $admins = User::where('role', 'admin')->get();
        
    //     // Get staff users who had shifts in the previous week
    //     $staff = User::whereIn('id', $usersWithShifts)
    //         ->where('role', 'staff')
    //         ->get();

    //     // Get contractors who accepted shifts in the previous week
    //     $contractors = User::whereIn('id', $contractorsWithShifts)
    //         ->where('role', 'contractor')
    //         ->get();

    //     return [
    //         'admins' => $admins,
    //         'staff' => $staff,
    //         'contractors' => $contractors
    //     ];
    // }

    /**
     * Send timesheet emails to all recipients
     */
    private function sendTimesheetEmails($recipients, $allTimesheetData, $start, $end)
{
    $results = [
        'sent' => [],
        'failed' => [],
        'summary' => [
            'total_admins' => count($recipients['admins']),
            'total_staff' => count($recipients['staff']),
            'total_contractors' => count($recipients['contractors'])
        ]
    ];

    // Format date range for email subject (dd/mm/yyyy)
    $dateRange = Carbon::parse($start)->format('d/m/Y') . ' - ' . Carbon::parse($end)->format('d/m/Y');

    // 1. Send to administrators (ALL DATA)
    foreach ($recipients['admins'] as $admin) {
        try {
            Log::info('Sending email to admin', ['email' => $admin->email, 'data_count' => count($allTimesheetData)]);
            Mail::to($admin->email)->send(new WeeklyTimesheetMail(
                $allTimesheetData,  // Full data for admins
                $dateRange,
                'admin',
                $admin->name
            ));
            $results['sent'][] = $admin->email . ' (Admin - All Data)';
            Log::info("Timesheet email sent to admin: {$admin->email}");
        } catch (\Exception $e) {
            $results['failed'][] = [
                'email' => $admin->email,
                'role' => 'admin',
                'error' => $e->getMessage()
            ];
            Log::error("Failed to send email to admin {$admin->email}: " . $e->getMessage());
        }
    }

    // 2. Send to staff (ONLY THEIR OWN DATA)
    foreach ($recipients['staff'] as $staffMember) {
        // Filter timesheet data for this staff member
        $staffData = array_filter($allTimesheetData, function($data) use ($staffMember) {
            return $data['user_id'] == $staffMember->id;
        });

        $staffData = array_values($staffData); // Reset array keys

        if (!empty($staffData)) {
            try {
                Log::info('Sending email to staff', [
                    'email' => $staffMember->email, 
                    'data_count' => count($staffData)
                ]);
                Mail::to($staffMember->email)->send(new WeeklyTimesheetMail(
                    $staffData,  // Only this staff member's data
                    $dateRange,
                    'staff',
                    $staffMember->name
                ));
                $results['sent'][] = $staffMember->email . ' (Staff - Own Data)';
                Log::info("Timesheet email sent to staff: {$staffMember->email}");
            } catch (\Exception $e) {
                $results['failed'][] = [
                    'email' => $staffMember->email,
                    'role' => 'staff',
                    'error' => $e->getMessage()
                ];
                Log::error("Failed to send email to staff {$staffMember->email}: " . $e->getMessage());
            }
        } else {
            Log::warning("No timesheet data found for staff member: {$staffMember->email}");
        }
    }

    // 3. Send to contractors (ONLY THEIR OWN DATA)
    foreach ($recipients['contractors'] as $contractor) {
        // Filter timesheet data for this contractor
        $contractorData = array_filter($allTimesheetData, function($data) use ($contractor) {
            return $data['user_id'] == $contractor->id;
        });

        $contractorData = array_values($contractorData); // Reset array keys

        if (!empty($contractorData)) {
            try {
                Log::info('Sending email to contractor', [
                    'email' => $contractor->email, 
                    'data_count' => count($contractorData)
                ]);
                Mail::to($contractor->email)->send(new WeeklyTimesheetMail(
                    $contractorData,  // Only this contractor's data
                    $dateRange,
                    'contractor',
                    $contractor->name
                ));
                $results['sent'][] = $contractor->email . ' (Contractor - Own Data)';
                Log::info("Timesheet email sent to contractor: {$contractor->email}");
            } catch (\Exception $e) {
                $results['failed'][] = [
                    'email' => $contractor->email,
                    'role' => 'contractor',
                    'error' => $e->getMessage()
                ];
                Log::error("Failed to send email to contractor {$contractor->email}: " . $e->getMessage());
            }
        } else {
            Log::warning("No timesheet data found for contractor: {$contractor->email}");
        }
    }

    return $results;
}

    /**
     * Get timesheet with pagination (Your existing method)
     */
    public function getTimesheet(Request $request)
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

    /**
     * Get timesheet details (Your existing method)
     */
    public function getTimeSheetDetails(Request $request)
    {
        $rosters = JobRoster::whereIn('id', $request->shift_collection)
            ->with(['site', 'guards', 'customer', 'rosterActivity'])->get();

        $data = $rosters;
        if (count($data) > 0) {
            return response()->json(['success' => true, 'data' => $data]);
        }
        return response()->json(['success' => false, 'data' => $data]);
    }
}
