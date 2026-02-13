<?php

use Illuminate\Support\Str;

function returnImgPath($type, $image)
{
        if(!empty($image)){
            return url($type).'/'. $image;
        }else{
            return null;
        }     
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