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

        Log::info('=== MAIL CONSTRUCTOR DEBUG ===');
        Log::info('User Type: ' . $userType);
        Log::info('User Name: ' . $userName);
        Log::info('Data Count: ' . count($timesheetData));
        Log::info('Is Admin: ' . ($this->isAdmin ? 'Yes' : 'No'));

        // Generate Excel file
        $this->generateExcelFile();
    }

    private function generateExcelFile()
    {
        try {
            Log::info('=== GENERATING EXCEL FILE ===');
            
            $export = new TimesheetExport(
                $this->timesheetData, 
                $this->dateRange, 
                $this->userType, 
                $this->userName
            );
            
            $this->excelFile = Excel::raw($export, \Maatwebsite\Excel\Excel::XLSX);
            
            Log::info('Excel file generated successfully', [
                'size' => strlen($this->excelFile),
                'user_type' => $this->userType
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
        Log::info('=== BUILDING EMAIL ===');
        
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
            Log::info('Excel file attached to email', [
                'user_type' => $this->userType,
                'file_name' => $fileName
            ]);
        } else {
            Log::warning('No Excel file to attach');
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