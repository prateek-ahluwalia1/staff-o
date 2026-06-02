<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePayrateRequest;
use App\Http\Resources\ChargeRateResource;
use App\Http\Resources\getSpecificChargeRateWithLevelResource;
use App\Models\ChargeRate;
use App\Models\Customer;
use App\Models\Site;
use Carbon\Carbon;
use Illuminate\Http\Request;
use DB;
class ChargeRateController extends Controller
{
    public function store(Request $request)
    {
        $charge_rate = ChargeRate::where('user_id', $request->user_id)->where('level', $request->level)->where('title', $request->title)->where('position', $request->position)->first();
        if($charge_rate){
            return response()->json(['message' => "Hi,this charge rate already exist!" ,  'code' => 404, 'success' => false]);
        }else{
        $charge_rate = new ChargeRate();
        $charge_rate->title = $request->title;
        $charge_rate->user_id = $request->user_id;
        $charge_rate->position = $request->position;
        $charge_rate->level = $request->level;
        $charge_rate->state = $request->state;
        $charge_rate->def_metro_mon_to_fri_day_rate = ($request->def_metro_mon_to_fri_day_rate ? $request->def_metro_mon_to_fri_day_rate : 0);
        $charge_rate->def_metro_mon_to_fri_night_rate = ($request->def_metro_mon_to_fri_night_rate ? $request->def_metro_mon_to_fri_night_rate: 0);
        $charge_rate->def_metro_sat_day_rate = ($request->def_metro_sat_day_rate ? $request->def_metro_sat_day_rate : 0);
        $charge_rate->def_metro_sat_night_rate = ($request->def_metro_sat_night_rate ? $request->def_metro_sat_night_rate : 0);
        $charge_rate->def_metro_sun_day_rate = ($request->def_metro_sun_day_rate ? $request->def_metro_sun_day_rate : 0);
        $charge_rate->def_metro_sun_night_rate = ($request->def_metro_sun_night_rate ? $request->def_metro_sun_night_rate : 0);
        $charge_rate->def_metro_pub_holi_day_rate = ($request->def_metro_pub_holi_day_rate ? $request->def_metro_pub_holi_day_rate : 0);
        $charge_rate->def_metro_pub_holi_night_rate = ($request->def_metro_pub_holi_night_rate ? $request->def_metro_pub_holi_night_rate : 0);
        $charge_rate->def_reg_mon_to_fri_day_rate = ($request->def_reg_mon_to_fri_day_rate ? $request->def_reg_mon_to_fri_day_rate : 0);
        $charge_rate->def_reg_mon_to_fri_night_rate = ($request->def_reg_mon_to_fri_night_rate ? $request->def_reg_mon_to_fri_night_rate : 0);
        $charge_rate->def_reg_sat_day_rate = ($request->def_reg_sat_day_rate ? $request->def_reg_sat_day_rate : 0);
        $charge_rate->def_reg_sat_night_rate = ($request->def_reg_sat_night_rate ? $request->def_reg_sat_night_rate : 0);
        $charge_rate->def_reg_sun_day_rate = ($request->def_reg_sun_day_rate ? $request->def_reg_sun_day_rate : 0);
        $charge_rate->def_reg_sun_night_rate = ($request->def_reg_sun_night_rate ? $request->def_reg_sun_night_rate : 0);
        $charge_rate->def_reg_pub_holi_day_rate = ($request->def_reg_pub_holi_day_rate ? $request->def_reg_pub_holi_day_rate : 0);
        $charge_rate->def_reg_pub_holi_night_rate = ($request->def_reg_pub_holi_night_rate ? $request->def_reg_pub_holi_night_rate : 0);
        $charge_rate->eba_metro_mon_to_fri_day_rate = ($request->eba_metro_mon_to_fri_day_rate ? $request->eba_metro_mon_to_fri_day_rate : 0);
        $charge_rate->eba_metro_mon_to_fri_night_rate = ($request->eba_metro_mon_to_fri_night_rate ? $request->eba_metro_mon_to_fri_night_rate: 0);
        $charge_rate->eba_metro_sat_day_rate = ($request->eba_metro_sat_day_rate ? $request->eba_metro_sat_day_rate : 0);
        $charge_rate->eba_metro_sat_night_rate = ($request->eba_metro_sat_night_rate ? $request->eba_metro_sat_night_rate : 0);
        $charge_rate->eba_metro_sun_day_rate = ($request->eba_metro_sun_day_rate ? $request->eba_metro_sun_day_rate : 0);
        $charge_rate->eba_metro_sun_night_rate = ($request->eba_metro_sun_night_rate ? $request->eba_metro_sun_night_rate : 0);
        $charge_rate->eba_metro_pub_holi_day_rate = ($request->eba_metro_pub_holi_day_rate ? $request->eba_metro_pub_holi_day_rate : 0);
        $charge_rate->eba_metro_pub_holi_night_rate = ($request->eba_metro_pub_holi_night_rate ? $request->eba_metro_pub_holi_night_rate : 0);
        $charge_rate->eba_reg_mon_to_fri_day_rate = ($request->eba_reg_mon_to_fri_day_rate ? $request->eba_reg_mon_to_fri_day_rate : 0);
        $charge_rate->eba_reg_mon_to_fri_night_rate = ($request->eba_reg_mon_to_fri_night_rate ? $request->eba_reg_mon_to_fri_night_rate : 0);
        $charge_rate->eba_reg_sat_day_rate = ($request->eba_reg_sat_day_rate ? $request->eba_reg_sat_day_rate : 0);
        $charge_rate->eba_reg_sat_night_rate = ($request->eba_reg_sat_night_rate ? $request->eba_reg_sat_night_rate : 0);
        $charge_rate->eba_reg_sun_day_rate = ($request->eba_reg_sun_day_rate ? $request->eba_reg_sun_day_rate : 0);
        $charge_rate->eba_reg_sun_night_rate = ($request->eba_reg_sun_night_rate ? $request->eba_reg_sun_night_rate : 0);
        $charge_rate->eba_reg_pub_holi_day_rate = ($request->eba_reg_pub_holi_day_rate ? $request->eba_reg_pub_holi_day_rate : 0);
        $charge_rate->eba_reg_pub_holi_night_rate = ($request->eba_reg_pub_holi_night_rate ? $request->eba_reg_pub_holi_night_rate : 0);
        $charge_rate->ot_base_rate = ($request->ot_base_rate ? $request->ot_base_rate : 0);
        $charge_rate->effective_from = $request->effective_from;

        $charge_rate->save();

        return response()->json(['message' => "Charge rate added" ,  'code' => 200, 'success' => true]);
        } 
    }

