<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Illuminate\Support\Collection;

class PaysheetExport implements FromCollection, WithHeadings, WithStyles, WithColumnWidths, WithEvents
{
    protected array $employees;

    const HEADERS = [
        'State',
        'Site Name',
        'Site Level',
        'Staff',
        'Staff Phone',
        'Staff Type',
        'Customer',
        'Date',
        'Shift Start',
        'Shift End',
        'Sign In',
        'Sign Out',
        'Hours',
        'M-F Weekday',
        'M-F Day Rates',
        'M-F Weeknight',
        'M-F Night Rates',
        'Saturday',
        'Saturday Rates',
        'Sunday',
        'Sunday Rates',
        'Public Holiday Hours',
        'Public Holiday Rates',
        'Gross Amount',
    ];

    public function __construct(array $employees)
    {
        $this->employees = $employees;
    }

    // -------------------------------------------------------------------------
    // Build flat row collection: detail rows + subtotal row per employee
    // -------------------------------------------------------------------------
    public function collection(): Collection
    {
        $rows = [];

        foreach ($this->employees as $emp) {
            foreach ($emp['shift_collection'] as $shift) {
                $rows[] = [
                    $shift['state']                  ?? 'Victoria',
                    $shift['site_name']              ?? '',
                    $shift['site_level']             ?? '',
                    $emp['staff_name'],
                    $emp['staff_phone'],
                    $emp['staff_type'],
                    $emp['customer_name'],
                    $shift['date'],
                    $shift['shift_start'],
                    $shift['shift_end'],
                    $shift['sign_in'],
                    $shift['sign_out'],
                    $shift['hours'],
                    $shift['morning_hours'],
                    '$' . number_format($shift['mf_day_rate'], 2),
                    $shift['night_hours'],
                    '$' . number_format($shift['mf_night_rate'], 4),
                    $shift['saturday_morning_hours'] + $shift['saturday_night_hours'],
                    '$' . number_format($shift['saturday_morning_rate'], 4),
                    $shift['sunday_morning_hours']   + $shift['sunday_night_hours'],
                    '$' . number_format($shift['sunday_morning_rate'], 4),
                    $shift['ph_morning_hours']       + $shift['ph_night_hours'],
                    '$' . number_format($shift['ph_morning_rate'], 3),
                    '$' . number_format($shift['gross_amount'], 4),
                ];
            }

            // Subtotal row (blank most columns, fill hour/gross totals like the report)
            $rows[] = [
                '', '', '', '', '', '', '', '', '', '', '', '',
                $emp['total_hours'],
                $emp['total_morning_hours'],
                '',
                $emp['total_night_hours'],
                '',
                $emp['total_saturday_morning'] + $emp['total_saturday_night'],
                '',
                $emp['total_sunday_morning']   + $emp['total_sunday_night'],
                '',
                $emp['total_ph_morning']       + $emp['total_ph_night'],
                '',
                '$ ' . number_format($emp['total_gross'], 4),
            ];
        }

        return collect($rows);
    }

    public function headings(): array
    {
        return self::HEADERS;
    }

    // -------------------------------------------------------------------------
    // Column widths (A–X)
    // -------------------------------------------------------------------------
    public function columnWidths(): array
    {
        return [
            'A' =>  10,  // State
            'B' =>  50,  // Site Name
            'C' =>   8,  // Site Level
            'D' =>  25,  // Staff
            'E' =>  14,  // Staff Phone
            'F' =>  12,  // Staff Type
            'G' =>  20,  // Customer
            'H' =>  12,  // Date
            'I' =>  10,  // Shift Start
            'J' =>  10,  // Shift End
            'K' =>  10,  // Sign In
            'L' =>  10,  // Sign Out
            'M' =>   8,  // Hours
            'N' =>  12,  // M-F Weekday
            'O' =>  14,  // M-F Day Rates
            'P' =>  14,  // M-F Weeknight
            'Q' =>  16,  // M-F Night Rates
            'R' =>  10,  // Saturday
            'S' =>  16,  // Saturday Rates
            'T' =>   8,  // Sunday
            'U' =>  14,  // Sunday Rates
            'V' =>  22,  // Public Holiday Hours
            'W' =>  22,  // Public Holiday Rates
            'X' =>  16,  // Gross Amount
        ];
    }

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------
    public function styles(Worksheet $sheet): array
    {
        // Header row
        return [
            1 => [
                'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2E4057']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'wrapText' => true],
            ],
        ];
    }

    // -------------------------------------------------------------------------
    // After-sheet events: highlight subtotal rows, borders, freeze pane
    // -------------------------------------------------------------------------
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet     = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();
                $lastCol    = 'X';

                // Freeze header row
                $sheet->freezePane('A2');

                // Style all data rows
                for ($row = 2; $row <= $highestRow; $row++) {
                    $cellA = $sheet->getCell("A{$row}")->getValue();
                    $cellM = $sheet->getCell("M{$row}")->getValue();

                    // Detect subtotal rows: column A is empty, column M has a number
                    $isSubtotal = ($cellA === '' || $cellA === null) && is_numeric($cellM);

                    if ($isSubtotal) {
                        // Bold + light-grey background for subtotal rows
                        $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
                            'font' => ['bold' => true],
                            'fill' => [
                                'fillType'   => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'E8E8E8'],
                            ],
                        ]);
                        // Right-align the gross amount cell
                        $sheet->getStyle("X{$row}")->getAlignment()
                              ->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    } else {
                        // Alternating row shading
                        $fillColor = ($row % 2 === 0) ? 'F7F9FC' : 'FFFFFF';
                        $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
                            'fill' => [
                                'fillType'   => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => $fillColor],
                            ],
                        ]);
                    }

                    // Thin border on all rows
                    $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color'       => ['rgb' => 'D0D0D0'],
                            ],
                        ],
                    ]);

                    // Numeric column formats
                    $sheet->getStyle("M{$row}")->getNumberFormat()->setFormatCode('0.00');
                    $sheet->getStyle("N{$row}")->getNumberFormat()->setFormatCode('0.00');
                    $sheet->getStyle("P{$row}")->getNumberFormat()->setFormatCode('0.00');
                    $sheet->getStyle("R{$row}")->getNumberFormat()->setFormatCode('0.00');
                    $sheet->getStyle("T{$row}")->getNumberFormat()->setFormatCode('0.00');
                    $sheet->getStyle("V{$row}")->getNumberFormat()->setFormatCode('0.00');
                }

                // Outer border around entire table
                $sheet->getStyle("A1:{$lastCol}{$highestRow}")->applyFromArray([
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_MEDIUM,
                            'color'       => ['rgb' => '2E4057'],
                        ],
                    ],
                ]);

                // Header row height
                $sheet->getRowDimension(1)->setRowHeight(30);
            },
        ];
    }
}