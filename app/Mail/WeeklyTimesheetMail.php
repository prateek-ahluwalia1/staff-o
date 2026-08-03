<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;
use Maatwebsite\Excel\Facades\Excel;
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
        $this->generateExcelFile();
    }

    private function generateExcelFile()
    {
        $export = new TimesheetExport($this->timesheetData, $this->dateRange, $this->userType, $this->userName);
        $fileName = 'timesheet_report_' . now()->format('d_m_Y') . '.xlsx';
        
        // Store the file temporarily
        $this->excelFile = Excel::raw($export, \Maatwebsite\Excel\Excel::XLSX);
    }

    public function build()
    {
        $subject = "Weekly Timesheet Report - {$this->dateRange}";
        
        if ($this->userType != 'admin') {
            $subject = "Your Weekly Timesheet Report - {$this->dateRange}";
        }
        
        $fileName = 'timesheet_report_' . now()->format('d_m_Y') . '.xlsx';
        
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
                    ->attachData($this->excelFile, $fileName, [
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
}