    public function getChargeRate()
    {
        $charge_rate = ChargeRate::where('status', 'active')->orderBy('title', 'asc')->get();

        return response()->json(['success' => true, 'data' => $charge_rate]);  
    }

    public function getAllChargeRate()
    {
        $charge_rate = ChargeRate::where('status', 'active')
            ->orderBy('title', 'asc')
            ->get();

        return response()->json(['success' => true, 'data' => $charge_rate]);  
    }

     public function getAllArchiveChargeRate()
    {
        $charge_rate = ChargeRate::where('status', 'archive')->orderBy('title', 'asc')->get();
        $chrt = ChargeRateResource::collection($charge_rate);
        return response()->json(['success' => true, 'data' => $chrt]);  
    }

    public function removeChargeRate(Request $request)
    {
        $charge_rate = ChargeRate::where('id', $request->chargerate_id)->first();
        if($charge_rate){
            $charge_rate->status = 'archive';
            $charge_rate->save();
            return response()->json(['message' => "Charge Rate removed" ,  'code' => 200, 'success' => true],200); 
        }else{
            return response()->json(['message' => "Charge Rate not found!" ,  'code' => 404, 'success' => false],200); 
        }
    }

    public function update(Request $request)
    {
        $is_check =0;
        $charge_rate = ChargeRate::where('id', $request->id)->first();
        // if(!empty($charge_rate)){
        // $charge_rate = ChargeRate::where('user_id', 14)->where('level', $request->level)->update(['status' => 'archive']);
        // }
        
        // $charge_rate = new ChargeRate();
        // $is_check =1;
        $charge_rate->title = $request->title;
        // $charge_rate->user_id = $request->user_id;
        $charge_rate->position = $request->position;
        $charge_rate->level = $request->level;
        $charge_rate->state = $request->state;
        $charge_rate->def_metro_mon_to_fri_day_rate = ($request->def_metro_mon_to_fri_day_rate ? $request->def_metro_mon_to_fri_day_rate : 0);
        $charge_rate->def_metro_mon_to_fri_night_rate = ($request->def_metro_mon_to_fri_night_rate ? $request->def_metro_mon_to_fri_night_rate: 0);
        $charge_rate->def_metro_sat_day_rate = ($request->def_metro_sat_day_rate ? $request->def_metro_sat_day_rate : 0);
        $charge_rate->def_metro_sat_night_rate = ($request->def_metro_sat_night_rate ? $request->def_metro_sat_night_rate : 0);
        $charge_rate->def_metro_sun_day_rate = ($request->def_metro_sun_day_rate ? $request->def_metro_sun_day_rate : 0);
        $charge_rate->def_metro_sun_night_rate = ($request->def_metro_sun_night_rate ? $request->def_metro_sun_night_rate : 0);
        $charge_rate->def_metro_pub_holi_day_rate = ($request->def_metro_pub_holi_day_rate ? $request->def_metro_pub_holi_day_rate : 0);
        $charge_rate->def_metro_pub_holi_night_rate = ($request->def_metro_pub_holi_night_rate ? $request->def_metro_pub_holi_night_rate : 0);
        $charge_rate->def_reg_mon_to_fri_day_rate = ($request->def_reg_mon_to_fri_day_rate ? $request->def_reg_mon_to_fri_day_rate : 0);
        $charge_rate->def_reg_mon_to_fri_night_rate = ($request->def_reg_mon_to_fri_night_rate ? $request->def_reg_mon_to_fri_night_rate : 0);
        $charge_rate->def_reg_sat_day_rate = ($request->def_reg_sat_day_rate ? $request->def_reg_sat_day_rate : 0);
        $charge_rate->def_reg_sat_night_rate = ($request->def_reg_sat_night_rate ? $request->def_reg_sat_night_rate : 0);
        $charge_rate->def_reg_sun_day_rate = ($request->def_reg_sun_day_rate ? $request->def_reg_sun_day_rate : 0);
        $charge_rate->def_reg_sun_night_rate = ($request->def_reg_sun_night_rate ? $request->def_reg_sun_night_rate : 0);
        $charge_rate->def_reg_pub_holi_day_rate = ($request->def_reg_pub_holi_day_rate ? $request->def_reg_pub_holi_day_rate : 0);
        $charge_rate->def_reg_pub_holi_night_rate = ($request->def_reg_pub_holi_night_rate ? $request->def_reg_pub_holi_night_rate : 0);
        $charge_rate->eba_metro_mon_to_fri_day_rate = ($request->eba_metro_mon_to_fri_day_rate ? $request->eba_metro_mon_to_fri_day_rate : 0);
        $charge_rate->eba_metro_mon_to_fri_night_rate = ($request->eba_metro_mon_to_fri_night_rate ? $request->eba_metro_mon_to_fri_night_rate: 0);
        $charge_rate->eba_metro_sat_day_rate = ($request->eba_metro_sat_day_rate ? $request->eba_metro_sat_day_rate : 0);
        $charge_rate->eba_metro_sat_night_rate = ($request->eba_metro_sat_night_rate ? $request->eba_metro_sat_night_rate : 0);
        $charge_rate->eba_metro_sun_day_rate = ($request->eba_metro_sun_day_rate ? $request->eba_metro_sun_day_rate : 0);
        $charge_rate->eba_metro_sun_night_rate = ($request->eba_metro_sun_night_rate ? $request->eba_metro_sun_night_rate : 0);
        $charge_rate->eba_metro_pub_holi_day_rate = ($request->eba_metro_pub_holi_day_rate ? $request->eba_metro_pub_holi_day_rate : 0);
        $charge_rate->eba_metro_pub_holi_night_rate = ($request->eba_metro_pub_holi_night_rate ? $request->eba_metro_pub_holi_night_rate : 0);
        $charge_rate->eba_reg_mon_to_fri_day_rate = ($request->eba_reg_mon_to_fri_day_rate ? $request->eba_reg_mon_to_fri_day_rate : 0);
        $charge_rate->eba_reg_mon_to_fri_night_rate = ($request->eba_reg_mon_to_fri_night_rate ? $request->eba_reg_mon_to_fri_night_rate : 0);
        $charge_rate->eba_reg_sat_day_rate = ($request->eba_reg_sat_day_rate ? $request->eba_reg_sat_day_rate : 0);
        $charge_rate->eba_reg_sat_night_rate = ($request->eba_reg_sat_night_rate ? $request->eba_reg_sat_night_rate : 0);
        $charge_rate->eba_reg_sun_day_rate = ($request->eba_reg_sun_day_rate ? $request->eba_reg_sun_day_rate : 0);
        $charge_rate->eba_reg_sun_night_rate = ($request->eba_reg_sun_night_rate ? $request->eba_reg_sun_night_rate : 0);
        $charge_rate->eba_reg_pub_holi_day_rate = ($request->eba_reg_pub_holi_day_rate ? $request->eba_reg_pub_holi_day_rate : 0);
        $charge_rate->eba_reg_pub_holi_night_rate = ($request->eba_reg_pub_holi_night_rate ? $request->eba_reg_pub_holi_night_rate : 0);
        $charge_rate->ot_base_rate = ($request->ot_base_rate ? $request->ot_base_rate : 0);
        $charge_rate->effective_from = $request->effective_from;
        
        $charge_rate->save();
        if($is_check == 1){
        return response()->json(['message' => "Charge rate added" ,  'code' => 200, 'success' => true]);
        }else{
            return response()->json(['message' => "Charge rate updated" ,  'code' => 200, 'success' => true]);
        }
    }  
    
}
