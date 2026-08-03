<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Carbon\Carbon;

class TimesheetExport implements WithMultipleSheets, ShouldAutoSize
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

    /**
     * @return array
     */
    public function sheets(): array
    {
        return [
            new SummarySheet($this->timesheetData, $this->dateRange, $this->userType, $this->userName),
            new DetailedShiftsSheet($this->timesheetData),
            new HoursBreakdownSheet($this->timesheetData),
        ];
    }
}

/**
 * Summary Sheet
 */
class SummarySheet implements FromArray, WithHeadings, WithStyles, WithColumnWidths, WithTitle, WithEvents
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

    public function title(): string
    {
        return 'Summary';
    }

    public function headings(): array
    {
        return [
            'S.No',
            'Employee Name',
            'Total Hours',
            'Morning Hours',
            'Night Hours',
            'Saturday Hours',
            'Sunday Hours',
            'PH Hours',
            'Total Shifts'
        ];
    }

    public function array(): array
    {
        $data = [];
        $sno = 1;
        
        foreach ($this->timesheetData as $employee) {
            $data[] = [
                $sno++,
                $employee['name'],
                number_format($employee['total_hours'], 2),
                number_format($employee['morning_hours'], 2),
                number_format($employee['night_hours'], 2),
                number_format($employee['saturday_morning_hours'] + $employee['saturday_night_hours'], 2),
                number_format($employee['sunday_morning_hours'] + $employee['sunday_night_hours'], 2),
                number_format($employee['ph_morning_hours'] + $employee['ph_night_hours'], 2),
                count($employee['shifts'])
            ];
        }

        // Add total row
        if (!empty($data)) {
            $totalRow = [
                '',
                'TOTAL',
                array_sum(array_column($data, 2)),
                array_sum(array_column($data, 3)),
                array_sum(array_column($data, 4)),
                array_sum(array_column($data, 5)),
                array_sum(array_column($data, 6)),
                array_sum(array_column($data, 7)),
                array_sum(array_column($data, 8))
            ];
            $data[] = $totalRow;
        }

        return $data;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 10,
            'B' => 30,
            'C' => 15,
            'D' => 15,
            'E' => 15,
            'F' => 15,
            'G' => 15,
            'H' => 15,
            'I' => 15,
        ];
    }

    public function styles($sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
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
                // Get sheet
                $sheet = $event->sheet->getDelegate();
                $lastRow = $sheet->getHighestRow();

                // Add title
                $sheet->mergeCells('A1:I1');
                $sheet->setCellValue('A1', 'WEEKLY TIMESHEET REPORT');
                
                // Style the title
                $sheet->getStyle('A1:I1')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 16, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF4CAF50']
                    ],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                ]);

                // Add report info
                $sheet->mergeCells('A2:I2');
                $sheet->setCellValue('A2', 'Report Date Range: ' . $this->dateRange);
                $sheet->getStyle('A2:I2')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 12],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                ]);

                $sheet->mergeCells('A3:I3');
                $sheet->setCellValue('A3', 'Generated: ' . now()->format('d/m/Y H:i:s'));
                $sheet->getStyle('A3:I3')->applyFromArray([
                    'font' => ['size' => 11],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                ]);

                $sheet->mergeCells('A4:I4');
                $sheet->setCellValue('A4', 'Recipient: ' . $this->userName . ' (' . ucfirst($this->userType) . ')');
                $sheet->getStyle('A4:I4')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 11],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                ]);

                // Set headings row
                $headings = ['S.No', 'Employee Name', 'Total Hours', 'Morning Hours', 'Night Hours', 
                            'Saturday Hours', 'Sunday Hours', 'PH Hours', 'Total Shifts'];
                $col = 'A';
                $row = 6;
                foreach ($headings as $heading) {
                    $sheet->setCellValue($col . $row, $heading);
                    $sheet->getStyle($col . $row)->applyFromArray([
                        'font' => ['bold' => true, 'size' => 12, 'color' => ['argb' => 'FFFFFFFF']],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['argb' => 'FF2196F3']
                        ],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                    ]);
                    $col++;
                }

                // Apply borders to data
                $styleArray = [
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FF000000']
                        ]
                    ]
                ];
                
                if ($lastRow >= 6) {
                    $sheet->getStyle('A6:I' . $lastRow)->applyFromArray($styleArray);
                }

                // Style total row
                if ($lastRow > 6) {
                    $sheet->getStyle('B' . $lastRow . ':I' . $lastRow)->applyFromArray([
                        'font' => ['bold' => true],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['argb' => 'FFE0E0E0']
                        ]
                    ]);
                }

                // Auto size columns
                foreach (range('A', 'I') as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }
            },
        ];
    }
}

/**
 * Detailed Shifts Sheet
 */
class DetailedShiftsSheet implements FromArray, WithHeadings, WithStyles, WithColumnWidths, WithTitle, WithEvents
{
    private $timesheetData;

    public function __construct($timesheetData)
    {
        $this->timesheetData = $timesheetData;
    }

    public function title(): string
    {
        return 'Detailed Shifts';
    }

    public function headings(): array
    {
        return [
            'S.No',
            'Employee',
            'Shift ID',
            'Date',
            'Start Time',
            'End Time',
            'Duration (Hrs)',
            'Site',
            'Contractor',
            'Morning Hrs',
            'Night Hrs',
            'Weekend Hrs',
            'PH Hrs'
        ];
    }

