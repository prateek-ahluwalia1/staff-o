<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuardLeave;
use Illuminate\Http\Request;
use App\Models\JobRoster;
use App\Models\User;
use DateTime;
use Illuminate\Support\Facades\DB;

class LeaveManagementController extends Controller
{
    function getLeaveDetails($id)
    {
        $user = User::findOrFail($id);

        if($user->user_type == 'staff'){

        $leave_requests = GuardLeave::with(['guardss'])
        ->where('guard_id', $id)
         ->whereRaw("
            STR_TO_DATE(start_date, '%m/%d/%Y') <= LAST_DAY(CURDATE())
            AND STR_TO_DATE(end_date, '%m/%d/%Y') >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        ")
        ->orderBy('id', 'desc')
        ->get();

        }elseif($user->user_type == 'contractor'){

        $leave_requests = GuardLeave::with(['guardss'])
        ->where('admin_id', $id)
         ->whereRaw("
            STR_TO_DATE(start_date, '%m/%d/%Y') <= LAST_DAY(CURDATE())
            AND STR_TO_DATE(end_date, '%m/%d/%Y') >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        ")
        ->orderBy('id', 'desc')
        ->get();

        }else{

        $leave_requests = GuardLeave::with(['guardss'])
         ->whereRaw("
            STR_TO_DATE(start_date, '%m/%d/%Y') <= LAST_DAY(CURDATE())
            AND STR_TO_DATE(end_date, '%m/%d/%Y') >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        ")
        ->orderBy('id', 'desc')
        ->get();

        }
        
        
        return response()->json(['success' => true, 'data' => $leave_requests]);
    }

    // public function getPendingLeaveRequests(Request $request)
    // {
    //     $leave_requests = DB::table('guard_leave_requests')
    //     ->where('guard_id', $request->id)
    //     ->where('admin_id','=', null)
    //     ->where('start', '>=', strtotime('-'.$request->days.' day'))
    //     ->get();
    //     $leave_requests_by_admin = DB::table('guard_leave_requests')
    //     ->where('guard_id', $request->id)
    //     ->where('admin_id','!=', '')
    //     ->where('start', '>=', strtotime('-'.$request->days.' day'))
    //     ->get();
    //     foreach($leave_requests as $l)
    //     {
    //         $l->start_date = usaToAus($l->start_date);
    //         $l->end_date = usaToAus($l->end_date);
    //         $l->reason = str_replace('_', ' ', $l->reason);
    //         if ($l->approved_by != '') {
    //             $l->admin_name = DB::table('users')->where('id', $l->approved_by)->value('name');
    //         }else{
    //             $l->admin_name = 'N/A';
    //         }
    //     }

    //     foreach($leave_requests_by_admin as $la)
    //     {
    //         $la->start_date = usaToAus($la->start_date);
    //         $la->end_date = usaToAus($la->end_date);
    //         $la->reason = str_replace('_', ' ', $la->reason);
    //         if ($la->admin_id != '') {
    //             $la->admin_name = DB::table('users')->where('id', $la->admin_id)->value('name');
    //         }else{
    //             $la->admin_name = 'N/A';
    //         }
    //     }
    //     return response()->json(['success' => true, 'data' => $leave_requests, 'admin_leaves' => $leave_requests_by_admin]);
    // }

    function addAdminLeaveRequest(Request $request)
    {
        
        $date = explode(' - ', $request->date);
        $s = str_replace('-', '/',$date[0]);
        $e = str_replace('-', '/',$date[1]);
        
        // $from = strtotime(date_convert(str_replace('-', '/',$date[0])));
        // $to = strtotime((date_convert(str_replace('-', '/',$date[1])).' 23:59:59'));
        $from = strtotime(str_replace('-', '/', $date[0]));
        $to = strtotime(str_replace('-', '/', $date[1] . ' 23:59:59'));
        
        $datetime1 = new DateTime(date('Y-m-d', $from));
        $datetime2 = new DateTime(date('Y-m-d', $to));
        $difference = $datetime1->diff($datetime2);
        if ($request->guard_id == $request->admin_id){
            $status = 'pending';
            }else{
            $status = 'approved';
            }

        $record_id = DB::table('guard_leave_requests')->insertGetId([
            'guard_id' => $request->guard_id,
            'start' => $from,
            'end' => $to,
            'start_date' => $s,
            'end_date' => $e,
            'notes' => $request->notes,
            'date_added' => time(),
            'reason' => $request->reason,
            'days' => $difference->days == 0 ? 1 : $difference->days,
            'status' => $status,
            'admin_id' => $request->admin_id,
            'approved_by' => $request->admin_id,
        ]);
        if ($record_id) {
                return response()->json(['success' => true, 'message' => 'Leave request updated']);
        }else{
                return response()->json(['success' => false, 'message' => 'Fail to add leave!']);
        }
    }

    function getLeaveGuards()
    {
        $guards = User::where('is_active', 1)
        ->select('id', 'name', 'email')
        ->get();
        return response()->json(['success' => true, 'data' => $guards]);
    }

    public function approveLeave(Request $request)
    {
        $getLeave = DB::table('guard_leave_requests')->where('id', $request->id)->first();
        if($getLeave->status == 'approved'){
            $getLeave = DB::table('guard_leave_requests')->where('id', $request->id)->delete();
            return response()->json(['success' => true, 'message' => 'Leave canceled successfully.']);
        }else{
            $approved = DB::table('guard_leave_requests')->where('id', $request->id)->update([
                'approved_by' => $request->admin_id,
                'status' => 'approved']);
            if ($approved) {
                return response()->json(['success' => true, 'message' => 'Leave approved successfully.']);
            }else{
                    return response()->json(['success' => false, 'message' => 'Fail to approved leave!']);
            }
        }
    }

    function guardOnLeave(Request $request)
    {
        $roster = DB::table('job_rosters')->where('id', $request->id)->first();
        $date = date('m/d/Y', strtotime($roster->start));
        $inserted = DB::table('guard_leave_requests')->insert([
            'guard_id' => $roster->guard_id,
            'start' => strtotime($date),
            'end' => strtotime($date.' 23:59:59'),
            'notes' => 'Staff on Leave From Roster',
            'date_added' => time(),
            'start_date' => $date,
            'end_date' => $date,
            'hours' => $roster->hours,
            'reason' => $request->reason,
            'days' => 1,
            'admin_id' => $request->admin_id,
            'roster_id' => $roster->id,
            'status' => 'approved',
            'type' => 'normal'
        ]); 
        if($inserted){
            $roster = DB::table('job_rosters')->where('id', $request->id)->update(['guard_id' => null]);
            return response()->json(['success' => true, 'message' => 'Leave approved successfully.']);
        }else{
            return response()->json(['success' => false, 'message' => 'Fail to approved leave!']);
        }
    }
    
    public function getGuardLeave($guard_id){
        $getGuardLeave = GuardLeave::where('guard_id', $guard_id)->get();
        return response()->json(['success' => true, 'data' => $getGuardLeave]);  
    }
}
