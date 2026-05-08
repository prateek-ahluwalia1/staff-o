<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GeneralController extends Controller
{
    public function getAdmins()
    {
        $admins = User::where('user_type', 'admin')->get();

        return response()->json([
            'success' => true,
            'data' => $admins
        ], 200);
    }

     function getPH(Request $request)
    {
        $getPublicHolidays = DB::table('public_holidays')->where('state', $request->state)->get();
        if ($getPublicHolidays) {
            return response()->json(['success' => true, 'data' => $getPublicHolidays]);
        }else{
            return response()->json(['success' => false, 'message' => 'Fail to Get Public Holiday!']);
        }
    }

    function addPH(Request $request)
    {
        // $states_array = array(
        //     'Victoria' => 'vic',
        //     'New South Wales' => 'nsw',
        //     'Queensland' => 'qld',
        //     'Tasmania' => 'tas',
        //     'Western Australia' => 'wa',
        //     'South Australia' => 'sa',
        //     'ACT' => 'act'
        // );
        $state = $request->state;
        $data = array(
            'holiday_name' => $request->holiday_name,
            'date' => date('Ymd', strtotime($request->date)),
            'information' => $request->holiday_information,
            'state' => $state
        );

        $addPublicHolidays = DB::table('public_holidays')->insert($data);
        if ($addPublicHolidays) {
            return response()->json(['success' => true, 'message' => 'Public Holiday add successfully.']);
        }else{
            return response()->json(['success' => false, 'message' => 'Fail to add Public Holiday!']);
        }
    }

    function updatePH(Request $request)
    {
        $data = [
            'holiday_name' => $request->holiday_name,
            'date' => date('Ymd', strtotime($request->date)),
            'information' => $request->holiday_information,
        ];
        
        $updatedPublicHolidays = DB::table('public_holidays')
            ->where('id', $request->id)
            ->update($data);
        // if ($updatedPublicHolidays) {
            return response()->json(['success' => true, 'message' => 'Public Holiday update successfully.']);
        // }else{
        //     return response()->json(['success' => false, 'message' => 'Fail to update Public Holiday!']);
        // }
    }

    function deletePH(Request $request)
    {
    
        $deletePublicHolidays = DB::table('public_holidays')->where('id', $request->id)->delete();
        if ($deletePublicHolidays) {
            return response()->json(['success' => true, 'message' => 'Public Holiday delete successfully.']);
        }else{
            return response()->json(['success' => false, 'message' => 'Fail to delete Public Holiday!']);
        }
    }
}
