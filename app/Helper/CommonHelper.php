<?php

use App\Models\Site;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;
use App\Services\YeastarService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

function returnImgPath($type, $image)
{
        if(!empty($image)){
            return url($type).'/'. $image;
        }else{
            return null;
        }     
}

function dateFormat($date)
{
    $date1 = str_replace('-', '/', $date);
    $usfromat = date("D , d/m", strtotime(($date1)));
    return $usfromat; 
}


function usaToAus($date)
{
    if ($date == '0000-00-00' || empty($date)) {
        return null;
    }
    
    $date1 = str_replace('-', '/', $date);
    $usformat = date("d-m-Y", strtotime($date1));
    
    return $usformat;
}

function fileUpload($file, $folder)
{
    $rnd = Str::random(16);
    $public_path1 = public_path();
    $path = $public_path1.'/'. $folder;
    $name = $rnd.'_'.$file->getClientOriginalName();
    $file->move($path, $name);
    return $name;
}

function formatPhone($phone)
{
    $phone = preg_replace('/\s+/', '', $phone);

    if (strpos($phone, '+') === 0) {
        return $phone;
    }

    // Pakistan format
    if (substr($phone, 0, 1) == '0') {
        return '92' . substr($phone, 1);
    }

    return $phone;
}

function dbFormate($formate)
{
    $formate = str_replace('-', '/', $formate);
    $usfromat = date("Y-m-d", strtotime(($formate)));
    return $usfromat;
}

function returnAction($action)
{
    $str = str_replace('_', ' ', $action);
    $str = ucwords($str);
    return $str; 
}

 function dbFormateDateTime($formate)
{
    $formate = str_replace('-', '/', $formate);
    $usfromat = date("Y-m-d H:i", strtotime(($formate)));
    return $usfromat;
}

function calCulateGuardWeekHours($start, $end)
{
    $datetime1 = new DateTime($start);
    $datetime2 = new DateTime($end);
    $interval = $datetime1->diff($datetime2);

    $minutes = $interval->format('%i');
    $hours = $interval->format('%h');

    $minutesDecimal = $minutes / 60;
    $totalHours = $hours + $minutesDecimal;
    $totalHours = number_format($totalHours, 2); // Optional rounding
    // Use $totalHours as needed
    return $totalHours;
}

