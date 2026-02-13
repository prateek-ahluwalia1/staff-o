<?php

namespace App\Http\Controllers;

use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\JobNewRoster;
use Carbon\Carbon;
use App\Models\JobRoster;
use App\Models\User;
use DateTime;

class GetDataFromApiController extends Controller
{
    public function jobData(Request $request)
    {
        $user = User::findOrFail($request->user_id);
        $user = User::where('email', $user->email)->first();

        $coordinates = $request->lat . ',' . $request->lng;

        $site = Site::where('coordinates', $coordinates)->first();
        if (!$site) {
            try {
                $site = Site::create([
                    'user_id'           => $user->id,
                    'site_name'         => $request->title,
                    'site_description'  => $request->description,
                    'address'           => $request->address,
                    'coordinates'       => $coordinates,
                    'state'             => $request->state,
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ]);
            }
        }

        $jobNewRoster = JobNewRoster::where('id', 127)->first();


        if (!$jobNewRoster) {
            return response()->json([
                'success' => false,
                'message' => 'Roster not found.'
            ], 404);
        }

        for ($i = 0; $i < $request->numberOfGuards; $i++) {

            $roster = [
                'site_id'               => $site->id,
                'start'                 => dbFormateDateTime($request->startTime),
                'end'                   => dbFormateDateTime($request->endTime),
                'shift_payable'         => 'yes',
                'shift_chargeable'      => 'yes',
                'shift_create_status'   => 'pending',
                'job_status'            => 'pending',
                'asap'                  => 1,
                'radius'                => $request->radius,
                'publish_status'        => 1,
                'roster_id'             => $jobNewRoster->id,
                'job_instrcutions' => json_encode($request->job_instrcutions),
            ];

            $hours = $this->getShiftHours($roster['start'], $roster['end'], $roster['site_id']);
            $guardWorkingHours = calCulateGuardWeekHours(
                dbFormateDateTime($request->startTime),
                dbFormateDateTime($request->endTime)
            );

            $roster['morning_hours']            = $hours['morning'];
            $roster['night_hours']              = $hours['night'];
            $roster['saturday_morning_hours']   = $hours['saturday_morning'];
            $roster['saturday_night_hours']     = $hours['saturday_night'];
            $roster['sunday_morning_hours']     = $hours['sunday_morning'];
            $roster['sunday_night_hours']       = $hours['sunday_night'];
            $roster['ph_morning_hours']         = $hours['ph_morning'];
            $roster['ph_night_hours']           = $hours['ph_night'];
            $roster['hours']                    = $guardWorkingHours;

            $inserted = JobRoster::insert($roster);
        }

        $lat = floatval($request->lat);
        $lng = floatval($request->lng);
        $radius = $request->radius > 0 ? floatval($request->radius) : 100000000;
        $qry = "
            SELECT id, name, coordinates, profile_image,
            (
                6371 * acos(
                    cos(radians($lat)) *
                    cos(radians(latitude)) *
                    cos(radians($lng) - radians(longitude)) +
                    sin(radians($lat)) * sin(radians(latitude))
                )
            ) AS distance
            FROM users
            WHERE admin_approval_status = 'active'
            AND admin_approved = 1
            AND coordinates != ''
            HAVING distance < $radius
            ORDER BY distance ASC
        ";

        $guards = DB::select($qry);

        if (count($guards) > 0) {
            foreach ($guards as $q) {
                $cod = explode(',', $q->coordinates);
                $q->lat = trim($cod[0]);
                $q->lng = trim($cod[1]);

                if ($q->profile_image) {
                    $q->profile_image = returnImgPath('guard', $q->profile_image);
                }
            }
        } else {
            return response()->json(['success' => false, 'msg' => 'No Staff found!', 'data' => $guards]);
        }

        foreach ($guards as $grd) {
            $guard = User::where('id', $grd->id)->where('guard_status', 'active')->select('id', 'notification_token')->first();
            if ($guard && $guard->notification_token) {
                // send_push_notification([
                //     'notification_token' => $guard->notification_token,
                //     'message'            => "ASAP job has been published. Please check your app.",
                //     'title'              => 'ASAP Job',
                //     'page'               => 'asap-job-list'
                // ]);
            }
        }

        return response()->json([
            'code' => 200,
            'success' => true,
            'message' => 'ASAP Job Published.',
            'guards' => $guards
        ]);
    }

    public function getShiftHours($start, $end, $siteID = null, $continuation = false, $public_holiday = null, $ph_duration = null)
    {
        $actual_start = $start;
        $actual_end = $end;
        $day_start = Carbon::parse($start)->format('l');
        $day_end = Carbon::parse($end)->format('l');

        $start = strtotime($start);
        $end = strtotime($end);

        $diff = $end - $start;
        $hours = round($diff / (60 * 60), 2);
        $hoursCond = round($diff / (60 * 60), 2);
        // if ($hoursCond <= 4 && $continuation == false) {
        //     $additionalHours = 4 - $hoursCond;
        //     $end = strtotime("+$additionalHours hours", $end);
        //     $hours = 4;
        // }
        $morning_start = 6;
        $morning_end = 18;

        /*$afternoon_start = strtotime("15:00");
        $afternoon_end = strtotime("23:00");*/

        $night_start = 18;
        $night_end = 6;

        $shift_start = $this->convert_into_fraction($start);
        $shift_end = $this->convert_into_fraction($end);
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
            $state = $site_state->state != '' ? $states_array[$site_state->state] : 'vic';
        } else {
            $state = 'vic';
        }
        $public_holiday_start = DB::table('public_holidays')->where('date', date('Ymd', $start))->where('state', $state)->first();
        if ($public_holiday != null && $public_holiday == 1) {
            $start_in_public_holiday = true;
        } elseif (!empty($public_holiday_start)) {
            $start_in_public_holiday = true;
        }

