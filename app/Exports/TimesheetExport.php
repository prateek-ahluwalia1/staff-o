<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Carbon\Carbon;

class TimesheetExport
{
    private $timesheetData;
    private $dateRange;
    private $userType;
    private $userName;

    public function __construct($timesheetData, $dateRange, $userType, $userName)
    {
        $this->timesheetData = $timesheetData;
        $this->dateRange = $dateRange;
        $this->userType = $userType;
        $this->userName = $userName;
    }

    public function generate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set title
        $sheet->mergeCells('A1:J1');
        $sheet->setCellValue('A1', 'WEEKLY TIMESHEET REPORT');
        $sheet->getStyle('A1:J1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['argb' => 'FFFFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF4CAF50']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        // Report info
        $sheet->mergeCells('A2:J2');
        $sheet->setCellValue('A2', 'Report Date Range: ' . $this->dateRange);
        $sheet->mergeCells('A3:J3');
        $sheet->setCellValue('A3', 'Generated: ' . now()->format('d/m/Y H:i:s'));
        $sheet->mergeCells('A4:J4');
        $sheet->setCellValue('A4', 'Recipient: ' . $this->userName . ' (' . ucfirst($this->userType) . ')');

        // Headers
        $headers = ['S.No', 'Employee Name', 'Total Hours', 'Morning Hours', 'Night Hours', 
                    'Saturday Hours', 'Sunday Hours', 'PH Hours', 'Total Shifts', 'Shift Details'];
        $col = 'A';
        $row = 6;
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $row, $header);
            $sheet->getStyle($col . $row)->applyFromArray([
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2196F3']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ]);
            $col++;
        }

        // Data
        $row = 7;
        $sno = 1;
        foreach ($this->timesheetData as $employee) {
            $col = 'A';
            $sheet->setCellValue($col . $row, $sno++);
            $sheet->setCellValue(++$col . $row, $employee['name']);
            $sheet->setCellValue(++$col . $row, number_format($employee['total_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['morning_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['night_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['saturday_morning_hours'] + $employee['saturday_night_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['sunday_morning_hours'] + $employee['sunday_night_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['ph_morning_hours'] + $employee['ph_night_hours'], 2));
            $sheet->setCellValue(++$col . $row, count($employee['shifts']));
            
            // Shift details
            $details = [];
            foreach ($employee['shifts'] as $index => $shift) {
                $start = Carbon::parse($shift['start']);
                $end = Carbon::parse($shift['end']);
                $breakdown = $shift['hours_breakdown'] ?? [];
                $details[] = sprintf(
                    "Shift %d: %s %s-%s | Site: %s | Contractor: %s | Morning: %sh | Night: %sh",
                    $index + 1,
                    $start->format('d/m/Y'),
                    $start->format('H:i'),
                    $end->format('H:i'),
                    $shift['site_name'] ?? 'N/A',
                    $shift['contractor_name'] ?? 'N/A',
                    number_format($breakdown['morning'] ?? 0, 2),
                    number_format($breakdown['night'] ?? 0, 2)
                );
            }
            $sheet->setCellValue(++$col . $row, implode("\n", $details));
            $sheet->getStyle('J' . $row)->getAlignment()->setWrapText(true);
            
            // Apply borders
            $sheet->getStyle("A{$row}:J{$row}")->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
            ]);
            
            $row++;
        }

        // Auto size columns
        foreach (range('A', 'J') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Create writer
        $writer = new Xlsx($spreadsheet);
        $tempFile = tempnam(sys_get_temp_dir(), 'timesheet_');
        $writer->save($tempFile);
        
        return $tempFile;
    }
}