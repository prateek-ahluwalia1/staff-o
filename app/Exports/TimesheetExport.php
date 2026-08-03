<?php

namespace App\Exports;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
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
        
        // Set document properties
        $spreadsheet->getProperties()
            ->setCreator('Timesheet System')
            ->setTitle('Weekly Timesheet Report')
            ->setSubject('Timesheet Report')
            ->setDescription('Weekly timesheet report');

        // Remove default sheet
        $spreadsheet->removeSheetByIndex(0);

        // Create Summary Sheet
        $this->createSummarySheet($spreadsheet);

        // Create Detailed Shifts Sheet
        $this->createDetailedShiftsSheet($spreadsheet);

        // Create Hours Breakdown Sheet
        $this->createHoursBreakdownSheet($spreadsheet);

        // Set active sheet to first sheet
        $spreadsheet->setActiveSheetIndex(0);

        // Create writer
        $writer = new Xlsx($spreadsheet);
        
        // Save to temporary file
        $tempFile = tempnam(sys_get_temp_dir(), 'timesheet_');
        $writer->save($tempFile);
        
        return $tempFile;
    }

    private function createSummarySheet($spreadsheet)
    {
        $sheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, 'Summary');
        $spreadsheet->addSheet($sheet, 0);
        
        // Set page orientation and margins
        $sheet->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_PORTRAIT)
            ->setPaperSize(PageSetup::PAPERSIZE_A4);
        $sheet->getPageMargins()
            ->setTop(1)
            ->setRight(0.75)
            ->setLeft(0.75)
            ->setBottom(1);

        // Add styles
        $titleStyle = [
            'font' => [
                'bold' => true,
                'size' => 16,
                'color' => ['argb' => 'FFFFFFFF']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF4CAF50']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ];

        $headerStyle = [
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['argb' => 'FFFFFFFF']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF2196F3']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ];

        $borderStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'FF000000']
                ]
            ]
        ];

        // Title
        $sheet->mergeCells('A1:G1');
        $sheet->setCellValue('A1', 'WEEKLY TIMESHEET REPORT');
        $sheet->getStyle('A1:G1')->applyFromArray($titleStyle);
        $sheet->getRowDimension(1)->setRowHeight(40);

        // Report Info
        $sheet->mergeCells('A2:G2');
        $sheet->setCellValue('A2', 'Report Date Range: ' . $this->dateRange);
        $sheet->getStyle('A2:G2')->applyFromArray([
            'font' => ['size' => 12, 'bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        $sheet->mergeCells('A3:G3');
        $sheet->setCellValue('A3', 'Generated: ' . now()->format('d/m/Y H:i:s'));
        $sheet->getStyle('A3:G3')->applyFromArray([
            'font' => ['size' => 11],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        $sheet->mergeCells('A4:G4');
        $sheet->setCellValue('A4', 'Recipient: ' . $this->userName . ' (' . ucfirst($this->userType) . ')');
        $sheet->getStyle('A4:G4')->applyFromArray([
            'font' => ['size' => 11, 'bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        // Summary Headers
        $row = 6;
        $sheet->setCellValue("A{$row}", 'Employee Summary');
        $sheet->mergeCells("A{$row}:G{$row}");
        $sheet->getStyle("A{$row}:G{$row}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 14],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FFE0E0E0']
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        // Headers
        $row = 7;
        $headers = ['S.No', 'Employee Name', 'Total Hours', 'Morning', 'Night', 'Saturday', 'Sunday', 'PH Hours', 'Shifts'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $row, $header);
            $sheet->getStyle($col . $row)->applyFromArray($headerStyle);
            $col++;
        }

        // Data
        $row = 8;
        $sno = 1;
        foreach ($this->timesheetData as $employee) {
            $col = 'A';
            $sheet->setCellValue($col . $row, $sno++);
            $sheet->setCellValue(++$col . $row, $employee['name']);
            $sheet->setCellValue(++$col . $row, number_format($employee['total_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['morning_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['night_hours'], 2));
            $sheet->setCellValue(++$col . $row, 
                number_format($employee['saturday_morning_hours'] + $employee['saturday_night_hours'], 2)
            );
            $sheet->setCellValue(++$col . $row, 
                number_format($employee['sunday_morning_hours'] + $employee['sunday_night_hours'], 2)
            );
            $sheet->setCellValue(++$col . $row, 
                number_format($employee['ph_morning_hours'] + $employee['ph_night_hours'], 2)
            );
            $sheet->setCellValue(++$col . $row, count($employee['shifts']));
            
            // Apply borders
            $sheet->getStyle("A{$row}:G{$row}")->applyFromArray($borderStyle);
            $row++;
        }

        // Auto size columns
        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Add totals row
        if ($row > 8) {
            $sheet->setCellValue('B' . $row, 'TOTAL');
            $sheet->getStyle('B' . $row)->applyFromArray(['font' => ['bold' => true]]);
            $sheet->setCellValue('C' . $row, '=SUM(C8:C' . ($row - 1) . ')');
            $sheet->setCellValue('D' . $row, '=SUM(D8:D' . ($row - 1) . ')');
            $sheet->setCellValue('E' . $row, '=SUM(E8:E' . ($row - 1) . ')');
            $sheet->setCellValue('F' . $row, '=SUM(F8:F' . ($row - 1) . ')');
            $sheet->setCellValue('G' . $row, '=SUM(G8:G' . ($row - 1) . ')');
            $sheet->setCellValue('H' . $row, '=SUM(H8:H' . ($row - 1) . ')');
            $sheet->getStyle("A{$row}:G{$row}")->applyFromArray($borderStyle);
            $sheet->getStyle("B{$row}:G{$row}")->applyFromArray(['font' => ['bold' => true]]);
        }
    }

    private function createDetailedShiftsSheet($spreadsheet)
    {
        $sheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, 'Detailed Shifts');
        $spreadsheet->addSheet($sheet, 1);

        // Set page orientation and margins
        $sheet->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_A4);
        $sheet->getPageMargins()
            ->setTop(1)
            ->setRight(0.75)
            ->setLeft(0.75)
            ->setBottom(1);

        // Headers
        $headerStyle = [
            'font' => [
                'bold' => true,
                'size' => 11,
                'color' => ['argb' => 'FFFFFFFF']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FFFF9800']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ];

        $borderStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'FF000000']
                ]
            ]
        ];

        // Title
        $sheet->mergeCells('A1:M1');
        $sheet->setCellValue('A1', 'DETAILED SHIFT INFORMATION');
        $sheet->getStyle('A1:M1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        // Headers
        $row = 3;
        $headers = [
            'S.No', 'Employee', 'Shift ID', 'Date', 'Start Time', 'End Time', 
            'Duration', 'Site', 'Contractor', 'Morning Hrs', 'Night Hrs',
            'Sat/Sun Hrs', 'PH Hrs'
        ];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $row, $header);
            $sheet->getStyle($col . $row)->applyFromArray($headerStyle);
            $col++;
        }

        // Data
        $row = 4;
        $sno = 1;
        foreach ($this->timesheetData as $employee) {
            foreach ($employee['shifts'] as $shift) {
                $col = 'A';
                $sheet->setCellValue($col . $row, $sno++);
                $sheet->setCellValue(++$col . $row, $employee['name']);
                $sheet->setCellValue(++$col . $row, $shift['shift_id']);
                $sheet->setCellValue(++$col . $row, Carbon::parse($shift['start'])->format('d/m/Y'));
                $sheet->setCellValue(++$col . $row, Carbon::parse($shift['start'])->format('H:i'));
                $sheet->setCellValue(++$col . $row, Carbon::parse($shift['end'])->format('H:i'));
                
                // Calculate duration
                $start = Carbon::parse($shift['start']);
                $end = Carbon::parse($shift['end']);
                $duration = $start->diffInHours($end);
                $sheet->setCellValue(++$col . $row, number_format($duration, 2));
                
                $sheet->setCellValue(++$col . $row, $shift['site_name'] ?? 'N/A');
                $sheet->setCellValue(++$col . $row, $shift['contractor_name'] ?? 'N/A');
                
                $breakdown = $shift['hours_breakdown'] ?? [];
                $sheet->setCellValue(++$col . $row, number_format($breakdown['morning'] ?? 0, 2));
                $sheet->setCellValue(++$col . $row, number_format($breakdown['night'] ?? 0, 2));
                
                $weekend = ($breakdown['saturday_morning'] ?? 0) + ($breakdown['saturday_night'] ?? 0) + 
                          ($breakdown['sunday_morning'] ?? 0) + ($breakdown['sunday_night'] ?? 0);
                $sheet->setCellValue(++$col . $row, number_format($weekend, 2));
                
                $ph = ($breakdown['ph_morning'] ?? 0) + ($breakdown['ph_night'] ?? 0);
                $sheet->setCellValue(++$col . $row, number_format($ph, 2));
                
                // Apply borders
                $sheet->getStyle("A{$row}:M{$row}")->applyFromArray($borderStyle);
                $row++;
            }
        }

        // Auto size columns
        foreach (range('A', 'M') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    private function createHoursBreakdownSheet($spreadsheet)
    {
        $sheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, 'Hours Breakdown');
        $spreadsheet->addSheet($sheet, 2);

        // Set page orientation
        $sheet->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_A4);

        $headerStyle = [
            'font' => [
                'bold' => true,
                'size' => 11,
                'color' => ['argb' => 'FFFFFFFF']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF9C27B0']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ];

        $borderStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'FF000000']
                ]
            ]
        ];

        // Title
        $sheet->mergeCells('A1:K1');
        $sheet->setCellValue('A1', 'HOURS BREAKDOWN BY EMPLOYEE');
        $sheet->getStyle('A1:K1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        // Headers
        $row = 3;
        $headers = [
            'S.No', 'Employee', 'Total Hrs', 'Morning', 'Night', 
            'Sat Morning', 'Sat Night', 'Sun Morning', 'Sun Night',
            'PH Morning', 'PH Night'
        ];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $row, $header);
            $sheet->getStyle($col . $row)->applyFromArray($headerStyle);
            $col++;
        }

        // Data
        $row = 4;
        $sno = 1;
        foreach ($this->timesheetData as $employee) {
            $col = 'A';
            $sheet->setCellValue($col . $row, $sno++);
            $sheet->setCellValue(++$col . $row, $employee['name']);
            $sheet->setCellValue(++$col . $row, number_format($employee['total_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['morning_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['night_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['saturday_morning_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['saturday_night_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['sunday_morning_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['sunday_night_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['ph_morning_hours'], 2));
            $sheet->setCellValue(++$col . $row, number_format($employee['ph_night_hours'], 2));
            
            $sheet->getStyle("A{$row}:K{$row}")->applyFromArray($borderStyle);
            $row++;
        }

        // Auto size columns
        foreach (range('A', 'K') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }
}