        $public_holiday_end = DB::table('public_holidays')->where('date', date('Ymd', $end))->where('state', $state)->first();
        if (!empty($public_holiday_end)) {
            $end_in_public_holiday = true;
        } elseif ($public_holiday != null && $public_holiday == 1 && $ph_duration == 1) {
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

        } elseif ($start_in_public_holiday && !$end_in_public_holiday) {
            $ph_end = strtotime(date('m/d/Y 23:59:59', $start));
            $diff = $ph_end - $start;
            $total_ph_hours = round($diff / (60 * 60), 2);
            $ph_start = $this->convert_into_fraction($start);
            $ph_end = $this->convert_into_fraction($ph_end);
            $start = $public_holiday_start ? strtotime($public_holiday_start->date) + (60 * 60 * 24) : $start + (60 * 60 * 24);
            $day_start = Carbon::parse(date('m/d/Y', $end))->format('l');
            $hours = $hours - $total_ph_hours;
            $shift_start = 0;
            // echo 'Start in PH - '.$day_start;
        } elseif (!$start_in_public_holiday && $end_in_public_holiday) {
            $ph_start = strtotime(date('m/d/Y 00:00:00', strtotime($public_holiday_end->date)));
            $diff = $end - $ph_start;
            $total_ph_hours = round($diff / (60 * 60), 2);
            $ph_start = $this->convert_into_fraction($ph_start);
            // $ph_end = $this->convert_into_fraction($ph_end);
            $end = $this->convert_into_fraction($end);
            $shift_end = 0;
            $ph_end = $end;
            $end = $ph_start;
            $hours = $hours - $total_ph_hours;


            // echo $hours;
        }
        // $day_start = Carbon::parse($start)->format('l');
        // $day_end = Carbon::parse($end)->format('l');
        // print_r(expression)
        // print_r(date('m/d/Y H:i', $end));
        // print('<br>-');
        // print_r($end_in_public_holiday);
        // print('<br>total sat: ');   
        // print_r($total_saturday_hours);
        // print('<br>start: ');   
        // print_r($shift_start);
        // print('<br>end:     ');   
        // print_r($shift_end);
        // print('<br>hours : ');   
        // print_r($hours);
        // exit();
        // print('<br>');
        // print_r($night_end);
        // exit();

        // end of public holiday calculation
        // return $shift_start;
        if ($day_start == 'Saturday' && $day_end == 'Saturday') {
            $total_saturday_hours = $hours;
            $saturday_start = $shift_start;
            $saturday_end = $shift_end;
            $shift_start = 0;
            $shift_end = 0;
            $hours = 0;
        } elseif ($day_start == 'Saturday' && $day_end != 'Saturday') {
            $sat_end = strtotime(date('m/d/Y 23:59:59', $start));
            $diff = $sat_end - $start;
            $total_saturday_hours = round($diff / (60 * 60), 2);
            $saturday_start = $shift_start;
            $saturday_end = $this->convert_into_fraction($sat_end);
            $shift_start = 0;
            $shift_end = 0;
            $hours = $hours - $total_saturday_hours;
        } elseif ($day_start != 'Saturday' && $day_end == 'Saturday') {
            $sat_start = strtotime(date('m/d/Y 00:00:00', $end));
            $diff = $end - $sat_start;
            $total_saturday_hours = round($diff / (60 * 60), 2);
            $saturday_start = $this->convert_into_fraction($sat_start);
            $saturday_end = $shift_end;
            $shift_end = 24;
            $hours = $hours - $total_saturday_hours;
        }
        // sunday_calcultaon
        $sunday_start = 0;
        $sunday_end = 0;
        $total_sunday_hours = 0;
        if ($day_start == 'Sunday' && $day_end == 'Sunday') {
            $total_sunday_hours = $hours;
            $sunday_start = $shift_start;
            $sunday_end = $shift_end;
            $shift_start = 0;
            $shift_end = 0;
            $hours = 0;
        } elseif ($day_start == 'Sunday' && $day_end != 'Sunday') {
            $sun_end = strtotime(date('m/d/Y 23:59:59', $start));
            $diff = $sun_end - $start;
            $total_sunday_hours = round($diff / (60 * 60), 2);
            $sunday_start = $shift_start;
            $sunday_end = $this->convert_into_fraction($sun_end);

            $shift_start = 0;
            $hours = $hours - $total_sunday_hours;
        } elseif ($day_start != 'Sunday' && $day_end == 'Sunday') {
            $sun_start = strtotime(date('m/d/Y 00:00:00', $end));
            // $diff = $end - $sun_start;
            // $total_sunday_hours = round($diff / ( 60 * 60 ), 2);
            $sunday_start = $this->convert_into_fraction($sun_start);
            $sunday_end = $this->convert_into_fraction($end);
            $total_sunday_hours = $sunday_end - $sunday_start;
            $shift_end = 24;
            $shift_start = 24;
            $hours = $hours - $total_sunday_hours;
        }
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



        // print('<br>total sat: ');   
        // print_r($total_saturday_hours);
        // print('<br>start: ');   

        // print('<br>hours : ');   
        // print_r($hours);
        // exit();
        // print_r($shift_end);
        // print('<br>');

        // exit();
        if ($shift_end < $shift_start && $shift_end < 6 && $shift_end >= 1) {
            $shift_end += 24;
        }

