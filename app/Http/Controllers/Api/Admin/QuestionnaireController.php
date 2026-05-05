<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Guard;
use App\Models\Questionnaire;
use App\Models\InductionHistory;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use DB;

class QuestionnaireController extends Controller
{
    public function save(Request $request){
        $is_check = 0;
        if(!isset($request->id)){
            $questionnaire = new Questionnaire();
        }else{
            $questionnaire = Questionnaire::find($request->id);
            $is_check = 1;
        }
        $questionnaire->title = $request->title;
        $questionnaire->admin_id = $request->admin_id;
        $questionnaire->questionnaire = $request->questionnaire;
        $questionnaire->sub_heading = $request->sub_heading;

        $questionnaire->save();

        if($is_check == 0){
            return response()->json([
                'success' => true,
                'message' => 'Data has been saved successfully.',
            ]);
        }
        else
        {
            return response()->json([
                'success' => true,
                'message' => 'Data has been updated successfully',
            ]);
        }
    }

    public function assignQuestionnair(Request $request){
        foreach ($request->guards as $key => $guard) {
            if(DB::table('guard_questionnaire_details')->where(['guard_id' => $guard,'questionnaire_id' => $request->questionnair_id,])->first()){
                # ALREADY ASSIGNED
            }else{
                DB::table('guard_questionnaire_details')->insert([
                    'guard_id' => $guard,
                    'questionnaire_id' => $request->questionnair_id,
                    'marks' => 0,
                    'expiry_date' => null
                ]);
                $guard = User::where('id', $guard)->select('id', 'notification_token')->first();
                if($guard['notification_token']){
                    $notificaion['notification_token'] = $guard['notification_token'];
                    $notificaion['message'] = "Admin Assign you a induction.";
                    $notificaion['title'] = 'Induction';
                    $notificaion['page'] = 'staff-induction';
                    send_push_notification($notificaion);
                }
            }
        }

        $Inguards = User::whereIn('id', $request->guards)->get();

        foreach ($Inguards as $guard) {

            $ann = new  InductionHistory();
            $ann->guard_id = $guard['id'];
            $ann->state = $request->state;
            $ann->induction_id = $request->questionnair_id;
            $ann->save();

        }

        return response()->json(['success' => true, 'message' => 'Questionnaire Assign to selected guards']);
    }

    public function delete($id){
        $questionnaire = Questionnaire::find($id);
        if($questionnaire){
            # DELETE ASSIGNED QUESTIONNAIRE ALSO
            DB::table('guard_questionnaire_details')->where('questionnaire_id', $id)->delete();
            $questionnaire->delete();
            return response()->json([
                'success' => true,
                'message' => 'Data deleted',
            ]);
        }else{
            return response()->json([
                'success' => false,
                'message' => 'Data not found',
            ]);

        }
    }
    public function list()
    {
        $questionnaires = Questionnaire::with('Admin')->get();
        
        foreach ($questionnaires as $key => $question) {
            // Only decode if it's a string
            if (is_string($question->questionnaire)) {
                $questionnaires[$key]['questionnaire'] = json_decode($question->questionnaire, true);
            }
            
            if (is_string($question->sub_heading)) {
                $questionnaires[$key]['sub_heading'] = json_decode($question->sub_heading, true);
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => $questionnaires
        ]);
    }
}