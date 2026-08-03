<!DOCTYPE html>
<html>
<head>
    <title>Weekly Timesheet Report</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0A7C6E; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .header.admin { background-color: #0A7C6E; }
        .summary { background-color: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #0A7C6E; color: white; padding: 12px; text-align: left; }
        th.admin-th { background-color: #0A7C6E; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        tr:hover { background-color: #f5f5f5; }
        .shift-details { background-color: #f9f9f9; padding: 10px; margin: 5px 0; border-radius: 3px; }
        .footer { margin-top: 30px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
        .badge-admin { background-color: #ff9800; color: white; }
        .badge-staff { background-color: #2196F3; color: white; }
        .badge-contractor { background-color: #4CAF50; color: white; }
        .hours-breakdown { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .hours-breakdown ul { list-style-type: none; padding: 0; }
        .hours-breakdown ul li { padding: 5px 0; border-bottom: 1px solid #eee; }
        .personal-note { background-color: #e3f2fd; padding: 10px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #2196F3; }
        .employee-card { background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #4CAF50; }
        .employee-card.admin-card { border-left-color: #0A7C6E; }
        .site-name { color: #666; font-size: 14px; }
        .contractor-name { color: #2196F3; font-size: 14px; }
        .shift-details p { margin: 5px 0; }
        .shift-details strong { color: #333; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .summary-item { background: white; padding: 10px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .summary-item .label { color: #666; font-size: 12px; }
        .summary-item .value { font-size: 18px; font-weight: bold; color: #333; }
        .date-time { font-size: 14px; }
        @media only screen and (max-width: 600px) {
            table { font-size: 12px; }
            th, td { padding: 8px; }
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

        @if($isAdmin)
            {{-- ADMIN VIEW - Shows all employees data --}}
            <h3>👥 All Employees Timesheet</h3>
            <table>
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Total Hours</th>
                        <th>Morning</th>
                        <th>Night</th>
                        <th>Sat Morning</th>
                        <th>Sat Night</th>
                        <th>Sun Morning</th>
                        <th>Sun Night</th>
                        <th>PH Morning</th>
                        <th>PH Night</th>
                        <th>Shifts</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($timesheetData as $employee)
                        <tr>
                            <td><strong>{{ $employee['name'] }}</strong></td>
                            <td><strong>{{ number_format($employee['total_hours'], 2) }}</strong></td>
                            <td>{{ number_format($employee['morning_hours'], 2) }}</td>
                            <td>{{ number_format($employee['night_hours'], 2) }}</td>
                            <td>{{ number_format($employee['saturday_morning_hours'], 2) }}</td>
                            <td>{{ number_format($employee['saturday_night_hours'], 2) }}</td>
                            <td>{{ number_format($employee['sunday_morning_hours'], 2) }}</td>
                            <td>{{ number_format($employee['sunday_night_hours'], 2) }}</td>
                            <td>{{ number_format($employee['ph_morning_hours'], 2) }}</td>
                            <td>{{ number_format($employee['ph_night_hours'], 2) }}</td>
                            <td>{{ count($employee['shifts']) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            {{-- Show detailed shift info for admins --}}
            <h3>📋 Detailed Shift Information</h3>
            @foreach($timesheetData as $employee)
                <div class="employee-card admin-card">
                    <h4>{{ $employee['name'] }}</h4>
                    <p><strong>Total Hours:</strong> {{ number_format($employee['total_hours'], 2) }} hours</p>
                    <p><strong>Shifts:</strong> {{ count($employee['shifts']) }}</p>
                    
                    @foreach($employee['shifts'] as $shift)
                        <div class="shift-details">
                            <p>
                                <strong>Shift #{{ $loop->iteration }}:</strong>
                                {{ \Carbon\Carbon::parse($shift['start'])->format('d/m/Y H:i') }} - 
                                {{ \Carbon\Carbon::parse($shift['end'])->format('d/m/Y H:i') }}
                                <br>
                                <span class="site-name">📍 Site: {{ $shift['site_name'] ?? 'N/A' }}</span>
                                @if(isset($shift['contractor_name']))
                                    <span class="contractor-name"> | 🏢 Contractor: {{ $shift['contractor_name'] }}</span>
                                @endif
                            </p>
                        </div>
                    @endforeach
                </div>
            @endforeach

        @else
            {{-- STAFF/CONTRACTOR VIEW - Shows only their own data --}}
            <div class="personal-note">
                <p><strong>📋 This report contains only your timesheet data for the week.</strong></p>
            </div>

            @foreach($timesheetData as $employee)
                <div class="employee-card">
                    <h4>👤 Your Timesheet</h4>
                    <p><strong>Name:</strong> {{ $employee['name'] }}</p>
                    <p><strong>Total Hours:</strong> {{ number_format($employee['total_hours'], 2) }} hours</p>
                    
                    <div class="hours-breakdown">
                        <h5>📈 Hours Breakdown:</h5>
                        <ul>
                            <li><strong>Morning:</strong> {{ number_format($employee['morning_hours'], 2) }} hours</li>
                            <li><strong>Night:</strong> {{ number_format($employee['night_hours'], 2) }} hours</li>
                            <li><strong>Saturday Morning:</strong> {{ number_format($employee['saturday_morning_hours'], 2) }} hours</li>
                            <li><strong>Saturday Night:</strong> {{ number_format($employee['saturday_night_hours'], 2) }} hours</li>
                            <li><strong>Sunday Morning:</strong> {{ number_format($employee['sunday_morning_hours'], 2) }} hours</li>
                            <li><strong>Sunday Night:</strong> {{ number_format($employee['sunday_night_hours'], 2) }} hours</li>
                            <li><strong>Public Holiday Morning:</strong> {{ number_format($employee['ph_morning_hours'], 2) }} hours</li>
                            <li><strong>Public Holiday Night:</strong> {{ number_format($employee['ph_night_hours'], 2) }} hours</li>
                        </ul>
                    </div>

                    <h5>📅 Your Shifts ({{ count($employee['shifts']) }}):</h5>
                    @foreach($employee['shifts'] as $shift)
                        <div class="shift-details">
                            <p>
                                <strong>Shift #{{ $loop->iteration }}:</strong>
                                {{ \Carbon\Carbon::parse($shift['start'])->format('d/m/Y H:i') }} - 
                                {{ \Carbon\Carbon::parse($shift['end'])->format('d/m/Y H:i') }}
                                <br>
                                <span class="site-name">📍 Site: {{ $shift['site_name'] ?? 'N/A' }}</span>
                                @if(isset($shift['contractor_name']))
                                    <span class="contractor-name"> | 🏢 Contractor: {{ $shift['contractor_name'] }}</span>
                                @endif
                            </p>
                        </div>
                    @endforeach
                </div>
            @endforeach
        @endif

        <!-- FOOTER -->
        <div class="footer">
            <p>This is an automated email sent from the Timesheet Management System.</p>
            <p>Please do not reply to this email.</p>
            @if(!$isAdmin)
                <p style="font-size: 12px; color: #999; margin-top: 10px;">You received this because you have shifts in the system.</p>
            @endif
        </div>
    </div>
</body>
</html>