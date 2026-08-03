<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class TimesheetExport implements FromArray, WithHeadings, WithStyles, WithColumnWidths, ShouldAutoSize, WithEvents
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
        
        Log::info('TimesheetExport constructor', [
            'data_count' => count($timesheetData),
            'user_type' => $userType,
            'user_name' => $userName
        ]);
    }

    public function array(): array
    {
        $data = [];
        
        if (empty($this->timesheetData)) {
            Log::warning('Timesheet data is empty in export');
            return [
                ['No data found for the selected period']
            ];
        }

        Log::info('Processing timesheet data for export', [
            'employee_count' => count($this->timesheetData)
        ]);

        foreach ($this->timesheetData as $employee) {
            // Add employee header row
            $data[] = [
                'EMPLOYEE: ' . ($employee['name'] ?? 'N/A'),
                '', '', '', '', '', '', '', '', ''
            ];
            
            // Add employee summary
            $data[] = [
                'Total Hours: ' . (isset($employee['total_hours']) ? number_format($employee['total_hours'], 2) : '0.00'),
                'Morning: ' . (isset($employee['morning_hours']) ? number_format($employee['morning_hours'], 2) : '0.00'),
                'Night: ' . (isset($employee['night_hours']) ? number_format($employee['night_hours'], 2) : '0.00'),
                'Saturday: ' . (isset($employee['saturday_morning_hours']) && isset($employee['saturday_night_hours']) 
                    ? number_format($employee['saturday_morning_hours'] + $employee['saturday_night_hours'], 2) 
                    : '0.00'),
                'Sunday: ' . (isset($employee['sunday_morning_hours']) && isset($employee['sunday_night_hours']) 
                    ? number_format($employee['sunday_morning_hours'] + $employee['sunday_night_hours'], 2) 
                    : '0.00'),
                'PH Hours: ' . (isset($employee['ph_morning_hours']) && isset($employee['ph_night_hours']) 
                    ? number_format($employee['ph_morning_hours'] + $employee['ph_night_hours'], 2) 
                    : '0.00'),
                'Total Shifts: ' . (isset($employee['shifts']) ? count($employee['shifts']) : 0),
                '', '', ''
            ];
            
            // Add shift headers
            $data[] = [
                'Shift #', 'Date', 'Start', 'End', 'Duration', 'Site', 'Contractor', 
                'Morning Hrs', 'Night Hrs', 'Weekend Hrs'
            ];
            
            // Add each shift
            if (isset($employee['shifts']) && !empty($employee['shifts'])) {
                foreach ($employee['shifts'] as $index => $shift) {
                    try {
                        $start = Carbon::parse($shift['start']);
                        $end = Carbon::parse($shift['end']);
                        $breakdown = $shift['hours_breakdown'] ?? [];
                        
                        // Calculate weekend hours
                        $weekend = ($breakdown['saturday_morning'] ?? 0) + ($breakdown['saturday_night'] ?? 0) + 
                                  ($breakdown['sunday_morning'] ?? 0) + ($breakdown['sunday_night'] ?? 0);
                        
                        $data[] = [
                            'Shift ' . ($index + 1),
                            $start->format('d/m/Y'),
                            $start->format('H:i'),
                            $end->format('H:i'),
                            number_format($start->diffInHours($end), 2),
                            $shift['site_name'] ?? 'N/A',
                            $shift['contractor_name'] ?? 'N/A',
                            number_format($breakdown['morning'] ?? 0, 2),
                            number_format($breakdown['night'] ?? 0, 2),
                            number_format($weekend, 2)
                        ];
                    } catch (\Exception $e) {
                        Log::error('Error processing shift', [
                            'shift' => $shift,
                            'error' => $e->getMessage()
                        ]);
                        $data[] = [
                            'Shift ' . ($index + 1),
                            'Invalid data',
                            '', '', '', '', '', '', '', ''
                        ];
                    }
                }
            } else {
                $data[] = ['No shifts found for this employee', '', '', '', '', '', '', '', '', ''];
            }
            
            // Add empty row between employees
            $data[] = ['', '', '', '', '', '', '', '', '', ''];
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 20,
            'B' => 15,
            'C' => 15,
            'D' => 15,
            'E' => 15,
            'F' => 30,
            'G' => 25,
            'H' => 15,
            'I' => 15,
            'J' => 15,
        ];
    }

    public function styles($sheet)
    {
        return [
            // Style for headers
            1 => [
                'font' => ['bold' => true, 'size' => 12],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF4CAF50']
                ],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();
                $highestColumn = $sheet->getHighestColumn();

                // Add title
                $sheet->mergeCells('A1:J1');
                $sheet->setCellValue('A1', 'WEEKLY TIMESHEET REPORT');
                $sheet->getStyle('A1:J1')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 16, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF4CAF50']
                    ],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                ]);

                // Report info
                $sheet->mergeCells('A2:J2');
                $sheet->setCellValue('A2', 'Report Date Range: ' . ($this->dateRange ?? 'N/A'));
                $sheet->getStyle('A2:J2')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 12],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                ]);

                $sheet->mergeCells('A3:J3');
                $sheet->setCellValue('A3', 'Generated: ' . now()->format('d/m/Y H:i:s'));
                $sheet->getStyle('A3:J3')->applyFromArray([
                    'font' => ['size' => 11],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                ]);

                $sheet->mergeCells('A4:J4');
                $sheet->setCellValue('A4', 'Recipient: ' . ($this->userName ?? 'Unknown') . ' (' . ucfirst($this->userType ?? 'user') . ')');
                $sheet->getStyle('A4:J4')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 11],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                ]);

                // Style employee headers
                $row = 6;
                $employeeCount = 0;
                $currentRow = $row;

                while ($currentRow <= $highestRow) {
                    $cellValue = $sheet->getCell('A' . $currentRow)->getValue();
                    
                    // Check if this is an employee header
                    if (strpos($cellValue, 'EMPLOYEE:') !== false) {
                        $employeeCount++;
                        $sheet->getStyle('A' . $currentRow . ':J' . $currentRow)->applyFromArray([
                            'font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['argb' => 'FF2196F3']
                            ],
                            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT]
                        ]);
                        $sheet->mergeCells('A' . $currentRow . ':J' . $currentRow);
                    }
                    
                    // Check if this is a shift header row
                    if ($cellValue == 'Shift #') {
                        $sheet->getStyle('A' . $currentRow . ':J' . $currentRow)->applyFromArray([
                            'font' => ['bold' => true, 'size' => 11, 'color' => ['argb' => 'FFFFFFFF']],
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['argb' => 'FFFF9800']
                            ],
                            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                        ]);
                    }
                    
                    // Apply borders to all data
                    if ($currentRow >= 6) {
                        $sheet->getStyle('A' . $currentRow . ':J' . $currentRow)->applyFromArray([
                            'borders' => [
                                'allBorders' => [
                                    'borderStyle' => Border::BORDER_THIN,
                                    'color' => ['argb' => 'FF000000']
                                ]
                            ]
                        ]);
                    }
                    
                    $currentRow++;
                }

                // Auto-size columns
                foreach (range('A', 'J') as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }
                
                // Set row heights
                for ($i = 6; $i <= $highestRow; $i++) {
                    $value = $sheet->getCell('A' . $i)->getValue();
                    if (strpos($value, 'EMPLOYEE:') !== false) {
                        $sheet->getRowDimension($i)->setRowHeight(25);
                    } elseif ($value == 'Shift #') {
                        $sheet->getRowDimension($i)->setRowHeight(20);
                    } else {
                        $sheet->getRowDimension($i)->setRowHeight(18);
                    }
                }

                Log::info('Excel styling completed', [
                    'employees_found' => $employeeCount,
                    'total_rows' => $highestRow
                ]);
            },
        ];
    }
}