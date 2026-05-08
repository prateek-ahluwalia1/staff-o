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
}