        // print_r($morning_start);
        // print('<br>');
        // print_r($morning_end);
        // print('<br>');
        // print_r($shift_start);
        // print('<br>end:     ');   
        // print_r($shift_end);
        $morning = $this->calculateHoursMorning($shift_start, $shift_end, $morning_start, $morning_end, $actual_start, $actual_end);
        if ($morning > 12) {
            $morning = $morning - 12;
        }
        $saturday_morning = round($this->calculateHoursMorning($saturday_start, $saturday_end, $morning_start, $morning_end, $actual_start, $actual_end), 2);

        $sunday_morning = round($this->calculateHoursMorning($sunday_start, $sunday_end, $morning_start, $morning_end, $actual_start, $actual_end), 2);

        $ph_morning = round($this->calculateHoursMorning($ph_start, $ph_end, $morning_start, $morning_end, $actual_start, $actual_end), 2);
        if ($hoursCond < 4) {
            $startedDate = Carbon::parse($actual_start);
            $startedTime = $startedDate->format('H.i');
            $endedDate = Carbon::parse($actual_end);
            $endedTime = $endedDate->format('H.i');
            // return [$actual_start,$startedTime,$endedTime];
            $morningTiming = 0;
            $nightTiming = 0;
            $saturday_morning = 0;
            $saturday_night = 0;
            $sunday_morning = 0;
            $sunday_night = 0;
            $sunday_night = 0;
            $ph_morning = 0;
            $ph_night = 0;
            $morning = 0;
            $night = 0;

            $morningTiming = ($startedTime >= 6 && $startedTime < 18 && $endedTime >= 6 && $endedTime < 18) ? 1 : 0;
            $nightTiming = (($startedTime >= 18 || $startedTime < 6) && ($endedTime >= 18 || $endedTime < 6)) ? 1 : 0;
            // return [$morningTiming, $nightTiming];
            // If both $morningTiming and $nightTiming are 0, determine if the time lies in day or night
            if ($morningTiming === 0 && $nightTiming === 0) {
                $morningTiming = ($startedTime > 6 && $startedTime < 18 || $endedTime > 6 && $endedTime < 18) ? 1 : 0;
                $nightTiming = ($startedTime > 18 || $startedTime < 6 || $endedTime > 18 || $endedTime < 6) ? 1 : 0;
            }
            //     return $spansDayAndNight = 
            // (($startedTime >= 6 && $startedTime < 18) && ($endedTime >= 18 || $endedTime < 6)) ||
            // (($startedTime >= 18 || $startedTime < 6) && ($endedTime >= 6 && $endedTime < 18)) ? 1 : 0;
            if ($morningTiming <= 1 && $nightTiming <= 1) {
                $start_date = Carbon::parse($actual_start);
                $end_date = Carbon::parse($actual_end);
                // return [$actual_start, $actual_end];
                $public_holidays = ['2029-05-10', '2029-05-15'];

                $morning_shift_start = $start_date->copy()->setTime(6, 0, 0);
                $morning_shift_end = $start_date->copy()->setTime(18, 0, 0);

                $night_shift_start = $start_date->copy()->setTime(18, 0, 0);
                $night_shift_end = $night_shift_start->copy()->setTime(6, 0, 0);

                if ($night_shift_end->lt($night_shift_start)) {
                    $night_shift_end->addDay();
                }

                $morning_shift_times = [];
                $night_shift_times = [];
                $saturday_morning = [];
                $saturday_night = [];
                $sunday_morning = [];
                $sunday_night = [];
                $ph_morning = [];
                $ph_night = [];

                $night_hours = 0;
                $morning_hours = 0;
                $saturday_morning_hours = 0;
                $saturday_night_hours = 0;
                $sunday_morning_hours = 0;
                $sunday_night_hours = 0;

                if (in_array($start_date->toDateString(), $public_holidays)) {
                    // Implement logic for public holiday
                    // Add shift times to $ph_morning and $ph_night arrays
                    $ph_morning[] = [$morning_shift_start->format('H:i'), $morning_shift_end->format('H:i')];
                    $ph_night[] = [$night_shift_start->format('H:i'), $night_shift_end->format('H:i')];
                } else {

                    if ($start_date->isFriday() && $end_date->isSaturday()) {

                        $friday_end = $start_date->copy()->endOfDay();
                        $friday_minutes = $start_date->diffInMinutes($friday_end);

                        $friday_hours = $friday_minutes / 60;

                        $night_shift_times[] = [$start_date->format('H:i'), '23:59'];

                        $saturday_start = $end_date->copy()->startOfDay();
                        $saturday_minutes = $saturday_start->diffInMinutes($end_date);

                        $saturday_hours = $saturday_minutes / 60;

                        // $saturday_night[] = ['00:01', $end_date->format('H:i')];

                        $total_shift_hours = $friday_hours + $saturday_hours;

                        if ($total_shift_hours < 4) {

                            $remaining_hours = 4 - $total_shift_hours;

                            $whole_hours = floor($remaining_hours);
                            $fractional_hours = $remaining_hours - $whole_hours;
                            $additional_minutes = $fractional_hours * 60;
                            $extended_end = $end_date->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                            $saturday_night[] = ['00:01', $extended_end->format('H:i')];
                        }

                        foreach ($saturday_night as $time_range) {
                            // Parse the start and end times using Carbon
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            // Calculate the difference in hours
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            // Add to total morning hours
                            $saturday_night_hours += $hours;
                            $saturday_night_hours = round($saturday_night_hours * 2) / 2;
                        }

                        foreach ($night_shift_times as $time_range) {
                            // Parse the start and end times using Carbon
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            // Calculate the difference in hours
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            // Add to total morning hours
                            $night_hours += $hours;
                            $night_hours = round($night_hours * 2) / 2;
                        }
                    } elseif ($start_date->isSaturday() && $end_date->isSunday()) {
                        if ($start_date->lt($morning_shift_end) && $end_date->gt($morning_shift_start)) {
                            $morning_start = max($start_date, $morning_shift_start);
                            $morning_end = min($end_date, $morning_shift_end);

                            $saturday_morning[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];
                        }

                        $saturday_end = $start_date->copy()->endOfDay();
                        $saturday_minutes = $start_date->diffInMinutes($saturday_end);
                        $saturday_hours = $saturday_minutes / 60;

                        $saturday_night[] = [$start_date->format('H:i'), '23:59'];

                        $sunday_start = $end_date->copy()->startOfDay();
                        $sunday_minutes = $sunday_start->diffInMinutes($end_date);
                        $sunday_hours = $sunday_minutes / 60;

                        $total_shift_hours = $saturday_hours + $sunday_hours;

                        if ($total_shift_hours < 4) {
                            $remaining_hours = 4 - $total_shift_hours;

                            $whole_hours = floor($remaining_hours);
                            $fractional_hours = $remaining_hours - $whole_hours;

                            $additional_minutes = $fractional_hours * 60;

                            $extended_end = $end_date->copy()->addHours($whole_hours)->addMinutes($additional_minutes);

                            $sunday_night[] = ['00:01', $extended_end->format('H:i')];
                        }

                        foreach ($sunday_night as $time_range) {
                            // Parse the start and end times using Carbon
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            // Calculate the difference in hours
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            // Add to total morning hours
                            $sunday_night_hours += $hours;
                            $sunday_night_hours = round($sunday_night_hours * 2) / 2;
                        }

                        foreach ($saturday_night as $time_range) {
                            // Parse the start and end times using Carbon
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            // Calculate the difference in hours
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            // Add to total morning hours
                            $saturday_night_hours += $hours;
                            $saturday_night_hours = round($saturday_night_hours * 2) / 2;
                        }

                        foreach ($saturday_morning as $time_range) {
                            // Parse the start and end times using Carbon
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            // Calculate the difference in hours
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            // Add to total morning hours
                            $saturday_morning_hours += $hours;
                            $saturday_morning_hours = round($saturday_morning_hours * 2) / 2;
                        }
                    } elseif ($start_date->isSunday() && $end_date->isMonday()) {
                        // Check for Sunday morning shift
                        if ($start_date->lt($morning_shift_end) && $end_date->gt($morning_shift_start)) {
                            $morning_start = max($start_date, $morning_shift_start);
                            $morning_end = min($end_date, $morning_shift_end);

                            $sunday_morning[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];
                        }

                        $sunday_end = $start_date->copy()->endOfDay();
                        $sunday_minutes = $start_date->diffInMinutes($sunday_end);
                        $sunday_hours = $sunday_minutes / 60;

                        $sunday_night[] = [$start_date->format('H:i'), '23:59'];

                        $monday_start = $end_date->copy()->startOfDay();
                        $monday_minutes = $monday_start->diffInMinutes($end_date);
                        $monday_hours = $monday_minutes / 60;

                        // $night_shift_times[] = ['00:01', $end_date->format('H:i')];

                        $total_shift_hours = $sunday_hours + $monday_hours;

                        if ($total_shift_hours < 4) {
                            $remaining_hours = 4 - $total_shift_hours;

                            $whole_hours = floor($remaining_hours);
                            $fractional_hours = $remaining_hours - $whole_hours;

                            $additional_minutes = $fractional_hours * 60;

                            $extended_end = $end_date->copy()->addHours($whole_hours)->addMinutes($additional_minutes);

                            $night_shift_times[] = ['00:01', $extended_end->format('H:i')];
                        }

                        foreach ($night_shift_times as $time_range) {
                            // Parse the start and end times using Carbon
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            // Calculate the difference in hours
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            // Add to total morning hours
                            $night_hours += $hours;
                            $night_hours = round($night_hours * 2) / 2;
                        }

                        foreach ($sunday_night as $time_range) {
                            // Parse the start and end times using Carbon
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            // Calculate the difference in hours
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            // Add to total morning hours
                            $sunday_night_hours += $hours;
                            $sunday_night_hours = round($sunday_night_hours * 2) / 2;
                        }

                        foreach ($sunday_morning as $time_range) {
                            // Parse the start and end times using Carbon
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            // Calculate the difference in hours
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            // Add to total morning hours
                            $sunday_morning_hours += $hours;
                            $sunday_morning_hours = round($sunday_morning_hours * 2) / 2;
                        }
                    } elseif ($start_date->isSaturday() && $end_date->isSaturday()) {
                        $total_hours = 0;

                        // Check and calculate night shift hours
                        if ($start_date->lt($night_shift_end) && $end_date->gt($night_shift_start)) {
                            $night_start = max($start_date, $night_shift_start);
                            $night_end = min($end_date, $night_shift_end);
                            $night_duration = $night_start->diffInMinutes($night_end) / 60; // Convert minutes to hours
                            $total_hours += $night_duration;

                            $saturday_night[] = [$night_start->format('H:i'), $night_end->format('H:i')];
                        }

                        // Check and calculate morning shift hours
                        if ($start_date->lt($morning_shift_end) && $end_date->gt($morning_shift_start)) {
                            $morning_start = max($start_date, $morning_shift_start);
                            $morning_end = min($end_date, $morning_shift_end);
                            $morning_duration = $morning_start->diffInMinutes($morning_end) / 60; // Convert minutes to hours
                            $total_hours += $morning_duration;

                            $saturday_morning[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];
                        }

                        // If total hours are less than 4, add remaining hours to make it 4
                        if ($total_hours < 4) {
                            $remaining_hours = 4 - $total_hours;

                            // Split the remaining hours into whole hours and minutes
                            $whole_hours = floor($remaining_hours);
                            $fractional_hours = $remaining_hours - $whole_hours;
                            $additional_minutes = $fractional_hours * 60; // Convert fractional hours to minutes

                            // If both night and morning shifts exist, add hours based on the later end time
                            if (!empty($saturday_night) && !empty($saturday_morning)) {
                                $last_night_shift = end($saturday_night);
                                $last_morning_shift = end($saturday_morning);

                                $last_night_end = \Carbon\Carbon::createFromFormat('H:i', $last_night_shift[1]);
                                $last_morning_end = \Carbon\Carbon::createFromFormat('H:i', $last_morning_shift[1]);

                                // Extend the shift with the later end time
                                if ($last_night_end->gte($last_morning_end)) {
                                    $extended_night_end = $last_night_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                                    $saturday_night[count($saturday_night) - 1][1] = $extended_night_end->format('H:i');
                                } else {
                                    $extended_morning_end = $last_morning_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                                    $saturday_morning[count($saturday_morning) - 1][1] = $extended_morning_end->format('H:i');
                                }
                            }
                            // If only the night shift exists, extend it
                            elseif (!empty($saturday_night)) {
                                $last_night_shift = end($saturday_night);
                                $last_night_end = \Carbon\Carbon::createFromFormat('H:i', $last_night_shift[1]);
                                $extended_night_end = $last_night_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                                $saturday_night[count($saturday_night) - 1][1] = $extended_night_end->format('H:i');
                            }
                            // If only the morning shift exists, extend it
                            elseif (!empty($saturday_morning)) {
                                $last_morning_shift = end($saturday_morning);
                                $last_morning_end = \Carbon\Carbon::createFromFormat('H:i', $last_morning_shift[1]);
                                $extended_morning_end = $last_morning_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                                $saturday_morning[count($saturday_morning) - 1][1] = $extended_morning_end->format('H:i');
                            }
                        }

                        foreach ($saturday_morning as $time_range) {
                            // Parse the start and end times using Carbon
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            // Calculate the difference in hours
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            // Add to total morning hours
                            $saturday_morning_hours += $hours;
                            $saturday_morning_hours = round($saturday_morning_hours * 2) / 2;
                        }

                        foreach ($saturday_night as $time_range) {
                            // Parse the start and end times using Carbon
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            // Calculate the difference in hours
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            // Add to total morning hours
                            $saturday_night_hours += $hours;
                            $saturday_night_hours = round($saturday_night_hours * 2) / 2;
                        }
                    } elseif ($start_date->isSunday() && $end_date->isSunday()) {
                        $total_hours = 0;
                        if ($start_date->lt($night_shift_end) && $end_date->gt($night_shift_start)) {
                            $night_start = max($start_date, $night_shift_start);
                            $night_end = min($end_date, $night_shift_end);
                            $night_duration = $night_start->diffInMinutes($night_end) / 60; // Convert minutes to hours
                            $total_hours += $night_duration;
                            $sunday_night[] = [$night_start->format('H:i'), $night_end->format('H:i')];
                        }
                        if ($start_date->lt($morning_shift_end) && $end_date->gt($morning_shift_start)) {
                            $morning_start = max($start_date, $morning_shift_start);
                            $morning_end = min($end_date, $morning_shift_end);
                            $morning_duration = $morning_start->diffInMinutes($morning_end) / 60; // Convert minutes to hours
                            $total_hours += $morning_duration;

                            $sunday_morning[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];
                        }
                        if ($start_date->lt($morning_shift_start)) {
                            $sunday_night[] = [$start_date->format('H:i'), '06:00'];
                        }

                        // If total hours are less than 4, add remaining hours to make it 4
                        if ($total_hours < 4) {
                            $remaining_hours = 4 - $total_hours;

                            // Split the remaining hours into whole hours and minutes
                            $whole_hours = floor($remaining_hours);
                            $fractional_hours = $remaining_hours - $whole_hours;
                            $additional_minutes = $fractional_hours * 60; // Convert fractional hours to minutes

                            // If both night and morning shifts exist, add hours based on the later end time
                            if (!empty($sunday_night) && !empty($sunday_morning)) {
                                $last_night_shift = end($sunday_night);
                                $last_morning_shift = end($sunday_morning);

                                $last_night_end = \Carbon\Carbon::createFromFormat('H:i', $last_night_shift[1]);
                                $last_morning_end = \Carbon\Carbon::createFromFormat('H:i', $last_morning_shift[1]);

                                // Extend the shift with the later end time
                                if ($last_night_end->gte($last_morning_end)) {
                                    $extended_night_end = $last_night_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                                    $sunday_night[count($sunday_night) - 1][1] = $extended_night_end->format('H:i');
                                } else {
                                    $extended_morning_end = $last_morning_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                                    $sunday_morning[count($sunday_morning) - 1][1] = $extended_morning_end->format('H:i');
                                }
                            }
                            // If only the night shift exists, extend it
                            elseif (!empty($sunday_night)) {
                                $last_night_shift = end($sunday_night);
                                $last_night_end = \Carbon\Carbon::createFromFormat('H:i', $last_night_shift[1]);
                                $extended_night_end = $last_night_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                                $sunday_night[count($sunday_night) - 1][1] = $extended_night_end->format('H:i');
                            }
                            // If only the morning shift exists, extend it
                            elseif (!empty($sunday_morning)) {
                                $last_morning_shift = end($sunday_morning);
                                $last_morning_end = \Carbon\Carbon::createFromFormat('H:i', $last_morning_shift[1]);
                                $extended_morning_end = $last_morning_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                                $sunday_morning[count($sunday_morning) - 1][1] = $extended_morning_end->format('H:i');
                            }
                        }

                        foreach ($sunday_morning as $time_range) {
                            // Parse the start and end times using Carbon
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            // Calculate the difference in hours
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            // Add to total morning hours
                            $sunday_morning_hours += $hours;
                            $sunday_morning_hours = round($sunday_morning_hours * 2) / 2;
                        }

                        foreach ($sunday_night as $time_range) {
                            // Parse the start and end times using Carbon
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            // Calculate the difference in hours
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            // Add to total morning hours
                            $sunday_night_hours += $hours;
                            $sunday_night_hours = round($sunday_night_hours * 2) / 2;
                        }
                    } else {

                        $total_hours = 0;

                        // Initialize variables to track processed ranges
                        $processed_night_end = null;
                        $processed_morning_start = null;

                        // Check for night shift hours (this handles time spanning over midnight and before 6:00 AM)
                        if ($start_date->lt($morning_shift_start)) {
                            // Special case where the shift starts before 6:00 AM (night shift) and ends after 6:00 AM (morning shift)
                            if ($end_date->gte($morning_shift_start)) {
                                // Case: Shift starts in night and ends in the morning
                                $night_start = $start_date;
                                $night_end = $morning_shift_start; // End night shift at 6:00 AM

                                // Calculate night shift duration in hours
                                $night_duration = $night_start->diffInMinutes($night_end) / 60;
                                $night_shift_times[] = [$night_start->format('H:i'), $night_end->format('H:i')];
                                $total_hours += $night_duration;

                                // Mark the end of the night shift as processed
                                $processed_night_end = $night_end;

                                // Calculate morning shift hours (from 6:00 AM onwards)
                                $morning_start = $morning_shift_start;
                                $morning_end = min($end_date, $morning_shift_end);
                                $morning_shift_times[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];

                                // Calculate morning shift duration in hours
                                $morning_duration = $morning_start->diffInMinutes($morning_end) / 60;
                                $total_hours += $morning_duration;

                                // Mark the start of the morning shift as processed
                                $processed_morning_start = $morning_start;
                            } else {
                                // Case: Entire shift is within the night shift (before 6:00 AM)
                                $night_start = $start_date;
                                $night_end = $end_date;

                                // Calculate night shift duration in hours
                                $night_duration = $night_start->diffInMinutes($night_end) / 60;
                                $night_shift_times[] = [$night_start->format('H:i'), $night_end->format('H:i')];
                                $total_hours += $night_duration;

                                // Mark the end of the night shift as processed
                                $processed_night_end = $night_end;
                            }
                        }

                        // Check for morning shift hours (this handles cases when the shift is fully in the morning shift)
                        if ($start_date->lt($morning_shift_end) && $end_date->gt($morning_shift_start)) {
                            $morning_start = max($start_date, $morning_shift_start);
                            $morning_end = min($end_date, $morning_shift_end);

                            // Make sure we're not counting the same time range that was counted as part of the night shift
                            if (!$processed_morning_start || $morning_start->gt($processed_night_end)) {
                                $morning_shift_times[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];

                                // Calculate morning shift duration in hours
                                $morning_duration = $morning_start->diffInMinutes($morning_end) / 60;
                                $total_hours += $morning_duration;
                            }
                        }

                        // Check for night shift hours (this handles time spanning over midnight and after 6:00 PM)
                        if ($start_date->lt($night_shift_end) && $end_date->gt($night_shift_start)) {
                            $night_start = max($start_date, $night_shift_start);
                            $night_end = min($end_date, $night_shift_end);

                            // Ensure no overlapping time ranges with previously calculated night shift
                            if (!$processed_night_end || $night_start->gt($processed_night_end)) {
                                $night_shift_times[] = [$night_start->format('H:i'), $night_end->format('H:i')];

                                // Calculate night shift duration in hours
                                $night_duration = $night_start->diffInMinutes($night_end) / 60;
                                $total_hours += $night_duration;
                            }

                            // Handle transition from night shift to morning shift
                            if ($end_date->gt($night_shift_end)) {
                                $morning_start = $night_shift_end;
                                $morning_end = min($end_date, $morning_shift_end);

                                // Ensure no overlapping time ranges with previously calculated morning shift
                                if (!$processed_morning_start || $morning_start->gt($processed_morning_start)) {
                                    $morning_shift_times[] = [$morning_start->format('H:i'), $morning_end->format('H:i')];

                                    // Calculate additional morning shift hours
                                    $morning_extra_duration = $morning_start->diffInMinutes($morning_end) / 60;
                                    $total_hours += $morning_extra_duration;
                                }
                            }
                        }

                        // If total hours worked is less than 4, extend based on the end time
                        if ($total_hours < 4) {
                            $remaining_hours = 4 - $total_hours;
                            $whole_hours = floor($remaining_hours);
                            $fractional_hours = $remaining_hours - $whole_hours;
                            $additional_minutes = $fractional_hours * 60;
                            // Check if both night and morning shifts are not empty
                            if (!empty($night_shift_times) && !empty($morning_shift_times)) {
                                // Determine the last end time of both shifts
                                $last_night_shift = end($night_shift_times);
                                $last_night_end = \Carbon\Carbon::createFromFormat('H:i', $last_night_shift[1]);

                                $last_morning_shift = end($morning_shift_times);
                                $last_morning_end = \Carbon\Carbon::createFromFormat('H:i', $last_morning_shift[1]);

                                // Determine which shift end time is closer to the overall shift end time
                                $shift_end_time = \Carbon\Carbon::createFromFormat('H:i', $end_date->format('H:i'));

                                if ($last_night_end->lte($shift_end_time) && $last_night_end->gt($last_morning_end)) {
                                    // If the last night shift end time is closer to or at the shift end time
                                    $extended_night_end = $last_night_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                                    $night_shift_times[count($night_shift_times) - 1][1] = $extended_night_end->format('H:i');
                                } else {
                                    // If the last morning shift end time is closer to or at the shift end time
                                    $extended_morning_end = $last_morning_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                                    $morning_shift_times[count($morning_shift_times) - 1][1] = $extended_morning_end->format('H:i');
                                }
                            } elseif (!empty($night_shift_times)) {
                                // Handle case where only night shift times are present
                                $last_night_shift = end($night_shift_times);
                                $last_night_end = \Carbon\Carbon::createFromFormat('H:i', $last_night_shift[1]);

                                $extended_night_end = $last_night_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                                $night_shift_times[count($night_shift_times) - 1][1] = $extended_night_end->format('H:i');
                            } elseif (!empty($morning_shift_times)) {
                                // Handle case where only morning shift times are present
                                $last_morning_shift = end($morning_shift_times);
                                $last_morning_end = \Carbon\Carbon::createFromFormat('H:i', $last_morning_shift[1]);

                                $extended_morning_end = $last_morning_end->copy()->addHours($whole_hours)->addMinutes($additional_minutes);
                                $morning_shift_times[count($morning_shift_times) - 1][1] = $extended_morning_end->format('H:i');
                            }
                        }

                        foreach ($morning_shift_times as $time_range) {
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            $morning_hours += $hours;
                            $morning_hours = round($morning_hours * 2) / 2;
                        }

                        foreach ($night_shift_times as $time_range) {
                            $start_time = Carbon::createFromFormat('H:i', $time_range[0]);
                            $end_time = Carbon::createFromFormat('H:i', $time_range[1]);

                            if ($end_time->lt($start_time)) {
                                $end_time->addDay();
                            }
                            $hours = $start_time->diffInMinutes($end_time) / 60;

                            $night_hours += $hours;
                            $night_hours = round($night_hours * 2) / 2;
                        }
                    }
                }

                // return [
                //     // 'morning' => $this->intersection( $start1, $end, $morning_start, $morning_end ) / 3600,
                //     'morning' =>  $morning,
                //     'night' => round(((($hours - $morning) < 0) ? 0 : ($hours - $morning)), 2),
                //     'saturday_morning' => $saturday_morning,
                //     'saturday_night' => round(((($total_saturday_hours - $saturday_morning) < 0) ? 0 : ($total_saturday_hours - $saturday_morning)), 2),
                //     'sunday_morning' => $sunday_morning,
                //     'sunday_night' => round(((($total_sunday_hours - $sunday_morning) < 0) ? 0 : ($total_sunday_hours - $sunday_morning)), 2),
                //     'ph_morning' => $ph_morning,
                //     'ph_night' => round(((($total_ph_hours - $ph_morning) < 0) ? 0 : ($total_ph_hours - $ph_morning)), 2),

                //     // 'night' => $this->calculateHoursNight($shift_start, $shift_end, $night_start, $night_end ),
                // ];

                return [
                    // 'morning' => $this->intersection( $start1, $end, $morning_start, $morning_end ) / 3600,
                    'morning' =>  $morning_hours,
                    'night' => $night_hours,
                    'saturday_morning' => $saturday_morning_hours,
                    'saturday_night' => $saturday_night_hours,
                    'sunday_morning' => $sunday_morning_hours,
                    'sunday_night' => $sunday_night_hours,
                    'ph_morning' => 0,
                    'ph_night' => 0,
                ];
            } else {
                if ($endedTime > 6 && $endedTime < 18) {
                    $morningTiming = 1;
                }
                if ($endedTime > 18 || $endedTime < 6) {
                    $nightTiming = 1;
                }
                if ($startedTime > 6 && $startedTime < 18) {
                    $startedMorningTiming = 1;
                }
                if ($startedTime > 18 || $startedTime < 6) {
                    $startedNightTiming = 1;
                }
                if ($endedTime > 6 && $endedTime < 18) {
                    $morningTiming = 1;
                }
                if ($endedTime > 18 || $endedTime < 6) {
                    $nightTiming = 1;
                }
                if ($morningTiming == 1) {
                    $morning = 4;
                }
                if ($nightTiming == 1) {
                    $night = 4;
                }
                if ($morning < 0) {
                    $morning = 0;
                }
                if ($saturday_morning < 0) {
                    $saturday_morning = 0;
                } else if ($saturday_morning > 0) {
                    if ($morningTiming == 1) {
                        $saturday_morning = 4;
                    }
                    if ($nightTiming == 1) {
                        $saturday_night = 4;
                    }
                }
                if ($sunday_morning < 0) {
                    $sunday_morning = 0;
                } else if ($sunday_morning > 0) {
                    if ($morningTiming == 1) {
                        $sunday_morning = 4;
                    }
                    if ($nightTiming == 1) {
                        $sunday_night = 4;
                    }
                }
                if ($ph_morning < 0) {
                    $ph_morning = 0;
                } else if ($ph_morning > 0) {
                    if ($morningTiming == 1) {
                        $ph_morning = 4;
                    }
                    if ($nightTiming == 1) {
                        $ph_night = 4;
                    }
                }
                return [
                    'morning' =>  $morning,
                    'night' => $night,
                    'saturday_morning' => $saturday_morning,
                    'saturday_night' => $saturday_night,
                    'sunday_morning' => $sunday_morning,
                    'sunday_night' => $sunday_night,
                    'ph_morning' => $ph_morning,
                    'ph_night' => $ph_night,
                ];
            }
        }

