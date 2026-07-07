<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Site;
use Illuminate\Http\Request;
use App\Http\Resources\GuardIncidentReportRecource;
use Illuminate\Support\Facades\DB;
use App\Models\JobRoster;
use App\Models\JobRosterTask;
use App\Models\JobRosterActivity;
use Dompdf\Dompdf;

class JobRosterActiviteController extends Controller
{
   
    public function JobSignInSignOut(Request $request)
    {
        $guard_activites = JobRosterActivity::where('guard_id', $request->guard_id)->where('job_roster_id', $request->roster_id)->first();
        if($guard_activites){
            return response()->json(['success' => true,'code' => 200 , 'data' => $guard_activites]);
        }else{
            return response()->json(['success' => false,'code' => 404 , 'message' => 'Record Not Found!']);
        } 
    }

    public function guardBreakDetails(Request $request)
    {
        $guardBreak = DB::table('job_breaks')->where('roster_id', $request->roster_id)
        ->where('guard_id', $request->guard_id)
        ->select('id', 'start_time', 'end_time', 'notes', 'inform_to')->get();
        if($guardBreak){
            // $gb =  GuardBreakDetailsResource::collection($guardBreak);
            return response()->json(['success' => true,'code' => 200 , 'data' => $guardBreak]); 
        }else{
            return response()->json(['success' => false,'code' => 404 , 'data' => '']);
        }
    }

       public function guardIncidentReport(Request $request)
    {
        $guardIncidentReport =  DB::table('incident_reports')->where('roster_id', $request->roster_id)
        ->where('guard_id', $request->guard_id)
        ->select('id', 'site_name', 'incident_date', 'incident_time', 'injury_type', 'pdf', 'injury_detail', 'people_involved','vehicle','emergency_services', 'wittness', 'photo', 'signature')->get();
        if($guardIncidentReport){

            $roster = JobRoster::where('id', $request->roster_id)->first();
            if($roster){
                $staff = !empty($roster->assined_to) ? getUserName($roster->assined_to) : null;
                $loaction = !empty($roster->site_id) ? getSiteName($roster->site_id) : null;
                $shift_start = !empty($roster->start) ? usaToAusDateTime($roster->start) : '';
                $shift_end = !empty($roster->end) ? usaToAusDateTime($roster->end) : '';
                $customer_id = '';
                if(!empty($roster->site_id)){
                        $s = Site::where('id', $roster->site_id)->first();
                        $customer_id = $s->user_id;
                    }    
                $customer = !empty($customer_id) ? getUserName($customer_id) : null;
            }

            $gIr =  GuardIncidentReportRecource::collection($guardIncidentReport);
            
            return response()->json(['success' => true,'code' => 200 , 'data' => $gIr,
            'staff' => $staff, 'loaction' => $loaction, 
            'customer' =>  $customer,
            'shift_start' => $shift_start,
            'shift_end' => $shift_end]); 

        }else{
            return response()->json(['success' => false,'code' => 404 , 'data' => '']);
        }
    }

        public function guardFootPatrolReport(Request $request)
    {
        $guardFootPatrolReport = DB::table('foot_patrol_reports')->where('roster_id', $request->roster_id)
        ->where('guard_id', $request->guard_id)
        ->select('id', 'site_name', 'date', 'time', 'pdf', 'patrolling_detail', 'photo', 'signature')->get();
        if($guardFootPatrolReport){

            $roster = JobRoster::where('id', $request->roster_id)->first();
            if($roster){
                $staff = !empty($roster->guard_id) ? getUserName($roster->assigned_to) : null;
                $loaction = !empty($roster->site_id) ? getSiteName($roster->site_id) : null;
                $shift_start = !empty($roster->start) ? usaToAusDateTime($roster->start) : '';
                $shift_end = !empty($roster->end) ? usaToAusDateTime($roster->end) : '';
                $customer_id = '';
                if(!empty($roster->site_id)){
                        $s = Site::where('id', $roster->site_id)->first();
                        $customer_id = $s->user_id;
                    }    
                $customer = !empty($customer_id) ? getUserName($customer_id) : null;
            }

            // $gIr =  GuardFootPatrolReportRecource::collection($guardFootPatrolReport);
            
            return response()->json(['success' => true,'code' => 200 , 'data' => $guardFootPatrolReport,
            'staff' => $staff, 'loaction' => $loaction, 
            'customer' =>  $customer,
            'shift_start' => $shift_start,
            'shift_end' => $shift_end]); 

        }else{
            return response()->json(['success' => false,'code' => 404 , 'data' => '']);
        }
        
    }