    public function array(): array
    {
        $data = [];
        $sno = 1;
        
        foreach ($this->timesheetData as $employee) {
            foreach ($employee['shifts'] as $shift) {
                $breakdown = $shift['hours_breakdown'] ?? [];
                $weekend = ($breakdown['saturday_morning'] ?? 0) + ($breakdown['saturday_night'] ?? 0) + 
                          ($breakdown['sunday_morning'] ?? 0) + ($breakdown['sunday_night'] ?? 0);
                $ph = ($breakdown['ph_morning'] ?? 0) + ($breakdown['ph_night'] ?? 0);
                
                $start = Carbon::parse($shift['start']);
                $end = Carbon::parse($shift['end']);
                $duration = $start->diffInHours($end);
                
                $data[] = [
                    $sno++,
                    $employee['name'],
                    $shift['shift_id'],
                    $start->format('d/m/Y'),
                    $start->format('H:i'),
                    $end->format('H:i'),
                    number_format($duration, 2),
                    $shift['site_name'] ?? 'N/A',
                    $shift['contractor_name'] ?? 'N/A',
                    number_format($breakdown['morning'] ?? 0, 2),
                    number_format($breakdown['night'] ?? 0, 2),
                    number_format($weekend, 2),
                    number_format($ph, 2)
                ];
            }
        }

        return $data;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 10,
            'B' => 25,
            'C' => 15,
            'D' => 15,
            'E' => 15,
            'F' => 15,
            'G' => 15,
            'H' => 25,
            'I' => 25,
            'J' => 15,
            'K' => 15,
            'L' => 15,
            'M' => 15,
        ];
    }

    public function styles($sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 12],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FFFF9800']
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
                $lastRow = $sheet->getHighestRow();

                // Add title
                $sheet->mergeCells('A1:M1');
                $sheet->setCellValue('A1', 'DETAILED SHIFT INFORMATION');
                $sheet->getStyle('A1:M1')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 16],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                ]);

                // Set headings
                $headings = ['S.No', 'Employee', 'Shift ID', 'Date', 'Start Time', 'End Time', 
                            'Duration (Hrs)', 'Site', 'Contractor', 'Morning Hrs', 'Night Hrs', 
                            'Weekend Hrs', 'PH Hrs'];
                $col = 'A';
                $row = 3;
                foreach ($headings as $heading) {
                    $sheet->setCellValue($col . $row, $heading);
                    $sheet->getStyle($col . $row)->applyFromArray([
                        'font' => ['bold' => true, 'size' => 11, 'color' => ['argb' => 'FFFFFFFF']],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['argb' => 'FFFF9800']
                        ],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                    ]);
                    $col++;
                }

                // Apply borders
                $styleArray = [
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FF000000']
                        ]
                    ]
                ];
                
                if ($lastRow >= 3) {
                    $sheet->getStyle('A3:M' . $lastRow)->applyFromArray($styleArray);
                }
            },
        ];
    }
}

/**
 * Hours Breakdown Sheet
 */
class HoursBreakdownSheet implements FromArray, WithHeadings, WithStyles, WithColumnWidths, WithTitle, WithEvents
{
    private $timesheetData;

    public function __construct($timesheetData)
    {
        $this->timesheetData = $timesheetData;
    }

    public function title(): string
    {
        return 'Hours Breakdown';
    }

    public function headings(): array
    {
        return [
            'S.No',
            'Employee',
            'Total Hrs',
            'Morning',
            'Night',
            'Sat Morning',
            'Sat Night',
            'Sun Morning',
            'Sun Night',
            'PH Morning',
            'PH Night'
        ];
    }

    public function array(): array
    {
        $data = [];
        $sno = 1;
        
        foreach ($this->timesheetData as $employee) {
            $data[] = [
                $sno++,
                $employee['name'],
                number_format($employee['total_hours'], 2),
                number_format($employee['morning_hours'], 2),
                number_format($employee['night_hours'], 2),
                number_format($employee['saturday_morning_hours'], 2),
                number_format($employee['saturday_night_hours'], 2),
                number_format($employee['sunday_morning_hours'], 2),
                number_format($employee['sunday_night_hours'], 2),
                number_format($employee['ph_morning_hours'], 2),
                number_format($employee['ph_night_hours'], 2)
            ];
        }

        return $data;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 10,
            'B' => 30,
            'C' => 15,
            'D' => 15,
            'E' => 15,
            'F' => 15,
            'G' => 15,
            'H' => 15,
            'I' => 15,
            'J' => 15,
            'K' => 15,
        ];
    }

    public function styles($sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 12],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF9C27B0']
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
                $lastRow = $sheet->getHighestRow();

                // Add title
                $sheet->mergeCells('A1:K1');
                $sheet->setCellValue('A1', 'HOURS BREAKDOWN BY EMPLOYEE');
                $sheet->getStyle('A1:K1')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 16],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                ]);

                // Set headings
                $headings = ['S.No', 'Employee', 'Total Hrs', 'Morning', 'Night', 'Sat Morning', 
                            'Sat Night', 'Sun Morning', 'Sun Night', 'PH Morning', 'PH Night'];
                $col = 'A';
                $row = 3;
                foreach ($headings as $heading) {
                    $sheet->setCellValue($col . $row, $heading);
                    $sheet->getStyle($col . $row)->applyFromArray([
                        'font' => ['bold' => true, 'size' => 11, 'color' => ['argb' => 'FFFFFFFF']],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['argb' => 'FF9C27B0']
                        ],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                    ]);
                    $col++;
                }

                // Apply borders
                $styleArray = [
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FF000000']
                        ]
                    ]
                ];
                
                if ($lastRow >= 3) {
                    $sheet->getStyle('A3:K' . $lastRow)->applyFromArray($styleArray);
                }
            },
        ];
    }
}