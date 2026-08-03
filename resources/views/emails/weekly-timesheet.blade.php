<!DOCTYPE html>
<html>
<head>
    <title>Weekly Timesheet Report</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .header.admin { background-color: #ff9800; }
        .summary { background-color: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { margin-top: 30px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
        .badge-admin { background-color: #ff9800; color: white; }
        .badge-staff { background-color: #2196F3; color: white; }
        .badge-contractor { background-color: #4CAF50; color: white; }
        .personal-note { background-color: #e3f2fd; padding: 10px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #2196F3; }
        .attachment-box { background-color: #f0f7ff; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px dashed #2196F3; text-align: center; }
        .attachment-box .icon { font-size: 48px; display: block; margin-bottom: 10px; }
        .attachment-box .file-name { font-size: 18px; font-weight: bold; color: #2196F3; }
        .attachment-box .file-info { color: #666; font-size: 14px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .summary-item { background: white; padding: 10px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .summary-item .label { color: #666; font-size: 12px; }
        .summary-item .value { font-size: 18px; font-weight: bold; color: #333; }
        .employee-list { margin: 20px 0; }
        .employee-item { display: inline-block; background: #e8f5e9; padding: 5px 15px; margin: 5px; border-radius: 15px; font-size: 14px; }
        @media only screen and (max-width: 600px) {
            .container { padding: 10px; }
            .summary-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header {{ $isAdmin ? 'admin' : '' }}">
            <h1>{{ $isAdmin ? 'Weekly Timesheet Report' : 'Your Weekly Timesheet Report' }}</h1>
            <p>Week: {{ $dateRange }}</p>
        </div>

        <!-- SUMMARY -->
        <div class="summary">
            <h3>📊 Summary</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="label">Recipient</div>
                    <div class="value">{{ $userName }} <span class="badge badge-{{ $userType }}">{{ ucfirst($userType) }}</span></div>
                </div>
                @if($isAdmin)
                <div class="summary-item">
                    <div class="label">Total Employees</div>
                    <div class="value">{{ $employeeCount }}</div>
                </div>
                @endif
                <div class="summary-item">
                    <div class="label">Total Hours</div>
                    <div class="value">{{ $totalHours }} hrs</div>
                </div>
                <div class="summary-item">
                    <div class="label">Total Shifts</div>
                    <div class="value">{{ $totalShifts }}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Generated</div>
                    <div class="value" style="font-size: 14px;">{{ now()->format('d/m/Y H:i:s') }}</div>
                </div>
            </div>
        </div>

        @if(!$isAdmin)
            <div class="personal-note">
                <p><strong>📋 This report contains only your timesheet data for the week.</strong></p>
            </div>
        @endif

        <!-- EMPLOYEE LIST -->
        <div class="employee-list">
            <h4>👥 {{ $isAdmin ? 'All Employees' : 'Your Details' }}</h4>
            @if($isAdmin)
                @foreach($timesheetData as $employee)
                    <span class="employee-item">{{ $employee['name'] }} ({{ number_format($employee['total_hours'], 2) }} hrs)</span>
                @endforeach
            @else
                @foreach($timesheetData as $employee)
                    <p><strong>Name:</strong> {{ $employee['name'] }}</p>
                    <p><strong>Total Hours:</strong> {{ number_format($employee['total_hours'], 2) }} hours</p>
                    <p><strong>Total Shifts:</strong> {{ count($employee['shifts']) }}</p>
                @endforeach
            @endif
        </div>

        <!-- ATTACHMENT BOX -->
        <div class="attachment-box">
            <span class="icon">📊</span>
            <div class="file-name">timesheet_report_{{ now()->format('d_m_Y') }}.xlsx</div>
            <div class="file-info">
                <p>📎 This email contains an Excel file with complete timesheet details including:</p>
                <ul style="text-align: left; display: inline-block; margin: 10px auto;">
                    <li>📋 Summary - Overall timesheet summary</li>
                    <li>📅 Detailed Shifts - Complete shift-by-shift breakdown</li>
                    <li>📈 Hours Breakdown - Detailed hours analysis</li>
                </ul>
                <br>
                <span style="color: #4CAF50; font-weight: bold;">✅ Excel file is attached with this email</span>
            </div>
        </div>

        <!-- QUICK PREVIEW -->
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4>📌 Quick Preview</h4>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #4CAF50; color: white;">
                        <th style="padding: 8px; text-align: left;">Employee</th>
                        <th style="padding: 8px; text-align: center;">Total Hours</th>
                        <th style="padding: 8px; text-align: center;">Shifts</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($timesheetData as $employee)
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 8px;">{{ $employee['name'] }}</td>
                            <td style="padding: 8px; text-align: center;">{{ number_format($employee['total_hours'], 2) }}</td>
                            <td style="padding: 8px; text-align: center;">{{ count($employee['shifts']) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>This is an automated email sent from the Timesheet Management System.</p>
            <p>Please do not reply to this email.</p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                📎 For complete details, please open the attached Excel file.
            </p>
            @if(!$isAdmin)
                <p style="font-size: 12px; color: #999;">You received this because you have shifts in the system.</p>
            @endif
        </div>
    </div>
</body>
</html>