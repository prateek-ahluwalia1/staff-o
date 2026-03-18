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
}
