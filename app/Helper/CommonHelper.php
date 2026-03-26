<?php

use App\Models\Site;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;

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
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',
                //   'Authorization: Basic '.'NjIxNzJmZDUtMjMzOS00ZmZjLWIwM2EtZWU2MTU5ZWFkNzBh'
                  'Authorization: Key os_v2_app_pecbywkvazhfnhperjtbt6c6dwimrjippdkehwuk3oyy7arltwiy7xojfegl3vmry5vtgaw74cihsil4r53kj7b7ag7hkpcenksowjy'));
                //   config('custom.server_key')
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
    $baseUrl = 'https://staffo.arrowbyte.com.au/';
    return $baseUrl . $folder . '/' . $filename;
    }
