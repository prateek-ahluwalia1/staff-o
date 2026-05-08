<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Guard;
use App\Models\GuardQuestionnaireDetails;
use App\Models\Questionnaire;
use App\Models\InductionHistory;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use DB;
use Dompdf\Dompdf;
use Dompdf\Options;

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
        foreach ($request->staff_ids as $key => $guard) {
            if(DB::table('guard_questionnaire_details')->where(['guard_id' => $guard,'questionnaire_id' => $request->questionnaire_id,])->first()){
                # ALREADY ASSIGNED
            }else{
                DB::table('guard_questionnaire_details')->insert([
                    'guard_id' => $guard,
                    'questionnaire_id' => $request->questionnaire_id,
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

        $Inguards = User::whereIn('id', $request->staff_ids)->get();

        foreach ($Inguards as $guard) {

            $ann = new  InductionHistory();
            $ann->guard_id = $guard['id'];
            $ann->state = $request->state;
            $ann->induction_id = $request->questionnaire_id;
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
    public function getQNA($guard_id)
    {
        $questions = Questionnaire::get();
        foreach ($questions as $key => $question) {
            $previousData = GuardQuestionnaireDetails::where(['guard_id'=> $guard_id, 'questionnaire_id'=>$question->id])->first();
            if($previousData){
                if($previousData->marks >= 80){
                    $question['status'] = 'passed';
                }else{
                    $question['status'] = 'failed';
                }
            }else{
                $question['status'] = 'pending';
            }

        }
        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }

    public function submitQNA(Request $request){
    
     $guardQNADetails = GuardQuestionnaireDetails::find($request->questionnaire_id);
     $guardQNADetails->marks = $request->marks;
     $guard = User::find($request->guard_id);
     $testDetails = Questionnaire::find($guardQNADetails->questionnaire_id);
     if($request->marks >= 80){
         $config_title = 'STAFFOO';
         $from = 'no-reply@thescouts.com.au';
         $headers  = 'MIME-Version: 1.0' . "\r\n";
         $subject = 'Congratulations! You have passed the test successfully.';
         $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
         $headers .= 'From: '.$from."\r\n".
         'Reply-To: '.$from."\r\n" .
         'X-Mailer: PHP/' . phpversion();
         $image1 = 'https://apis.staffoo.com.au/uploads/staffoocertificate.png';
         $pdf_message = '<html>
         <head>
         <meta name="viewport" content="width=device-width, initial-scale=1">
         <style>
           body {
      margin: 0;
      position: relative;
      height: 100vh;
      background-image: url('.$image1.');
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center center;
    }
             .main {
                    position: absolute;
                    top: 40%;
                    left: 49%;
                    transform: translate(-50%, -45%);
                    align-items: center;
                    padding: 20px;
                }

                .text-content {
                    text-align: center;
                }

                .certificate {
                    color: #4c5163;
                    font-size: 29px;
                    font-family: Trebuchet MS;
                    font-weight: bold;
                }

                .recipient {
                    color: #4c5163;
                    font-size: 14.2px;
                    margin-top: -18px;
                }

                .officer-info {
                    font-size: 22px;
                    font-family: Montserrat;
                    font-weight: bold;
                }

                .compliance-list {
                    font-size: 14.2px;
                    color: #4c5163;
                }

                .footer {
                    position: absolute;
                    width: 100%;
                    margin-bottom:30px;
                    }

                .footer p {
                    font-size: 13px;
                    color: #4c5163;
                    margin-left: -135%;
                    margin-bottom: -35px;
                    }

                .induction-date {
                    font-size: 14px;
                    color: #4c5163;
                    text-align: right;
                    margin-right: -35%;
                    margin-bottom: -56px;
                }

                /* Media Query for Mobile Devices */
                @media screen and (max-width: 768px) {
                    .certificate {
                    font-size: 20px;
                    }

                    .officer-info {
                    font-size: 16px;
                    }

                    .compliance-list {
                    font-size: 12px;
                    }

                    .footer {
                    flex-direction: column;
                    text-align: center;
                    }

                    .footer p {
                    font-size: 11px;
                    }

                    .induction-date {
                    margin-top: 10px;
                    }
                }
                </style>
         </head>
         <body>
           <div class="main"
             <div class="text-content">
               <p class="certificate">'.$testDetails->title.'</p>
               <p class="recipient">This certificate is awarded to:</p>
               <p class="officer-info">Officer Name: <br>'.$guard->name.'</p>
                <p class="compliance-list">
                  ';
                foreach ($testDetails->sub_heading as $item) {
                    $pdf_message .= '<p style="font-size: 11px;padding:0px;margin:0px">' . $item . '</p>';
                }
                $pdf_message .='
                </p>
                <div class="footer">
                    <p>Authorised for Service by <br> Staffoo Compliance Team</p>
                    <p class="induction-date"><b>Induction Date</b> <br> '.$guardQNADetails->created_at->format('l, F j, Y').'</p>
                </div>
             </div>
           </div>
           </div>
         </body>
         </html>';
      $dompdf = new Dompdf();
$options = new Options();
$options->set('isRemoteEnabled', true);
$dompdf->setOptions($options);
$dompdf->loadHtml($pdf_message);
$dompdf->render();
$pdfContent = $dompdf->output();

// Fix: Use Laravel's base_path or public_path
$destinationPath = public_path('uploads/'); // Creates path: /var/www/html/apis.staffoo.com.au/public/uploads/

// Create directory if it doesn't exist
if (!file_exists($destinationPath)) {
    mkdir($destinationPath, 0755, true);
}

$cleanedName = str_replace(' ', '_', $guard->name);
$fileName = $cleanedName . time() . '.pdf';
$pdfPath = $destinationPath . $fileName;

// Save the file
file_put_contents($pdfPath, $pdfContent);

// URL to access the file
$finalPdfPath = url('uploads/' . $fileName);
        //   $mail_message = '<html>
        //   <head>
        //   <style>
        //       .container {
        //       align-items: center;
        //       padding: 20px;
        //       }
        //       .text-content {
        //       text-align: center;
        //       }
        //       .certificate {
        //       color: #4C5163;
        //       font-size: 29px;
        //       font-family: Trebuchet MS;
        //       font-weight: bold;
        //       }
        //       .recipient {
        //       color: #4C5163;
        //       font-size: 14.2px;
        //       }
        //       .officer-info {
        //       font-size: 22px;
        //       font-family: Montserrat;
        //       font-weight: bold;
        //       }
        //       .compliance-list {
        //       font-size: 14.2px;
        //       color: #4C5163;
        //       }
        //       .footer {
        //       display: flex;
        //       justify-content: space-between;
        //       margin-top: 15%;
        //       margin-left: -65%;
        //       margin-right: -65%;
        //       }
        //       .footer p {
        //       font-size: 13px;
        //       color: #4C5163;
        //       }
        //       .induction-date {
        //       font-size: 14px;
        //       text-align: right;
        //       }
        //       /* Media Query for Mobile Devices */
        //       @media screen and (max-width: 768px) {
        //       .container {
        //           padding: 10px;
        //       }
        //       .certificate {
        //           font-size: 20px;      }
        //       .officer-info {
        //           font-size: 16px;
        //       }
        //       .compliance-list {
        //           font-size: 12px;      }
        //       .footer {
        //           flex-direction: column;
        //           text-align: center;
        //           margin-top: 10px;
        //       }
        //       .footer p {
        //           font-size: 11px;
        //       }
        //       .induction-date {
        //       }
        //       }
        //   </style>
        //   </head>
        //   <body style="margin: 0;display: flex;justify-content: center;align-items: center;background-position: center center;">
        //   <div style="align-items: center;position: absolute; bottom: 45%;left:25%;padding: 20px;">
        //       <div style="text-align:center">
        //       <p style="color: #4C5163;font-size: 29px;font-family: Trebuchet MS;font-weight: bold;">Congratulations! You have passed the test successfully.</p>
        //       <p class="recipient">Now you can download the certificate from this link: <a href="'.$finalPdfPath.'">Certificate</a></p>
        //       </div>
        //   </div>
        //   </body>
        //   </html>';

            $guardQNADetails->certificate_path = $finalPdfPath;
            $guardQNADetails->expiry_date = Carbon::now()->addMonth(6)->format('Y-m-d');


            $guardQNADetails->update();
     }

     return response()->json([
         'success' => true,
     ]);
 }

  function updateReadStatus(Request $request)
    {
        // Using Query Builder to check if record exists in induction_history
        $inductionHistory = DB::table('induction_history')
            ->where('guard_id', $request->guard_id)
            ->where('induction_id', $request->id)
            ->first();

        if ($inductionHistory) {
            // Update read_status in induction_history
            DB::table('induction_history')
                ->where('guard_id', $request->guard_id)
                ->where('induction_id', $request->id)
                ->update(['read_status' => 1]);

            return response()->json(['code' => 200, 'success' => true]);
        } else {
            return response()->json(['code' => 404, 'success' => false]);
        }
    }
}