<?php

namespace App\Http\Controllers\Api;

use App\Exports\PaysheetExport;
use App\Http\Controllers\Controller;
use App\Models\ChargeRate;
use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\ReportPdfService;
use Carbon\Carbon;
use App\Models\JobRoster;
use App\Models\Payrate;

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
        // $filename = time().'_job_tracker_report.xlsx';  
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

    //  public function getPaysheet(Request $request)
    // {
    //     $limit = 10;
    //     $offset = 0;
    //     if ($request->has('pageIndex') && $request->has('pageSize')) {
    //         $offset = $request->pageIndex * $request->pageSize;
    //         $limit  = $request->pageSize;
    //     }
 
    //     // Date range
    //     if ($request->has('start') && $request->start != '') {
    //         $start = dbFormate($request->start);
    //     } else {
    //         $start = Carbon::now()->startOfWeek()->toDateString();
    //     }
    //     if ($request->has('end') && $request->end != '') {
    //         $end = dbFormate($request->end);
    //     } else {
    //         $end = Carbon::now()->endOfWeek()->toDateString();
    //     }
 
    //     // Base query
    //     $baseQuery = JobRoster::query()
    //         ->leftJoin('users',  'users.id',  '=', 'job_rosters.assigned_to')
    //         ->leftJoin('sites',  'sites.id',  '=', 'job_rosters.site_id')
    //         ->leftJoin('users as customers', 'customers.id', '=', 'sites.user_id')
    //         ->whereNotNull('job_rosters.assigned_to')
    //         ->whereDate('job_rosters.start', '>=', $start)
    //         ->whereDate('job_rosters.start', '<=', $end);
 
    //     // Optional filters
    //     // if ($request->filled('guard_id')) {
    //     //     $baseQuery->whereIn('job_rosters.assigned_to', $request->guard_id);
    //     // }
    //     // if ($request->filled('customer_ids')) {
    //     //     $siteIds = Site::whereIn('user_id', $request->customer_ids)->pluck('id')->toArray();
    //     //     $baseQuery->whereIn('job_rosters.site_id', $siteIds);
    //     // }
    //     // if ($request->filled('sites_ids')) {
    //     //     $baseQuery->whereIn('job_rosters.site_id', $request->sites_ids);
    //     // }
 
    //     $shifts = $baseQuery->select([
    //         'job_rosters.id          as shift_id',
    //         'job_rosters.start',
    //         'job_rosters.end',
    //         'job_rosters.hours',
    //         'job_rosters.in_paysheet',
    //         'job_rosters.morning_hours',
    //         'job_rosters.night_hours',
    //         'job_rosters.saturday_morning_hours',
    //         'job_rosters.saturday_night_hours',
    //         'job_rosters.sunday_morning_hours',
    //         'job_rosters.sunday_night_hours',
    //         'job_rosters.ph_morning_hours',
    //         'job_rosters.ph_night_hours',
    //         'users.id                as user_id',
    //         'users.name              as staff_name',
    //         'users.phone             as staff_phone',
    //         // 'users.employment_type   as staff_type',
    //         'sites.id                as site_id',
    //         'sites.site_name              as site_name',
    //         // 'sites.level             as site_level',
    //         'sites.state             as state',
    //         'customers.name          as customer_name',
    //     ])
    //     ->orderBy('users.name')
    //     ->orderBy('job_rosters.start')
    //     ->get();
 
    //     // Pre-load all charge rates keyed by site_level (charge_rates.id = 1 per site level)
    //     // Adjust the query below if your charge_rates table uses a different key.
    //     $chargeRates = ChargeRate::where('id', 1)->get();
    //         // ->keyBy('site_level'); // keyed by site level so lookup is O(1)
 
    //     // Build per-employee grouped structure
    //     $mainArr = [];
 
    //     foreach ($shifts as $shift) {
    //         $userId = $shift->user_id;
 
    //         // Recalculate hour breakdowns fresh (same helper used in timesheet)
    //         $jobHours = getShiftHours(
    //             date('m/d/Y H:i', strtotime($shift->start)),
    //             date('m/d/Y H:i', strtotime($shift->end))
    //         );
 
    //         // Resolve charge rate for this shift's site level
    //         $rate      = $chargeRates->get($shift->site_level);
    //         $mfDay     = $rate ? (float) $rate->mf_morning_rate  : 0;
    //         $mfNight   = $rate ? (float) $rate->mf_night_rate    : 0;
    //         $satMorn   = $rate ? (float) $rate->saturday_morning_rate : 0;
    //         $satNight  = $rate ? (float) $rate->saturday_night_rate   : 0;
    //         $sunMorn   = $rate ? (float) $rate->sunday_morning_rate   : 0;
    //         $sunNight  = $rate ? (float) $rate->sunday_night_rate     : 0;
    //         $phMorn    = $rate ? (float) $rate->ph_morning_rate   : 0;
    //         $phNight   = $rate ? (float) $rate->ph_night_rate     : 0;
 
    //         // Per-shift gross
    //         $shiftGross = $this->calculateGross($jobHours, $mfDay, $mfNight, $satMorn, $satNight, $sunMorn, $sunNight, $phMorn, $phNight);
 
    //         // Shift row (used inside shift_collection for detail view)
    //         $shiftRow = [
    //             'shift_id'               => $shift->shift_id,
    //             'state'                  => $shift->state,
    //             'site_name'              => $shift->site_name,
    //             'site_level'             => $shift->site_level,
    //             'date'                   => date('d-m-Y', strtotime($shift->start)),
    //             'shift_start'            => date('H:i', strtotime($shift->start)),
    //             'shift_end'              => date('H:i', strtotime($shift->end)),
    //             'sign_in'                => $shift->sign_in  ?? '-',
    //             'sign_out'               => $shift->sign_out ?? '-',
    //             'hours'                  => (float) $shift->hours,
    //             'morning_hours'          => (float) $jobHours['morning'],
    //             'mf_day_rate'            => $mfDay,
    //             'night_hours'            => (float) $jobHours['night'],
    //             'mf_night_rate'          => $mfNight,
    //             'saturday_morning_hours' => (float) $jobHours['saturday_morning'],
    //             'saturday_morning_rate'  => $satMorn,
    //             'saturday_night_hours'   => (float) $jobHours['saturday_night'],
    //             'saturday_night_rate'    => $satNight,
    //             'sunday_morning_hours'   => (float) $jobHours['sunday_morning'],
    //             'sunday_morning_rate'    => $sunMorn,
    //             'sunday_night_hours'     => (float) $jobHours['sunday_night'],
    //             'sunday_night_rate'      => $sunNight,
    //             'ph_morning_hours'       => (float) $jobHours['ph_morning'],
    //             'ph_morning_rate'        => $phMorn,
    //             'ph_night_hours'         => (float) $jobHours['ph_night'],
    //             'ph_night_rate'          => $phNight,
    //             'gross_amount'           => round($shiftGross, 4),
    //         ];
 
    //         if (!isset($mainArr[$userId])) {
    //             $mainArr[$userId] = [
    //                 'user_id'                => $userId,
    //                 'staff_name'             => $shift->staff_name,
    //                 'staff_phone'            => $shift->staff_phone ?? '',
    //                 'staff_type'             => $shift->staff_type  ?? '',
    //                 'customer_name'          => $shift->customer_name ?? '',
    //                 // Aggregated hour totals
    //                 'total_hours'            => (float) $shift->hours,
    //                 'total_morning_hours'    => (float) $jobHours['morning'],
    //                 'total_night_hours'      => (float) $jobHours['night'],
    //                 'total_saturday_morning' => (float) $jobHours['saturday_morning'],
    //                 'total_saturday_night'   => (float) $jobHours['saturday_night'],
    //                 'total_sunday_morning'   => (float) $jobHours['sunday_morning'],
    //                 'total_sunday_night'     => (float) $jobHours['sunday_night'],
    //                 'total_ph_morning'       => (float) $jobHours['ph_morning'],
    //                 'total_ph_night'         => (float) $jobHours['ph_night'],
    //                 'total_gross'            => round($shiftGross, 4),
    //                 'shift_collection'       => [$shiftRow],
    //             ];
    //         } else {
    //             $mainArr[$userId]['total_hours']            += (float) $shift->hours;
    //             $mainArr[$userId]['total_morning_hours']    += (float) $jobHours['morning'];
    //             $mainArr[$userId]['total_night_hours']      += (float) $jobHours['night'];
    //             $mainArr[$userId]['total_saturday_morning'] += (float) $jobHours['saturday_morning'];
    //             $mainArr[$userId]['total_saturday_night']   += (float) $jobHours['saturday_night'];
    //             $mainArr[$userId]['total_sunday_morning']   += (float) $jobHours['sunday_morning'];
    //             $mainArr[$userId]['total_sunday_night']     += (float) $jobHours['sunday_night'];
    //             $mainArr[$userId]['total_ph_morning']       += (float) $jobHours['ph_morning'];
    //             $mainArr[$userId]['total_ph_night']         += (float) $jobHours['ph_night'];
    //             $mainArr[$userId]['total_gross']            += round($shiftGross, 4);
    //             $mainArr[$userId]['shift_collection'][]      = $shiftRow;
    //         }
    //     }
 
    //     $paysheet      = array_values($mainArr);
    //     $total         = count($paysheet);
    //     $paginatedData = array_slice($paysheet, $offset, $limit);
 
    //     return response()->json([
    //         'success'   => count($paginatedData) > 0,
    //         'code'      => 200,
    //         'length'    => $total,
    //         'pageIndex' => $request->pageIndex ?? 0,
    //         'pageSize'  => $limit,
    //         'message'   => count($paginatedData) > 0 ? 'Paysheet found.' : 'No paysheet found!',
    //         'data'      => $paginatedData,
    //     ]);
    // }
 
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
}