   public function getJobTasks(Request $request) {
    $tasks = JobRosterTask::where('job_roster_id', $request->roster_id)->with('shift')->get();
    // $ts = getjobRosterTaskResource::collection($tasks);

    $roster = JobRoster::where('id', $request->roster_id)->first();
    if($roster){
        $staff = !empty($roster->guard_id) ? getUserName($roster->assigned_to) : null;
        $loaction = !empty($roster->site_id) ? getSiteName($roster->site_id) : null;
        $shift_start = !empty($roster->start) ? usaToAusDateTime($roster->start) : '';
        $shift_end = !empty($roster->end) ? usaToAusDateTime($roster->end) : '';
        $customer_id = '';
        if(!empty($roster->site_id)){
                $s = Site::where('id', $roster->site_id)->first();
                $customer_id = $s->user_id;
            }
            
        $customer = !empty($customer_id) ? getUserName($customer_id) : null;
    }

    return response()->json(['success' => true, 'data' => $tasks, 
    'staff' => $staff, 'loaction' => $loaction, 
    'customer' =>  $customer,
    'shift_start' => $shift_start,
    'shift_end' => $shift_end,

    ]);

   }

      public function storeOperationNotes(Request $request)
    {
       $storeOperationNotes = JobRoster::where('id', $request->roster_id)->first();
       if(!empty($storeOperationNotes->operation_notes)){
        return response()->json(['success' => false,'message' => 'Operation Notes Already Store!']);
       }else{
        $storeOperationNotes->operation_notes = $request->operation_notes;
        $storeOperationNotes->save();
        return response()->json(['success' => true,'message' => 'Operation Notes Added Successfully!']);
       }
    }
    public function giveRatingJobRoster(Request $request)
    {
        $storeRating = JobRoster::where('assigned_to', $request->guard_id)->where('id', $request->roster_id)->first();
        if(!empty($storeRating->rating)){
            return response()->json(['success' => false,'message' => 'Rating Already Store!']);
        }else{
            $storeRating->rating = $request->rating;
            $storeRating->rating_desc = $request->rating_desc;
            $storeRating->save();
            return response()->json(['success' => true,'message' => 'Rating Added Successfully!']);
        }
    }

   public function getJobrosterRating(Request $request)
   {
    $getRating = JobRoster::where('assigned_to', $request->guard_id)
    ->where('id', $request->roster_id)->select('rating', 'rating_desc')->first();
    return response()->json(['success' => true, 'data' => $getRating]);
   }
   public function getOperationNotes(Request $request)
   {
    $getOperationNotes = JobRoster::where('assigned_to', $request->guard_id)
    ->where('id', $request->roster_id)->select('operation_notes','id')->first();
    return response()->json(['success' => true, 'data' => $getOperationNotes]);
   }

