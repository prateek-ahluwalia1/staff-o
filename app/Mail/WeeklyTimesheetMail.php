<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class WeeklyTimesheetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $timesheetData;
    public $dateRange;
    public $userType;
    public $userName;
    public $isAdmin;

    public function __construct($timesheetData, $dateRange, $userType, $userName)
    {
        $this->timesheetData = $timesheetData;
        $this->dateRange = $dateRange;
        $this->userType = $userType;
        $this->userName = $userName;
        $this->isAdmin = ($userType == 'admin');
    }

    public function build()
    {
        $subject = "Weekly Timesheet Report - {$this->dateRange}";
        
        if ($this->userType != 'admin') {
            $subject = "Your Weekly Timesheet Report - {$this->dateRange}";
        }
        
        return $this->subject($subject)
                    ->view('emails.weekly-timesheet')
                    ->with([
                        'timesheetData' => $this->timesheetData,
                        'dateRange' => $this->dateRange,
                        'userType' => $this->userType,
                        'userName' => $this->userName,
                        'isAdmin' => $this->isAdmin,
                        'totalHours' => $this->calculateTotalHours(),
                        'totalShifts' => $this->calculateTotalShifts(),
                        'employeeCount' => count($this->timesheetData)
                    ]);
    }

    private function calculateTotalHours()
    {
        $total = 0;
        foreach ($this->timesheetData as $data) {
            $total += $data['total_hours'];
        }
        return number_format($total, 2);
    }

    private function calculateTotalShifts()
    {
        $total = 0;
        foreach ($this->timesheetData as $data) {
            $total += count($data['shifts']);
        }
        return $total;
    }
}