        // echo $ph_end;
        // exit();

        if ($morning < 0) {
            $morning = 0;
        }
        if ($saturday_morning < 0) {
            $saturday_morning = 0;
        }
        if ($sunday_morning < 0) {
            $sunday_morning = 0;
        }
        // print_r($shift_end);
        return [
            // 'morning' => $this->intersection( $start1, $end, $morning_start, $morning_end ) / 3600,
            'morning' =>  $morning,
            'night' => round(((($hours - $morning) < 0) ? 0 : ($hours - $morning)), 2),
            'saturday_morning' => $saturday_morning,
            'saturday_night' => round(((($total_saturday_hours - $saturday_morning) < 0) ? 0 : ($total_saturday_hours - $saturday_morning)), 2),
            'sunday_morning' => $sunday_morning,
            'sunday_night' => round(((($total_sunday_hours - $sunday_morning) < 0) ? 0 : ($total_sunday_hours - $sunday_morning)), 2),
            'ph_morning' => $ph_morning,
            'ph_night' => round(((($total_ph_hours - $ph_morning) < 0) ? 0 : ($total_ph_hours - $ph_morning)), 2),

            // 'night' => $this->calculateHoursNight($shift_start, $shift_end, $night_start, $night_end ),
        ];
    }

    function calCulateGuardWeekHours($start, $end)
    {
        // $datetime1 = new DateTime($start);
        // $datetime2 = new DateTime($end);
        // $interval = $datetime1->diff($datetime2);
        // //$minuts = $interval->format('%i')/100;
        // $minuts = $interval->format('%i');
        // return $interval->format('%h') . '.'. $minuts;

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

    public function getJobHistory(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|integer',
        ]);

        $customerId = $request->customer_id;

        $jobs = DB::table('job_rosters')
            ->join('sites', 'sites.id', '=', 'job_rosters.site_id')
            ->join('customers', 'customers.id', '=', 'sites.customer_id')
            ->leftJoin('guards', 'guards.id', '=', 'job_rosters.guard_id')
            ->where('sites.customer_id', $customerId)
            ->whereNull('job_rosters.deleted_at') // ✅ exclude soft-deleted shifts
            ->select(
                'job_rosters.*',
                'sites.site_name',
                'customers.name as customer_name',
                DB::raw("CASE WHEN guards.id IS NOT NULL THEN CONCAT(guards.first_name, ' ', guards.last_name) ELSE 'N/A' END as guard_name")
            )
            ->orderBy('job_rosters.start', 'asc')
            ->get();

        if ($jobs->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No jobs found for this customer',
                'data'    => []
            ], 200);
        }

        return response()->json([
            'success' => true,
            'message' => 'Customer job history fetched successfully',
            'data'    => $jobs
        ], 200);
    }

    public function jobStatusCountByCustomer(Request $request)
    {
        $customerId = $request->customer_id;

        $counts = JobRoster::join('job_new_roster', 'job_rosters.roster_id', '=', 'job_new_roster.id')
            ->whereJsonContains('job_new_roster.customer_id', [$customerId])
            ->selectRaw("
                SUM(CASE WHEN job_rosters.job_status = 'pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN job_rosters.job_status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
                SUM(CASE WHEN job_rosters.job_status = 'accepted' THEN 1 ELSE 0 END) AS accepted,
                COUNT(job_rosters.id) AS total
            ")->where('job_rosters.deleted_at', null)
            ->first();

        return response()->json([
            'success'   => true,
            'customer_id' => $customerId,
            'data' => [
                'pending'   => (int) $counts->pending,
                'confirmed' => (int) $counts->confirmed,
                'accepted'  => (int) $counts->accepted,
                'total'     => (int) $counts->total,
            ]
        ]);
    }
    // public function uploadFile(Request $request)
    // {
    //     if ($request->folder == '') {
    //         $request->folder = 'uploads';
    //     }
    //     if ($request->has('upload')) {
    //         $image = fileUpload($request->upload, '/' . $request->folder . '/');
    //     } else {
    //         $image = fileUpload($request->file, '/' . $request->folder . '/');
    //     }
    //     if ($image != '') {
    //         $url = asset('') . $request->folder . '/' . $image;
    //         if ($request->folder == '') {
    //             $url = asset('uploads') . '/' . $image;
    //         }
    //         return response()->json(array('success' => true, 'path' => $image, 'url' => $url));
    //     } else {
    //         return response()->json(array('success' => false, 'path' => '', 'url' => ''));
    //     }
    // }

    public function uploadFile(Request $request)
    {
        $folder = $request->folder ?: 'uploads';
        $inputKey = $request->hasFile('upload') ? 'upload' : 'file';

        if (!$request->hasFile($inputKey)) {
            return response()->json([
                'success' => false,
                'message' => 'No file provided'
            ], 400);
        }

        $files = $request->file($inputKey);
        $files = is_array($files) ? $files : [$files];

        $uploadedFiles = [];

        foreach ($files as $file) {
            $image = fileUpload($file, '/' . $folder . '/');

            if ($image) {
                $uploadedFiles[] = [
                    'path' => $image,
                    'url'  => asset($folder . '/' . $image),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data'    => count($uploadedFiles) === 1 ? $uploadedFiles[0] : $uploadedFiles
        ]);
    }
}
