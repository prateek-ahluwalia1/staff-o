<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;
use App\Exports\TimesheetExport;

class WeeklyTimesheetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $timesheetData;
    public $dateRange;
    public $userType;
    public $userName;
    public $isAdmin;
    public $excelFile;

    public function __construct($timesheetData, $dateRange, $userType, $userName)
    {
        $this->timesheetData = $timesheetData;
        $this->dateRange = $dateRange;
        $this->userType = $userType;
        $this->userName = $userName;
        $this->isAdmin = ($userType == 'admin');
        
        // Generate Excel file
        $export = new TimesheetExport($timesheetData, $dateRange, $userType, $userName);
        $this->excelFile = $export->generate();
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
                    ])
                    ->attach($this->excelFile, [
                        'as' => 'timesheet_report_' . now()->format('d_m_Y') . '.xlsx',
                        'mime' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

    public function __destruct()
    {
        // Clean up temporary file
        if ($this->excelFile && file_exists($this->excelFile)) {
            unlink($this->excelFile);
        }
    }
}