function send_push_notification($data){

        $onesignalRestApiKey = env('ONESIGNAL_REST_API_KEY', '');
        $content = array(
          "en" => $data['message']
          );
    
        $heading = array(
          "en" => $data['title']
          );
    
        $fields = array(
          'app_id' => '79041c59-5506-4e56-9de4-8a6619f85e1d',
          'include_player_ids' => array($data['notification_token']),
                  'data' => array(
                  'page' => $data['page'],
                  'roster' => isset($data['data']) ? $data['data']: null ,

                  ),
          'contents' => $content,
          'headings' => $heading
        );
         //dd($fields);
    
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json; charset=utf-8',
            'Authorization: key ' . $onesignalRestApiKey
        ));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
    
        $result = curl_exec($ch);
        //dd($result);
        if ($result === FALSE) {
          die('FCM Send Error: ' . curl_error($ch));
        }
        curl_close($ch);
        return $result;

      }
      function getDatesFromRange($date_time_from, $date_time_to)
    {
        //dd($date_time_to);

        $start = Carbon::createFromFormat('Y-m-d', substr($date_time_from, 0, 10));
        $end = Carbon::createFromFormat('Y-m-d', substr($date_time_to, 0, 10));
        $dates = [];
        while ($start->lte($end)) {
            $dates[] = $start->copy()->format('Y-m-d');
            $start->addDay();
        }
        return $dates;
    }
    
      function getSiteName($id)
    {
        $site = Site::where('id', $id)->first();
        if(!empty($site)){
            return $site->site_name;
        }else{
            return 'N/A';
        }
        
    }

     function usaToAusDateTime($date)
    {
        $date1 = str_replace('-', '/', $date);
        $usfromat = date("d-m-Y H:i", strtotime(($date1)));
        return $usfromat;
    }

     function getUserName($id)
    {
        $user = User::where('id', $id)->first();
        if($user){
            return $user->name;
        }else{
            return 'N/A';
        }
        
    }

     function timeStampToAus($timestamp)
    {
        $dateTime = new DateTime("@$timestamp");
        $dateTime->setTimezone(new DateTimeZone('Australia/Sydney'));
        $australianFormat = $dateTime->format('d-m-Y H:i');
        return $australianFormat;
    }

    function returnImgPathCheck($folder, $filename) {
    $baseUrl = 'https://apis.staffoo.com.au/';
    return $baseUrl . $folder . '/' . $filename;
    }

    function getShiftHours($start, $end, $siteID = null, $continuation = false, $public_holiday = null, $ph_duration = null) 
    {
        $actual_start = $start;
        $actual_end = $end;
        $day_start = Carbon::parse($start)->format('l');
        $day_end = Carbon::parse($end)->format('l');

        $start = strtotime($start);
        $end = strtotime($end);

        $diff = $end - $start;
        $hours = round($diff / ( 60 * 60 ), 2);
        $hoursCond = round($diff / ( 60 * 60 ), 2);

        $morning_start = 6;
        $morning_end = 18;

        $night_start = 18;
        $night_end = 6;

        $shift_start = convert_into_fraction($start);
        $shift_end = convert_into_fraction($end);
        // return [$shift_start,$shift_end];
        if ($shift_end < $shift_start) {
            $diff_new = $shift_end + 24 - $shift_start;
            if ($diff > $diff_new) {
                $hours = $diff_new;
            }   
        }
        // saturday calcultions
        $saturday_start = 0;
        $saturday_end = 0;
        $total_saturday_hours = 0;

        $sunday_start = 0;
        $sunday_end = 0;
        $total_sunday_hours = 0;

        $total_ph_hours = 0;
        $ph_start = 0;
        $ph_end = 0;

        // publid holiday calculation start here
        $start_in_public_holiday = false;
        $end_in_public_holiday = false;
        if ($siteID != null) {
            $site_state = DB::table('sites')->where('id', $siteID)->select('state')->first();

            $states_array = array(
                'Victoria' => 'vic',
                'New South Wales' => 'nsw',
                'NSW' => 'nsw',
                'Queensland' => 'qld',
                'Tasmania' => 'tas',
                'Western Australia' => 'wa',
                'South Australia' => 'sa',
                'ACT' => 'act'
            );

            if ($site_state && !empty($site_state->state) && isset($states_array[$site_state->state])) {
                $state = $states_array[$site_state->state];
            } else {
                $state = 'vic';
            }
        } else {
            $state = 'vic';
        }  
        $public_holiday_start = DB::table('public_holidays')->where('date', date('Ymd', $start))->whereIn('state', [$state, 'all'])->where('approved_status', 1)->first();
        if ($public_holiday != null && $public_holiday == 1) {
            $start_in_public_holiday = true;
        }elseif (!empty($public_holiday_start)) {
            $start_in_public_holiday = true;
        }

        $public_holiday_end = DB::table('public_holidays')->where('date', date('Ymd', $start))->whereIn('state', [$state, 'all'])->where('approved_status', 1)->first();
        if (!empty($public_holiday_end)) {
            $end_in_public_holiday = true;
        }elseif($public_holiday != null && $public_holiday == 1 && $ph_duration == 1){
            $end_in_public_holiday = true;
        }

        if ($start_in_public_holiday && $end_in_public_holiday) {
            $total_ph_hours = $hours;
            $hours = 0;
            $ph_start = $shift_start;
            $ph_end = $shift_end;
            $shift_start = 0;
            $shift_end = 0;
            // echo 'whole day in PH - ';

        }elseif($start_in_public_holiday && !$end_in_public_holiday)
        {
            $ph_end = strtotime(date('m/d/Y 23:59:59', $start));
            $diff = $ph_end - $start;
            $total_ph_hours = round($diff / ( 60 * 60 ), 2);
            $ph_start = convert_into_fraction($start);
            $ph_end = convert_into_fraction($ph_end);
            $start = $public_holiday_start ? strtotime($public_holiday_start->date) + (60*60*24) : $start + (60*60*24) ;
            $day_start = Carbon::parse(date('m/d/Y', $end))->format('l');
            $hours = $hours - $total_ph_hours;
            $shift_start = 0;
            // echo 'Start in PH - '.$day_start;
        }elseif(!$start_in_public_holiday && $end_in_public_holiday){

            $ph_start_ts = strtotime(date('m/d/Y 00:00:00', $end));
            $diff = $end - $ph_start_ts;
            $total_ph_hours = round($diff / 3600, 2);
            $ph_start = convert_into_fraction($ph_start_ts);
            $ph_end   = convert_into_fraction($end);
            $end = $ph_start_ts;

            $shift_end = convert_into_fraction($end);
            $hours = $hours - $total_ph_hours;
        }
        
    // if ($total_ph_hours == 0) {

        if ($day_start == 'Saturday' && $day_end == 'Saturday') {
            $total_saturday_hours = $hours;
            $saturday_start = $shift_start;
            $saturday_end = $shift_end;
            $shift_start = 0;
            $shift_end = 0;
            $hours = 0;
        }elseif($day_start == 'Saturday' && $day_end != 'Saturday')
        {
            $sat_end = strtotime(date('m/d/Y 23:59:59', $start));
            $diff = $sat_end - $start;
            $total_saturday_hours = round($diff / ( 60 * 60 ), 2);
            $saturday_start = $shift_start;
            $saturday_end = convert_into_fraction($sat_end);
            $shift_start = 0;
            $shift_end = 0;
            $hours = $hours - $total_saturday_hours;
        }elseif($day_start != 'Saturday' && $day_end == 'Saturday')
        {
            $sat_start = strtotime(date('m/d/Y 00:00:00', $end));
            $diff = $end - $sat_start;
            $total_saturday_hours = round($diff / ( 60 * 60 ), 2);
            $saturday_start = convert_into_fraction($sat_start);
            $saturday_end = $shift_end;
            $shift_end = 24;
            $hours = $hours - $total_saturday_hours;
        }
        // sunday_calcultaon
        
        if ($day_start == 'Sunday' && $day_end == 'Sunday') {
            $total_sunday_hours = $hours;
            $sunday_start = $shift_start;
            $sunday_end = $shift_end;
            $shift_start = 0;
            $shift_end = 0;
            $hours = 0;
        }elseif($day_start == 'Sunday' && $day_end != 'Sunday')
        {
            $sun_end = strtotime(date('m/d/Y 23:59:59', $start));
            $diff = $sun_end - $start;
            $total_sunday_hours = round($diff / ( 60 * 60 ), 2);
            $sunday_start = $shift_start;
            $sunday_end = convert_into_fraction($sun_end);

            $shift_start = 0;
            $hours = $hours-$total_sunday_hours;
        }elseif($day_start != 'Sunday' && $day_end == 'Sunday')
        {
            $sun_start = strtotime(date('m/d/Y 00:00:00', $end));
            // $diff = $end - $sun_start;
            // $total_sunday_hours = round($diff / ( 60 * 60 ), 2);
            $sunday_start = convert_into_fraction($sun_start);
            $sunday_end = convert_into_fraction($end);
            $total_sunday_hours = $sunday_end - $sunday_start;
            $shift_end = 24;
            $shift_start = 24;
            $hours = $hours - $total_sunday_hours;
        }
    // }
        if ($start_in_public_holiday && $end_in_public_holiday) {
            $shift_start = 0;
            $shift_end = 0;
            $saturday_start = 0;
            $saturday_end = 0;
            $sunday_start = 0;
            $sunday_end = 0;
            $total_sunday_hours = 0;
            $total_saturday_hours = 0;
        }

        if ($shift_end < $shift_start && $shift_end < 6 && $shift_end >= 1) {
            $shift_end += 24; 
        }

        $morning = calculateHoursMorning($shift_start, $shift_end, $morning_start, $morning_end, $actual_start, $actual_end);
        if($morning > 12){
            $morning = $morning - 12;
        }

        $saturday_morning = round(calculateHoursMorning($saturday_start, $saturday_end, $morning_start, $morning_end, $actual_start, $actual_end), 2);

        $sunday_morning = round(calculateHoursMorning($sunday_start, $sunday_end, $morning_start, $morning_end, $actual_start, $actual_end), 2);

        $ph_morning = round(calculateHoursMorning($ph_start, $ph_end, $morning_start, $morning_end, $actual_start, $actual_end), 2);

        if ($morning < 0) {
            $morning = 0;
        }
        if ($saturday_morning < 0) {
            $saturday_morning = 0;
        }
        if ($sunday_morning < 0) {
            $sunday_morning = 0;
        }

        return [
            'morning' =>  $morning,
            'night' => round(((($hours - $morning) < 0) ? 0 : ($hours - $morning)), 2),
            'saturday_morning' => $saturday_morning,
            'saturday_night' => round(((($total_saturday_hours - $saturday_morning) < 0) ? 0 : ($total_saturday_hours - $saturday_morning)), 2),
            'sunday_morning' => $sunday_morning,
            'sunday_night' => round(((($total_sunday_hours - $sunday_morning) < 0) ? 0 : ($total_sunday_hours - $sunday_morning)), 2),
            'ph_morning' => $ph_morning,
            'ph_night' => round(((($total_ph_hours - $ph_morning) < 0) ? 0 : ($total_ph_hours - $ph_morning)), 2),
        ];
    }

    function convert_into_fraction($time)
    {
        return date('H', $time) + (date('i', $time) / 60);
    }

    
    function calculateHoursMorning($shift_start, $shift_end, $start, $end, $actual_start, $actual_end)
    {
        if (($shift_start >= $start && $shift_start < $end) && ($shift_end > $start && $shift_end <= $end)) {
            $startDateTime = strtotime($actual_start);
            $endDateTime = strtotime($actual_end);
            return abs(($endDateTime - $startDateTime) / (60 * 60));
            // return $hoursDifference = $actual_end->diffInHours($actual_start);
            // return $shift_end - $shift_start;
        } elseif (($shift_start >= $start && $shift_start < $end) && ($shift_end > $start && $shift_end > $end)) {
            $shift_end = $end;
            return $shift_end - $shift_start;
        } elseif (($shift_start > $start && $shift_start > $end) && ($shift_end > $start && $shift_end <= $end)) {
            $shift_start = $start;
            return $shift_end - $shift_start;
        } elseif (($shift_start < $start && $shift_start < $end) && ($shift_end > $start && $shift_end <= $end)) {
            $shift_start = $start;
            return $shift_end - $shift_start;
        } elseif ($shift_start >= $end && $shift_end > $start && $shift_end < $end) {
            // shift start in night in gone into day
            // echo 'Here';
            return $shift_end - $start;
        } elseif ($shift_start < $start && $shift_end > $end) {
            return $end - $start;
        } elseif ($shift_start > $start && $shift_end < $end) {
            // if ($shift_start >= $start && $shift_end <= $end) {
            //     return 0;
            // }
            return $end - $shift_start;
        } else {
            return 0;
        }
    }
    
    if (!function_exists('send_sms')) {
        function send_sms(string $phone, string $message): bool
        {
            try {
                return app(YeastarService::class)->sendSms($phone, $message);
            } catch (\Exception $e) {
                Log::error('SMS sending failed', [
                    'phone' => $phone,
                    'error' => $e->getMessage()
                ]);
                return false;
            }
        }
    }

    if (!function_exists('generateSecurePassword')) {
        function generateSecurePassword($length = 8)
        {
            $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            $lowercase = 'abcdefghijklmnopqrstuvwxyz';
            $numbers = '0123456789';
            $specialChars = '@';
            
            // Ensure at least one of each type
            $password = [
                $uppercase[random_int(0, strlen($uppercase) - 1)],
                $lowercase[random_int(0, strlen($lowercase) - 1)],
                $numbers[random_int(0, strlen($numbers) - 1)],
                $specialChars[random_int(0, strlen($specialChars) - 1)]
            ];
            
            // Fill the rest with random characters
            $allChars = $uppercase . $lowercase . $numbers . $specialChars;
            for ($i = 4; $i < $length; $i++) {
                $password[] = $allChars[random_int(0, strlen($allChars) - 1)];
            }
            
            // Shuffle the password array
            shuffle($password);
            
            return implode('', $password);
        }
    }

    function sendPasswordEmail($user, $plainPassword)
    {
        try {
            $company = User::find($user->user_id);
            $companyName = $company ? $company->contractor->company_name : 'your company';
            
            $data = [
                'name' => $user->name,
                'email' => $user->email,
                'password' => $plainPassword,
                'company_name' => $companyName,
                'staffo_id' => $user->staffo_id,
                'user_type' => $user->user_type,
            ];

            Mail::send('emails.staff_welcome', $data, function ($message) use ($user) {
                $message->to($user->email, $user->name)
                        ->subject('Your Login Details');
            });

            Log::info('Welcome email sent to contractor: ' . $user->email);
        } catch (\Exception $e) {
            Log::error('Failed to send welcome email to contractor: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $user->email
            ]);
            // Don't throw exception - email failure shouldn't stop the registration process
        }
    }