   public function getAllGuardReports(Request $request)
    {
        // Validate required fields
        $request->validate([
            'roster_id' => 'required',
            'guard_id' => 'required'
        ]);

        $response = [
            'success' => true,
            'code' => 200,
            'data' => [
                'incident_report' => null,
                'foot_patrol_report' => null,
                'sign_in_out' => null,
                'break_details' => null
            ],
            'common_info' => null
        ];

        // 1. Get Incident Report
        $guardIncidentReport = DB::table('incident_reports')
            ->where('roster_id', $request->roster_id)
            ->where('guard_id', $request->guard_id)
            ->select('id', 'site_name', 'incident_date', 'incident_time', 'injury_type', 'pdf', 'injury_detail', 'people_involved', 'vehicle', 'emergency_services', 'wittness', 'photo', 'signature')
            ->get();
        
        if($guardIncidentReport && $guardIncidentReport->isNotEmpty()) {
            $response['data']['incident_report'] = GuardIncidentReportRecource::collection($guardIncidentReport);
        }

        // 2. Get Foot Patrol Report
        $guardFootPatrolReport = DB::table('foot_patrol_reports')
            ->where('roster_id', $request->roster_id)
            ->where('guard_id', $request->guard_id)
            ->select('id', 'site_name', 'date', 'time', 'pdf', 'patrolling_detail', 'photo', 'signature')
            ->get();
        
        if($guardFootPatrolReport && $guardFootPatrolReport->isNotEmpty()) {
            $response['data']['foot_patrol_report'] = $guardFootPatrolReport;
        }

        // 3. Get Sign In/Out
        $guard_activites = JobRosterActivity::where('guard_id', $request->guard_id)
            ->where('job_roster_id', $request->roster_id)
            ->first();
        
        if($guard_activites) {
            $response['data']['sign_in_out'] = $guard_activites;
        }

        // 4. Get Break Details
        $guardBreak = DB::table('job_breaks')
            ->where('roster_id', $request->roster_id)
            ->where('guard_id', $request->guard_id)
            ->select('id', 'start_time', 'end_time', 'notes', 'inform_to')
            ->get();
        
        if($guardBreak && $guardBreak->isNotEmpty()) {
            $response['data']['break_details'] = $guardBreak;
        }

        // Get common roster information (applies to all reports)
        $roster = JobRoster::where('id', $request->roster_id)->first();
        
        if($roster) {
            $staff = !empty($roster->assined_to) ? getUserName($roster->assined_to) : null;
            $location = !empty($roster->site_id) ? getSiteName($roster->site_id) : null;
            $shift_start = !empty($roster->start) ? usaToAusDateTime($roster->start) : '';
            $shift_end = !empty($roster->end) ? usaToAusDateTime($roster->end) : '';
            
            $customer_id = '';
            if(!empty($roster->site_id)) {
                $s = Site::where('id', $roster->site_id)->first();
                $customer_id = $s->user_id ?? '';
            }
            $customer = !empty($customer_id) ? getUserName($customer_id) : null;

            $response['common_info'] = [
                'staff' => $staff,
                'location' => $location,
                'customer' => $customer,
                'shift_start' => $shift_start,
                'shift_end' => $shift_end
            ];
        }

        // Check if at least one report was found
        $hasData = false;
        foreach($response['data'] as $key => $value) {
            if($value !== null && (!is_array($value) || (is_array($value) && !empty($value)))) {
                $hasData = true;
                break;
            }
        }

        if(!$hasData && $response['common_info'] === null) {
            return response()->json([
                'success' => false,
                'code' => 404,
                'message' => 'No records found for this roster and guard combination'
            ]);
        }

        return response()->json($response);
    }

    public function generateIncidentReport(Request $request)
    {
        $request->validate([
            'roster_id' => 'required',
            'guard_id'  => 'required',
        ]);
    
        // ── Fetch all incident reports for this roster + guard ──
        $reports = DB::table('incident_reports')
            ->where('roster_id', $request->roster_id)
            ->where('guard_id',  $request->guard_id)
            ->select(
                'id', 'site_name', 'incident_date', 'incident_time',
                'injury_type', 'injury_detail', 'people_involved',
                'vehicle', 'emergency_services', 'wittness', 'photo', 'signature'
            )
            ->get();
    
        if ($reports->isEmpty()) {
            return response()->json([
                'success' => false,
                'code'    => 404,
                'message' => 'No incident reports found for this roster and guard.',
            ]);
        }
    
        // Decode JSON columns on each report
        $reports = $reports->map(function ($report) {
            $report->people_involved    = !empty($report->people_involved)    ? json_decode($report->people_involved,    true) : [];
            $report->vehicle            = !empty($report->vehicle)            ? json_decode($report->vehicle,            true) : [];
            $report->emergency_services = !empty($report->emergency_services) ? json_decode($report->emergency_services, true) : [];
            $report->wittness           = !empty($report->wittness)           ? json_decode($report->wittness,           true) : [];
            $report->photo              = !empty($report->photo)              ? json_decode($report->photo,              true) : [];
            return $report;
        });
    
        // ── Fetch roster / shift info ──
        $roster      = \App\Models\JobRoster::where('id', $request->roster_id)->first();
        $staff       = null;
        $location    = null;
        $shift_start = '';
        $shift_end   = '';
    
        if ($roster) {
            $staff       = !empty($roster->assigned_to) ? getUserName($roster->assigned_to) : 'N/A';
            $location    = !empty($roster->site_id)    ? getSiteName($roster->site_id)    : 'N/A';
            $shift_start = !empty($roster->start)      ? usaToAusDateTime($roster->start) : '';
            $shift_end   = !empty($roster->end)        ? usaToAusDateTime($roster->end)   : '';
        }
    
        // ── Render Blade view to HTML ──
        $html = view('incident-report', [
            'reports'     => $reports,
            'staff'       => $staff,
            'location'    => $location,
            'shift_start' => $shift_start,
            'shift_end'   => $shift_end,
            'total'       => $reports->count(),
        ])->render();
    
        // ── Generate PDF with Dompdf ──
        $dompdf = new Dompdf();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $output = $dompdf->output();
    
        // ── Save file ──
        $public_path = public_path();
        $public_path = str_replace('247StaffingSolution/public/', '', $public_path);
        $folder      = '/incident';
        $path        = $public_path . $folder;
    
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
    
        $file_name = time() . '_incident_report.pdf';
        file_put_contents($path . '/' . $file_name, $output);
    
    
        // ── Also save PDF path back to each incident_report row ──
        $pdf_url = 'https://' . request()->getHttpHost() . '/incident/' . $file_name;
        // DB::table('incident_reports')
        //     ->where('roster_id', $request->roster_id)
        //     ->where('guard_id',  $request->guard_id)
        //     ->update(['pdf' => $pdf_url]);
    
        return response()->json([
            'success' => true,
            'message' => 'Incident Report generated successfully.',
            'path'    => $pdf_url,
        ]);
    }
    
