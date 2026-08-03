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

        // Add headers for all user types
        $data[] = ['Shift #', 'Date', 'Start Time', 'End Time', 'Duration (Hrs)', 'Site', 'Contractor', 'Morning Hrs', 'Night Hrs', 'Weekend Hrs'];
        
        $shiftCounter = 1;
        
        foreach ($this->timesheetData as $employee) {
            // For Admin - Show all employees with their shifts
            // For Staff/Contractor - Show only their shifts
            
            if (isset($employee['shifts']) && !empty($employee['shifts'])) {
                foreach ($employee['shifts'] as $shift) {
                    try {
                        $start = Carbon::parse($shift['start']);
                        $end = Carbon::parse($shift['end']);
                        $breakdown = $shift['hours_breakdown'] ?? [];
                        
                        // Calculate weekend hours
                        $weekend = ($breakdown['saturday_morning'] ?? 0) + ($breakdown['saturday_night'] ?? 0) + 
                                  ($breakdown['sunday_morning'] ?? 0) + ($breakdown['sunday_night'] ?? 0);
                        
                        $data[] = [
                            'Shift ' . $shiftCounter++,
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
                            'Shift ' . $shiftCounter++,
                            'Invalid data',
                            '', '', '', '', '', '', '', ''
                        ];
                    }
                }
            } else {
                $data[] = ['No shifts found', '', '', '', '', '', '', '', '', ''];
            }
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Shift #',
            'Date',
            'Start Time',
            'End Time',
            'Duration (Hrs)',
            'Site',
            'Contractor',
            'Morning Hrs',
            'Night Hrs',
            'Weekend Hrs'
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 15,
            'B' => 15,
            'C' => 15,
            'D' => 15,
            'E' => 18,
            'F' => 35,
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
                'font' => ['bold' => true, 'size' => 11, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF2196F3']
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

                // Style the headers row (row 6)
                $sheet->getStyle('A6:J6')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 11, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF2196F3']
                    ],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                ]);

                // Apply borders to all data rows
                if ($highestRow >= 6) {
                    $sheet->getStyle('A6:J' . $highestRow)->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['argb' => 'FF000000']
                            ]
                        ]
                    ]);

                    // Alternate row colors for better readability
                    for ($row = 7; $row <= $highestRow; $row++) {
                        if ($row % 2 == 0) {
                            $sheet->getStyle('A' . $row . ':J' . $row)->applyFromArray([
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => ['argb' => 'FFF5F5F5']
                                ]
                            ]);
                        }
                    }
                }

                // Auto-size columns
                foreach (range('A', 'J') as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }

                // Freeze the header row
                $sheet->freezePane('A7');

                Log::info('Excel styling completed', [
                    'total_rows' => $highestRow,
                    'user_type' => $this->userType
                ]);
            },
        ];
    }
}