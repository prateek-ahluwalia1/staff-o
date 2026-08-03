<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
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
    private $excelFile;

    public function __construct($timesheetData, $dateRange, $userType, $userName)
    {
        $this->timesheetData = $timesheetData;
        $this->dateRange = $dateRange;
        $this->userType = $userType;
        $this->userName = $userName;
        $this->isAdmin = ($userType == 'admin');

        Log::info('WeeklyTimesheetMail constructor', [
            'data_count' => count($timesheetData),
            'user_type' => $userType,
            'user_name' => $userName
        ]);

        // Generate Excel file
        $this->generateExcelFile();
    }

    private function generateExcelFile()
    {
        try {
            $export = new TimesheetExport(
                $this->timesheetData, 
                $this->dateRange, 
                $this->userType, 
                $this->userName
            );
            
            $this->excelFile = Excel::raw($export, \Maatwebsite\Excel\Excel::XLSX);
            
            Log::info('Excel file generated successfully', [
                'size' => strlen($this->excelFile)
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate Excel file', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            $this->excelFile = null;
        }
    }

    public function build()
    {
        $subject = "Weekly Timesheet Report - {$this->dateRange}";
        
        if ($this->userType != 'admin') {
            $subject = "Your Weekly Timesheet Report - {$this->dateRange}";
        }
        
        $fileName = 'timesheet_report_' . now()->format('d_m_Y') . '.xlsx';
        
        $mail = $this->subject($subject)
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

        if ($this->excelFile) {
            $mail->attachData($this->excelFile, $fileName, [
                'mime' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]);
            Log::info('Excel file attached to email');
        }

        return $mail;
    }

    private function calculateTotalHours()
    {
        $total = 0;
        foreach ($this->timesheetData as $data) {
            $total += $data['total_hours'] ?? 0;
        }
        return number_format($total, 2);
    }

    private function calculateTotalShifts()
    {
        $total = 0;
        foreach ($this->timesheetData as $data) {
            $total += isset($data['shifts']) ? count($data['shifts']) : 0;
        }
        return $total;
    }
}