    public function generateFootPatrolReport(Request $request)
    {
        $request->validate([
            'roster_id' => 'required',
            'guard_id'  => 'required',
        ]);
    
        // ── Fetch all foot patrol reports for this roster + guard ──
        $reports = DB::table('foot_patrol_reports')
            ->where('roster_id', $request->roster_id)
            ->where('guard_id',  $request->guard_id)
            ->select('id', 'site_name', 'date', 'time', 'patrolling_detail', 'photo', 'signature')
            ->get();
    
        if ($reports->isEmpty()) {
            return response()->json([
                'success' => false,
                'code'    => 404,
                'message' => 'No foot patrol reports found for this roster and guard.',
            ]);
        }
    
        // Decode JSON columns
        $reports = $reports->map(function ($report) {
            $report->photo     = !empty($report->photo)     ? json_decode($report->photo,     true) : [];
            return $report;
        });
    
        // ── Fetch roster / shift info ──
        $roster      = \App\Models\JobRoster::where('id', $request->roster_id)->first();
        $staff       = null;
        $location    = null;
        $shift_start = '';
        $shift_end   = '';
    
        if ($roster) {
            $staff       = !empty($roster->assigned_to) ? getUserName($roster->assigned_to) : 'N/A';
            $location    = !empty($roster->site_id)    ? getSiteName($roster->site_id)    : 'N/A';
            $shift_start = !empty($roster->start)      ? usaToAusDateTime($roster->start) : '';
            $shift_end   = !empty($roster->end)        ? usaToAusDateTime($roster->end)   : '';
        }
    
        // ── Render Blade view to HTML ──
        $html = view('foot-patrol-report', [
            'reports'     => $reports,
            'staff'       => $staff,
            'location'    => $location,
            'shift_start' => $shift_start,
            'shift_end'   => $shift_end,
            'total'       => $reports->count(),
        ])->render();
    
        // ── Generate PDF with Dompdf ──
        $dompdf = new Dompdf();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $output = $dompdf->output();
    
        // ── Save file ──
        $public_path = public_path();
        $public_path = str_replace('247StaffingSolution/public/', '', $public_path);
        $folder      = '/foot_patrol';
        $path        = $public_path . $folder;
    
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
    
        $file_name = time() . '_foot_patrol_report.pdf';
        file_put_contents($path . '/' . $file_name, $output);
    
        // ── Save PDF path back to each foot_patrol_report row ──
        $pdf_url = 'https://' . request()->getHttpHost() . '/foot_patrol/' . $file_name;
        // DB::table('foot_patrol_reports')
        //     ->where('roster_id', $request->roster_id)
        //     ->where('guard_id',  $request->guard_id)
        //     ->update(['pdf' => $pdf_url]);
    
        return response()->json([
            'success' => true,
            'message' => 'Foot Patrol Report generated successfully.',
            'path'    => $pdf_url,
        ]);
    }

