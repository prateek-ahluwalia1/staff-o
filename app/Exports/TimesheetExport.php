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
    }

    /**
     * Convert data to array format for Excel
     */
    public function array(): array
    {
        $data = [];
        $sno = 1;
        
        if (empty($this->timesheetData)) {
            return [
                ['No data found for the selected period']
            ];
        }

        foreach ($this->timesheetData as $employee) {
            $row = [
                'S.No' => $sno++,
                'Employee Name' => $employee['name'] ?? 'N/A',
                'Total Hours' => isset($employee['total_hours']) ? number_format($employee['total_hours'], 2) : '0.00',
                'Morning Hours' => isset($employee['morning_hours']) ? number_format($employee['morning_hours'], 2) : '0.00',
                'Night Hours' => isset($employee['night_hours']) ? number_format($employee['night_hours'], 2) : '0.00',
                'Saturday Hours' => isset($employee['saturday_morning_hours']) && isset($employee['saturday_night_hours']) 
                    ? number_format($employee['saturday_morning_hours'] + $employee['saturday_night_hours'], 2) 
                    : '0.00',
                'Sunday Hours' => isset($employee['sunday_morning_hours']) && isset($employee['sunday_night_hours']) 
                    ? number_format($employee['sunday_morning_hours'] + $employee['sunday_night_hours'], 2) 
                    : '0.00',
                'PH Hours' => isset($employee['ph_morning_hours']) && isset($employee['ph_night_hours']) 
                    ? number_format($employee['ph_morning_hours'] + $employee['ph_night_hours'], 2) 
                    : '0.00',
                'Total Shifts' => isset($employee['shifts']) ? count($employee['shifts']) : 0,
                'Shift Details' => $this->getShiftDetails($employee['shifts'] ?? [])
            ];
            
            $data[] = $row;
        }

        return $data;
    }

    private function getShiftDetails($shifts)
    {
        if (empty($shifts)) {
            return 'No shifts';
        }
        
        $details = [];
        foreach ($shifts as $index => $shift) {
            try {
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
            } catch (\Exception $e) {
                $details[] = "Shift " . ($index + 1) . ": Invalid data";
            }
        }
        return implode("\n", $details);
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
            'Total Shifts',
            'Shift Details'
        ];
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
            'J' => 60,
        ];
    }

    public function styles($sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 12, 'color' => ['argb' => 'FFFFFFFF']],
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
                $lastRow = $sheet->getHighestRow();

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

                // Add report info
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

                // Only style headings if there is data
                if ($lastRow >= 6) {
                    // Set headings row
                    $headings = ['S.No', 'Employee Name', 'Total Hours', 'Morning Hours', 'Night Hours', 
                                'Saturday Hours', 'Sunday Hours', 'PH Hours', 'Total Shifts', 'Shift Details'];
                    $col = 'A';
                    $row = 6;
                    foreach ($headings as $heading) {
                        $sheet->setCellValue($col . $row, $heading);
                        $sheet->getStyle($col . $row)->applyFromArray([
                            'font' => ['bold' => true, 'size' => 11, 'color' => ['argb' => 'FFFFFFFF']],
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['argb' => 'FF2196F3']
                            ],
                            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 
                                           'vertical' => Alignment::VERTICAL_CENTER]
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
                        ],
                        'alignment' => [
                            'vertical' => Alignment::VERTICAL_TOP
                        ]
                    ];
                    
                    $sheet->getStyle('A6:J' . $lastRow)->applyFromArray($styleArray);

                    // Wrap text in Shift Details column
                    $sheet->getStyle('J6:J' . $lastRow)->getAlignment()->setWrapText(true);

                    // Auto size columns
                    foreach (range('A', 'J') as $col) {
                        $sheet->getColumnDimension($col)->setAutoSize(true);
                    }

                    // Set row height for shift details
                    for ($i = 7; $i <= $lastRow; $i++) {
                        $sheet->getRowDimension($i)->setRowHeight(60);
                    }
                }
            },
        ];
    }
}