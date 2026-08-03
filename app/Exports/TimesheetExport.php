<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
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

class TimesheetExport implements FromCollection, WithHeadings, WithStyles, WithColumnWidths, ShouldAutoSize, WithEvents
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
        
        // Debug log
        Log::info('=== TIMESHEET EXPORT DEBUG ===');
        Log::info('User Type: ' . $userType);
        Log::info('User Name: ' . $userName);
        Log::info('Data Count: ' . count($timesheetData));
        Log::info('Data Structure: ' . json_encode(array_keys($timesheetData[0] ?? [])));
    }

    public function collection()
    {
        Log::info('=== COLLECTION METHOD STARTED ===');
        
        $data = collect();
        
        // Check if data is empty
        if (empty($this->timesheetData)) {
            Log::warning('Timesheet data is empty in export');
            return collect([
                ['No data found for the selected period', '', '', '', '', '', '', '', '', '']
            ]);
        }

        // Debug first record
        Log::info('First record: ' . json_encode($this->timesheetData[0]));

        $shiftCounter = 1;
        
        foreach ($this->timesheetData as $employee) {
            Log::info('Processing employee: ' . ($employee['name'] ?? 'Unknown'));
            Log::info('Shifts count: ' . (isset($employee['shifts']) ? count($employee['shifts']) : 0));
            
            if (isset($employee['shifts']) && !empty($employee['shifts'])) {
                foreach ($employee['shifts'] as $shift) {
                    try {
                        // Debug shift data
                        Log::info('Processing shift: ' . json_encode(array_keys($shift)));
                        
                        $start = Carbon::parse($shift['start']);
                        $end = Carbon::parse($shift['end']);
                        $breakdown = $shift['hours_breakdown'] ?? [];
                        
                        // Calculate weekend hours
                        $weekend = ($breakdown['saturday_morning'] ?? 0) + ($breakdown['saturday_night'] ?? 0) + 
                                  ($breakdown['sunday_morning'] ?? 0) + ($breakdown['sunday_night'] ?? 0);
                        
                        $row = [
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
                        
                        Log::info('Added row: ' . json_encode($row));
                        $data->push($row);
                        
                    } catch (\Exception $e) {
                        Log::error('Error processing shift: ' . $e->getMessage());
                        Log::error('Shift data: ' . json_encode($shift));
                        $data->push([
                            'Shift ' . $shiftCounter++,
                            'Error',
                            'Invalid',
                            'Data',
                            '0.00',
                            'Error',
                            'Error',
                            '0.00',
                            '0.00',
                            '0.00'
                        ]);
                    }
                }
            } else {
                Log::info('No shifts found for employee');
                $data->push([
                    'No Shifts',
                    'No data',
                    '--',
                    '--',
                    '0.00',
                    '--',
                    '--',
                    '0.00',
                    '0.00',
                    '0.00'
                ]);
            }
        }

        Log::info('Total rows in Excel: ' . $data->count());
        Log::info('=== COLLECTION METHOD COMPLETED ===');
        
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
                Log::info('=== AFTER SHEET EVENT STARTED ===');
                
                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();
                $highestColumn = $sheet->getHighestColumn();
                
                Log::info('Highest Row: ' . $highestRow);
                Log::info('Highest Column: ' . $highestColumn);
                
                // Insert 6 rows at the top
                $sheet->insertNewRowBefore(1, 6);
                
                // Title
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

                // Empty row
                $sheet->mergeCells('A5:J5');
                $sheet->setCellValue('A5', '');
                
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
                $startRow = 6;
                $endRow = $sheet->getHighestRow();
                
                Log::info('Applying borders from row ' . $startRow . ' to ' . $endRow);
                
                if ($endRow >= $startRow) {
                    $sheet->getStyle('A6:' . $highestColumn . $endRow)->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['argb' => 'FF000000']
                            ]
                        ]
                    ]);

                    // Alternate row colors for better readability
                    for ($row = 7; $row <= $endRow; $row++) {
                        if ($row % 2 == 0) {
                            $sheet->getStyle('A' . $row . ':' . $highestColumn . $row)->applyFromArray([
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => ['argb' => 'FFF5F5F5']
                                ]
                            ]);
                        }
                    }
                    
                    // Center align all data
                    $sheet->getStyle('A7:' . $highestColumn . $endRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                }

                // Auto-size columns
                foreach (range('A', 'J') as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }

                // Freeze the header row
                $sheet->freezePane('A7');

                // Set row heights
                $sheet->getRowDimension(1)->setRowHeight(30);
                $sheet->getRowDimension(6)->setRowHeight(25);
                
                for ($row = 7; $row <= $endRow; $row++) {
                    $sheet->getRowDimension($row)->setRowHeight(20);
                }

                Log::info('=== AFTER SHEET EVENT COMPLETED ===');
            },
        ];
    }
}