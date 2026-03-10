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
        $storeRating = JobRoster::where('guard_id', $request->guard_id)->where('id', $request->roster_id)->first();
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
}