    public function generateMasterShiftReport(Request $request)
    {
        $request->validate([
            'roster_id' => 'required',
            'guard_id'  => 'required',
        ]);
    
        // ── 1. Incident Reports ──
        $incidentReports = DB::table('incident_reports')
            ->where('roster_id', $request->roster_id)
            ->where('guard_id',  $request->guard_id)
            ->select(
                'id', 'site_name', 'incident_date', 'incident_time',
                'injury_type', 'injury_detail', 'people_involved',
                'vehicle', 'emergency_services', 'wittness', 'photo', 'signature'
            )
            ->get()
            ->map(function ($r) {
                $r->people_involved    = !empty($r->people_involved)    ? json_decode($r->people_involved,    true) : [];
                $r->vehicle            = !empty($r->vehicle)            ? json_decode($r->vehicle,            true) : [];
                $r->emergency_services = !empty($r->emergency_services) ? json_decode($r->emergency_services, true) : [];
                $r->wittness           = !empty($r->wittness)           ? json_decode($r->wittness,           true) : [];
                $r->photo              = !empty($r->photo)              ? json_decode($r->photo,              true) : [];
                return $r;
            });
    
        // ── 2. Foot Patrol Reports ──
        $footPatrolReports = DB::table('foot_patrol_reports')
            ->where('roster_id', $request->roster_id)
            ->where('guard_id',  $request->guard_id)
            ->select('id', 'site_name', 'date', 'time', 'patrolling_detail', 'photo', 'signature')
            ->get()
            ->map(function ($r) {
                $r->photo = !empty($r->photo) ? json_decode($r->photo, true) : [];
                return $r;
            });
    
        // ── 3. Attendance / Sign In-Out ──
        $guardActivity = JobRosterActivity::where('guard_id', $request->guard_id)
            ->where('job_roster_id', $request->roster_id)
            ->select('id', 'signin_time', 'location', 'signin_notes',
                        'signout_time', 'signout_notes')
            ->first();
    
        // ── 4. Break Details ──
        $breakDetails = DB::table('job_breaks')
            ->where('roster_id', $request->roster_id)
            ->where('guard_id',  $request->guard_id)
            ->select('id', 'start_time', 'end_time', 'notes', 'inform_to')
            ->get();
    
        // ── 5. Roster / shift info ──
        $roster      = \App\Models\JobRoster::where('id', $request->roster_id)->first();
        $staff       = 'N/A';
        $location    = 'N/A';
        $shift_start = '';
        $shift_end   = '';
        $total_hours = 'N/A';
        $status      = 'COMPLETED';
    
        if ($roster) {
            $staff       = !empty($roster->assigned_to) ? getUserName($roster->assigned_to) : 'N/A';
            $location    = !empty($roster->site_id)    ? getSiteName($roster->site_id)    : 'N/A';
            $shift_start = !empty($roster->start)      ? usaToAusDateTime($roster->start) : '';
            $shift_end   = !empty($roster->end)        ? usaToAusDateTime($roster->end)   : '';
    
            if ($roster->start && $roster->end) {
                $minutes     = \Carbon\Carbon::parse($roster->start)
                                ->diffInMinutes(\Carbon\Carbon::parse($roster->end));
                $total_hours = round($minutes / 60, 1) . ' Hrs';
            }
        }
    
        if ($incidentReports->isEmpty() && $footPatrolReports->isEmpty() && !$guardActivity && $breakDetails->isEmpty() && !$roster) {
            return response()->json([
                'success' => false,
                'code'    => 404,
                'message' => 'No records found for this roster and guard combination.',
            ]);
        }
    
        // ── Render Blade view ──
        $html = view('master-shift-report', [
            'staff'              => $staff,
            'location'           => $location,
            'shift_start'        => $shift_start,
            'shift_end'          => $shift_end,
            'total_hours'        => $total_hours,
            'status'             => $status,
            'report_date'        => now()->format('d/m/Y'),
            'guardActivity'      => $guardActivity,
            'breakDetails'       => $breakDetails,
            'footPatrolReports'  => $footPatrolReports,
            'incidentReports'    => $incidentReports,
        ])->render();
    
        // ── Generate PDF with Dompdf ──
        $dompdf = new Dompdf();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $output = $dompdf->output();
    
        // ── Save file ──
        $public_path = public_path();
        $public_path = str_replace('247StaffingSolution/public/', '', $public_path);
        $folder      = '/shift_report';
        $path        = $public_path . $folder;
    
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
    
        $file_name = time() . '_end_shift_report.pdf';
        file_put_contents($path . '/' . $file_name, $output);
    
        // ── Save to transient_files ──
        // DB::table('transient_files')->insert([
        //     'folder'    => 'shift_report',
        //     'file_name' => $file_name,
        // ]);
    
        $pdf_url = 'https://' . request()->getHttpHost() . '/shift_report/' . $file_name;
    
        return response()->json([
            'success' => true,
            'message' => 'Master Shift Report generated successfully.',
            'path'    => $pdf_url,
        ]);
    }
}
