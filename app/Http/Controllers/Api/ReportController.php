<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\JobRoster;

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
            $job_hours = $this->getShiftHours(
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
        $rosters = JobRoster::
       
        whereIn('id', $request->shift_collection)
        ->with(['site', 'guards', 'customer', 'rosterActivity'])->get();

      //$data = TimeSheetDetailsResource::collection($rosters);
      $data = $rosters;
      if (count($data) > 0) {
         return response()->json(['success' => true, 'data' => $data]);
       }
      return response()->json(['success' => false, 'data' => $data]);
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
        
        // Fix: Remove '==' and use proper where clause
        if ($job_status == 'upcoming') {
            $results->where('job_rosters.job_status', 'pending');
        } elseif ($job_status == 'ongoing') {
            $results->where('job_rosters.job_status', 'inprogress');
        } elseif ($job_status == 'confirmed') {
            $results->where('job_rosters.job_status', 'confirmed');
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
            // Fix: Add customer join properly
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
                'job_roster_activities.signin_time',
                'job_roster_activities.signout_time',
                'job_roster_activities.auto_signout',
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
}
