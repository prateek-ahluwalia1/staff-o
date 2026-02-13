<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePayrateRequest;
use App\Http\Resources\AllPayRateResource;
use App\Models\Payrate;
use App\Models\PayRatesNew;
use Illuminate\Http\Request;
use DB;
use Carbon\Carbon;


class PayRateController extends Controller
{
    public function store(Request $request)
    {
        $payrate = Payrate::where('user_id', $request->user_id)->where('level', $request->level)->where('title', $request->title)->where('position', $request->position)->first();
        if($payrate){
            return response()->json(['message' => "Hi,this Payrates already exist!" ,  'code' => 404, 'success' => false]);
        }else{
            $payrates = new Payrate();
            $payrates->title = $request->title;
            $payrates->user_id = $request->user_id;
            $payrates->position = $request->position;
            $payrates->level = $request->level;
            $payrates->state = $request->state;
            $payrates->def_metro_mon_to_fri_day_rate = ($request->def_metro_mon_to_fri_day_rate ? $request->def_metro_mon_to_fri_day_rate : 0);
            $payrates->def_metro_mon_to_fri_night_rate = ($request->def_metro_mon_to_fri_night_rate ? $request->def_metro_mon_to_fri_night_rate : 0);
            $payrates->def_metro_sat_day_rate = ($request->def_metro_sat_day_rate ? $request->def_metro_sat_day_rate : 0);
            $payrates->def_metro_sat_night_rate = ($request->def_metro_sat_night_rate ? $request->def_metro_sat_night_rate : 0);
            $payrates->def_metro_sun_day_rate = ($request->def_metro_sun_day_rate ? $request->def_metro_sun_day_rate : 0);
            $payrates->def_metro_sun_night_rate = ($request->def_metro_sun_night_rate ? $request->def_metro_sun_night_rate : 0);
            $payrates->def_metro_pub_holi_day_rate = ($request->def_metro_pub_holi_day_rate ? $request->def_metro_pub_holi_day_rate : 0);
            $payrates->def_metro_pub_holi_night_rate = ($request->def_metro_pub_holi_night_rate ? $request->def_metro_pub_holi_night_rate : 0);
            $payrates->def_reg_mon_to_fri_day_rate = ($request->def_reg_mon_to_fri_day_rate ? $request->def_reg_mon_to_fri_day_rate : 0);
            $payrates->def_reg_mon_to_fri_night_rate = ($request->def_reg_mon_to_fri_night_rate ? $request->def_reg_mon_to_fri_night_rate : 0);
            $payrates->def_reg_sat_day_rate = ($request->def_reg_sat_day_rate ? $request->def_reg_sat_day_rate : 0);
            $payrates->def_reg_sat_night_rate = ($request->def_reg_sat_night_rate ? $request->def_reg_sat_night_rate : 0);
            $payrates->def_reg_sun_day_rate = ($request->def_reg_sun_day_rate ? $request->def_reg_sun_day_rate : 0);
            $payrates->def_reg_sun_night_rate = ($request->def_reg_sun_night_rate ? $request->def_reg_sun_night_rate : 0);
            $payrates->def_reg_pub_holi_day_rate = ($request->def_reg_pub_holi_day_rate ? $request->def_reg_pub_holi_day_rate : 0);
            $payrates->def_reg_pub_holi_night_rate = ($request->def_reg_pub_holi_night_rate ? $request->def_reg_pub_holi_night_rate : 0);
            $payrates->eba_metro_mon_to_fri_day_rate = ($request->eba_metro_mon_to_fri_day_rate ? $request->eba_metro_mon_to_fri_day_rate : 0);
            $payrates->eba_metro_mon_to_fri_night_rate = ($request->eba_metro_mon_to_fri_night_rate ? $request->eba_metro_mon_to_fri_night_rate : 0);
            $payrates->eba_metro_sat_day_rate = ($request->eba_metro_sat_day_rate ? $request->eba_metro_sat_day_rate : 0);
            $payrates->eba_metro_sat_night_rate = ($request->eba_metro_sat_night_rate ? $request->eba_metro_sat_night_rate : 0);
            $payrates->eba_metro_sun_day_rate = ($request->eba_metro_sun_day_rate ? $request->eba_metro_sun_day_rate : 0);
            $payrates->eba_metro_sun_night_rate = ($request->eba_metro_sun_night_rate ? $request->eba_metro_sun_night_rate : 0);
            $payrates->eba_metro_pub_holi_day_rate = ($request->eba_metro_pub_holi_day_rate ? $request->eba_metro_pub_holi_day_rate : 0);
            $payrates->eba_metro_pub_holi_night_rate = ($request->eba_metro_pub_holi_night_rate ? $request->eba_metro_pub_holi_night_rate : 0);
            $payrates->eba_reg_mon_to_fri_day_rate = ($request->eba_reg_mon_to_fri_day_rate ? $request->eba_reg_mon_to_fri_day_rate : 0);
            $payrates->eba_reg_mon_to_fri_night_rate = ($request->eba_reg_mon_to_fri_night_rate ? $request->eba_reg_mon_to_fri_night_rate : 0);
            $payrates->eba_reg_sat_day_rate = ($request->eba_reg_sat_day_rate ? $request->eba_reg_sat_day_rate : 0);
            $payrates->eba_reg_sat_night_rate = ($request->eba_reg_sat_night_rate ? $request->eba_reg_sat_night_rate : 0);
            $payrates->eba_reg_sun_day_rate = ($request->eba_reg_sun_day_rate ? $request->eba_reg_sun_day_rate : 0);
            $payrates->eba_reg_sun_night_rate = ($request->eba_reg_sun_night_rate ? $request->eba_reg_sun_night_rate : 0);
            $payrates->eba_reg_pub_holi_day_rate = ($request->eba_reg_pub_holi_day_rate ? $request->eba_reg_pub_holi_day_rate : 0);
            $payrates->eba_reg_pub_holi_night_rate = ($request->eba_reg_pub_holi_night_rate ? $request->eba_reg_pub_holi_night_rate : 0);

            $payrates->ot_base_rate = ($request->ot_base_rate ? $request->ot_base_rate : 0);
            $payrates->effective_from = $request->effective_from;
            $payrates->save();

            return response()->json(['message' => "Payrates Added", 'code' => 200, 'success' => true]);
        }
    }

    public function getAllPayrate()
    {
        $payrates = Payrate::where('status', 'active')->orderBy('title', 'asc')->get();
        $prt = AllPayRateResource::collection($payrates);
        return response()->json(['success' => true, 'data' => $prt]);  
    }

    public function getPayrate(Request $request)
    {
        $payrates = Payrate::where('status', 'active')->where('id', $request->id)->first();
        $prt = new AllPayRateResource($payrates);
        return response()->json(['success' => true, 'data' => $prt]);  
    }

    public function getAllArchivePayrate()
    {
        $payrates = Payrate::where('status', 'archive')->orderBy('title', 'asc')->get();
        $prt = AllPayRateResource::collection($payrates);
        return response()->json(['success' => true, 'data' => $prt]);  
    }

    public function removePayrate(Request $request)
    {
        $payrate = Payrate::where('id', $request->payrate_id)->first();
        $old_data = $payrate;
        if($payrate){
            $payrate->status = 'archive';
            $payrate->save();
            
            return response()->json(['message' => "Payrate removed" ,  'code' => 200, 'success' => true],200); 
        }else{
            return response()->json(['message' => "Payrates not found!" ,  'code' => 404, 'success' => false],404); 
        }
    }

    public function update(Request $request)
    {
        $is_check =0;
        // $payrate = Payrate::where('customer_id', $request->customer_id)->where('level', $request->level)->first();
        $payrate = Payrate::find($request->id);
        $old_data = $payrate;
        if(!empty($payrate)) {
            Payrate::where('id', $request->id)->update(['status' => 'archive']);
        }
        $payrates = new Payrate();
        $is_check =1;
        $payrates->title = $request->title;
        $payrates->user_id = $request->user_id;
        $payrates->position = $request->position;
        $payrates->level = $request->level;
        $payrates->state = $request->state;
        $payrates->def_metro_mon_to_fri_day_rate = ($request->def_metro_mon_to_fri_day_rate ? $request->def_metro_mon_to_fri_day_rate : 0);
        $payrates->def_metro_mon_to_fri_night_rate = ($request->def_metro_mon_to_fri_night_rate ? $request->def_metro_mon_to_fri_night_rate: 0);
        $payrates->def_metro_sat_day_rate = ($request->def_metro_sat_day_rate ? $request->def_metro_sat_day_rate : 0);
        $payrates->def_metro_sat_night_rate = ($request->def_metro_sat_night_rate ? $request->def_metro_sat_night_rate : 0);
        $payrates->def_metro_sun_day_rate = ($request->def_metro_sun_day_rate ? $request->def_metro_sun_day_rate : 0);
        $payrates->def_metro_sun_night_rate = ($request->def_metro_sun_night_rate ? $request->def_metro_sun_night_rate : 0);
        $payrates->def_metro_pub_holi_day_rate = ($request->def_metro_pub_holi_day_rate ? $request->def_metro_pub_holi_day_rate : 0);
        $payrates->def_metro_pub_holi_night_rate = ($request->def_metro_pub_holi_night_rate ? $request->def_metro_pub_holi_night_rate : 0);
        $payrates->def_reg_mon_to_fri_day_rate = ($request->def_reg_mon_to_fri_day_rate ? $request->def_reg_mon_to_fri_day_rate : 0);
        $payrates->def_reg_mon_to_fri_night_rate = ($request->def_reg_mon_to_fri_night_rate ? $request->def_reg_mon_to_fri_night_rate : 0);
        $payrates->def_reg_sat_day_rate = ($request->def_reg_sat_day_rate ? $request->def_reg_sat_day_rate : 0);
        $payrates->def_reg_sat_night_rate = ($request->def_reg_sat_night_rate ? $request->def_reg_sat_night_rate : 0);
        $payrates->def_reg_sun_day_rate = ($request->def_reg_sun_day_rate ? $request->def_reg_sun_day_rate : 0);
        $payrates->def_reg_sun_night_rate = ($request->def_reg_sun_night_rate ? $request->def_reg_sun_night_rate : 0);
        $payrates->def_reg_pub_holi_day_rate = ($request->def_reg_pub_holi_day_rate ? $request->def_reg_pub_holi_day_rate : 0);
        $payrates->def_reg_pub_holi_night_rate = ($request->def_reg_pub_holi_night_rate ? $request->def_reg_pub_holi_night_rate : 0);
        $payrates->eba_metro_mon_to_fri_day_rate = ($request->eba_metro_mon_to_fri_day_rate ? $request->eba_metro_mon_to_fri_day_rate : 0);
        $payrates->eba_metro_mon_to_fri_night_rate = ($request->eba_metro_mon_to_fri_night_rate ? $request->eba_metro_mon_to_fri_night_rate: 0);
        $payrates->eba_metro_sat_day_rate = ($request->eba_metro_sat_day_rate ? $request->eba_metro_sat_day_rate : 0);
        $payrates->eba_metro_sat_night_rate = ($request->eba_metro_sat_night_rate ? $request->eba_metro_sat_night_rate : 0);
        $payrates->eba_metro_sun_day_rate = ($request->eba_metro_sun_day_rate ? $request->eba_metro_sun_day_rate : 0);
        $payrates->eba_metro_sun_night_rate = ($request->eba_metro_sun_night_rate ? $request->eba_metro_sun_night_rate : 0);
        $payrates->eba_metro_pub_holi_day_rate = ($request->eba_metro_pub_holi_day_rate ? $request->eba_metro_pub_holi_day_rate : 0);
        $payrates->eba_metro_pub_holi_night_rate = ($request->eba_metro_pub_holi_night_rate ? $request->eba_metro_pub_holi_night_rate : 0);
        $payrates->eba_reg_mon_to_fri_day_rate = ($request->eba_reg_mon_to_fri_day_rate ? $request->eba_reg_mon_to_fri_day_rate : 0);
        $payrates->eba_reg_mon_to_fri_night_rate = ($request->eba_reg_mon_to_fri_night_rate ? $request->eba_reg_mon_to_fri_night_rate : 0);
        $payrates->eba_reg_sat_day_rate = ($request->eba_reg_sat_day_rate ? $request->eba_reg_sat_day_rate : 0);
        $payrates->eba_reg_sat_night_rate = ($request->eba_reg_sat_night_rate ? $request->eba_reg_sat_night_rate : 0);
        $payrates->eba_reg_sun_day_rate = ($request->eba_reg_sun_day_rate ? $request->eba_reg_sun_day_rate : 0);
        $payrates->eba_reg_sun_night_rate = ($request->eba_reg_sun_night_rate ? $request->eba_reg_sun_night_rate : 0);
        $payrates->eba_reg_pub_holi_day_rate = ($request->eba_reg_pub_holi_day_rate ? $request->eba_reg_pub_holi_day_rate : 0);
        $payrates->eba_reg_pub_holi_night_rate = ($request->eba_reg_pub_holi_night_rate ? $request->eba_reg_pub_holi_night_rate : 0);
         
        $payrates->ot_base_rate = ($request->ot_base_rate ? $request->ot_base_rate : 0);
        $payrates->effective_from = $request->effective_from;
        $payrates->save();

        if($is_check == 1){
            return response()->json(['message' => "Pay rate Updated" ,  'code' => 200, 'success' => true]);
            }else{
                return response()->json(['message' => "Pay rate Updated" ,  'code' => 200, 'success' => true]);
            }
    }
}
