<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // ── Get authenticated user via Sanctum Bearer token ────────────────
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        return match ($user->user_type) {
            'admin'      => $this->adminDashboard(),
            'staff'      => $this->staffDashboard($user),
            'customer'   => $this->customerDashboard($user),
            'contractor' => $this->contractorDashboard($user),
            default      => response()->json(['success' => false, 'message' => 'Unknown user type'], 403),
        };
    }

    // =========================================================================
    // ADMIN DASHBOARD
    // =========================================================================
    private function adminDashboard(): JsonResponse
    {
        $now          = Carbon::now();
        $monthStart   = $now->copy()->startOfMonth()->toDateTimeString();
        $monthEnd     = $now->copy()->endOfMonth()->toDateTimeString();
        $sixMonthsAgo = $now->copy()->subMonths(5)->startOfMonth();

        $last6Months = [];
        for ($i = 5; $i >= 0; $i--) {
            $last6Months[] = $now->copy()->subMonths($i)->format('Y-m');
        }

        $totalUsers = DB::selectOne(
            "SELECT COUNT(*) AS count FROM users"
        )->count;

        $totalJobs = DB::selectOne(
            "SELECT COUNT(*) AS count FROM job_rosters"
        )->count;

        $totalRevenue = DB::selectOne(
            "SELECT COALESCE(SUM(job_amount), 0) AS total FROM job_rosters"
        )->total;

        $thisMonthRevenue = DB::selectOne(
            "SELECT COALESCE(SUM(job_amount), 0) AS total
             FROM job_rosters
             WHERE start BETWEEN ? AND ?",
            [$monthStart, $monthEnd]
        )->total;

        $staffCount = DB::selectOne(
            "SELECT COUNT(*) AS count FROM users WHERE user_type = 'staff'"
        )->count;

        $contractorCount = DB::selectOne(
            "SELECT COUNT(*) AS count FROM users WHERE user_type = 'contractor'"
        )->count;

        $customerCount = DB::selectOne(
            "SELECT COUNT(*) AS count FROM users WHERE user_type = 'customer'"
        )->count;

        $completedJobsCount = DB::selectOne(
            "SELECT COUNT(*) AS count FROM job_rosters WHERE job_status = 'completed'"
        )->count;

        // Last 6 months revenue
        $last6MonthsRevenueRaw = DB::select(
            "SELECT
                DATE_FORMAT(start, '%Y-%m')   AS month,
                COALESCE(SUM(job_amount), 0)  AS revenue
             FROM job_rosters
             WHERE start >= ?
             GROUP BY DATE_FORMAT(start, '%Y-%m')
             ORDER BY month ASC",
            [$sixMonthsAgo->toDateTimeString()]
        );

        $revenueMap = [];
        foreach ($last6MonthsRevenueRaw as $item) {
            $revenueMap[$item->month] = (float) $item->revenue;
        }

        $last6MonthsRevenue = [];
        foreach ($last6Months as $month) {
            $last6MonthsRevenue[] = [
                'month'   => $month,
                'revenue' => $revenueMap[$month] ?? 0,
            ];
        }

        // Last 6 months jobs
        $last6MonthsJobsRaw = DB::select(
            "SELECT
                DATE_FORMAT(start, '%Y-%m')                           AS month,
                COUNT(CASE WHEN job_status = 'pending'   THEN 1 END) AS pending_jobs,
                COUNT(CASE WHEN job_status = 'completed' THEN 1 END) AS completed_jobs
             FROM job_rosters
             WHERE start >= ?
             GROUP BY DATE_FORMAT(start, '%Y-%m')
             ORDER BY month ASC",
            [$sixMonthsAgo->toDateTimeString()]
        );

        $jobsMap = [];
        foreach ($last6MonthsJobsRaw as $item) {
            $jobsMap[$item->month] = [
                'pending_jobs'   => (int) $item->pending_jobs,
                'completed_jobs' => (int) $item->completed_jobs,
            ];
        }

        $last6MonthsJobs = [];
        foreach ($last6Months as $month) {
            $last6MonthsJobs[] = [
                'month'          => $month,
                'pending_jobs'   => $jobsMap[$month]['pending_jobs']   ?? 0,
                'completed_jobs' => $jobsMap[$month]['completed_jobs'] ?? 0,
            ];
        }

        // Contractors with staff, completed shifts & revenue (current month)
        $contractors      = DB::select("SELECT id, name, email FROM users WHERE user_type = 'contractor'");
        $contractorResult = [];

        if (!empty($contractors)) {
            $contractorIds = array_column($contractors, 'id');
            $placeholders  = implode(',', array_fill(0, count($contractorIds), '?'));

            $allStaff = DB::select(
                "SELECT id AS staff_id, name, email, user_id AS contractor_id
                 FROM users
                 WHERE user_type = 'staff'
                 AND user_id IN ($placeholders)",
                $contractorIds
            );

            $staffIds = array_column($allStaff, 'staff_id');

            $staffByContractor = [];
            foreach ($allStaff as $staff) {
                $staffByContractor[$staff->contractor_id][] = [
                    'id'    => $staff->staff_id,
                    'name'  => $staff->name,
                    'email' => $staff->email,
                ];
            }

            $jobStats = [];
            if (!empty($staffIds)) {
                $staffPlaceholders = implode(',', array_fill(0, count($staffIds), '?'));
                $jobs = DB::select(
                    "SELECT
                        jr.assigned_to             AS staff_id,
                        jr.job_status,
                        COALESCE(jr.job_amount, 0) AS revenue,
                        u.user_id                  AS contractor_id
                     FROM job_rosters jr
                     INNER JOIN users u
                        ON u.id = jr.assigned_to AND u.user_type = 'staff'
                     WHERE jr.assigned_to IN ($staffPlaceholders)
                     AND jr.start BETWEEN ? AND ?",
                    array_merge($staffIds, [$monthStart, $monthEnd])
                );

                foreach ($jobs as $job) {
                    $cid = $job->contractor_id;
                    if (!isset($jobStats[$cid])) {
                        $jobStats[$cid] = ['total_jobs' => 0, 'completed_shifts' => 0, 'revenue' => 0.0];
                    }
                    $jobStats[$cid]['total_jobs']++;
                    $jobStats[$cid]['revenue'] += (float) $job->revenue;
                    if ($job->job_status === 'completed') {
                        $jobStats[$cid]['completed_shifts']++;
                    }
                }
            }

            foreach ($contractors as $contractor) {
                $cid   = $contractor->id;
                $stats = $jobStats[$cid] ?? ['total_jobs' => 0, 'completed_shifts' => 0, 'revenue' => 0.0];
                $contractorResult[] = [
                    'id'               => $cid,
                    'name'             => $contractor->name,
                    'email'            => $contractor->email,
                    'staff_count'      => count($staffByContractor[$cid] ?? []),
                    'total_jobs'       => $stats['total_jobs'],
                    'completed_shifts' => $stats['completed_shifts'],
                    'revenue'          => $stats['revenue'],
                    'staff'            => $staffByContractor[$cid] ?? [],
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'total_users'           => (int)   $totalUsers,
                'total_jobs'            => (int)   $totalJobs,
                'total_revenue'         => (float) $totalRevenue,
                'this_month_revenue'    => (float) $thisMonthRevenue,
                'staff_count'           => (int)   $staffCount,
                'contractor_count'      => (int)   $contractorCount,
                'customer_count'        => (int)   $customerCount,
                'completed_jobs_count'  => (int)   $completedJobsCount,
                'last_6_months_revenue' => $last6MonthsRevenue,
                'last_6_months_jobs'    => $last6MonthsJobs,
                'contractors'           => $contractorResult,
            ],
        ]);
    }

    // =========================================================================
    // STAFF DASHBOARD
    // job_rosters.assigned_to = staff.id
    // earned this month = SUM(job_amount) where payment_status = 'paid'
    // =========================================================================
    private function staffDashboard($user): JsonResponse
    {
        $now          = Carbon::now();
        $monthStart   = $now->copy()->startOfMonth()->toDateTimeString();
        $monthEnd     = $now->copy()->endOfMonth()->toDateTimeString();
        $sixMonthsAgo = $now->copy()->subMonths(5)->startOfMonth();
        $staffId      = $user->id;

        $last6Months = [];
        for ($i = 5; $i >= 0; $i--) {
            $last6Months[] = $now->copy()->subMonths($i)->format('Y-m');
        }

        // Total assigned jobs (all time)
        $totalAssignedJobs = DB::selectOne(
            "SELECT COUNT(*) AS count
             FROM job_rosters
             WHERE assigned_to = ?",
            [$staffId]
        )->count;

        // Completed jobs
        $completedJobs = DB::selectOne(
            "SELECT COUNT(*) AS count
             FROM job_rosters
             WHERE assigned_to = ? AND job_status = 'completed'",
            [$staffId]
        )->count;

        // Pending jobs
        $pendingJobs = DB::selectOne(
            "SELECT COUNT(*) AS count
             FROM job_rosters
             WHERE assigned_to = ? AND job_status = 'pending'",
            [$staffId]
        )->count;

        // Earned this month (only paid)
        $earnedThisMonth = DB::selectOne(
            "SELECT COALESCE(SUM(job_amount), 0) AS total
             FROM job_rosters
             WHERE assigned_to    = ?
             AND payment_status   = 'paid'
             AND start BETWEEN ? AND ?",
            [$staffId, $monthStart, $monthEnd]
        )->total;

        // Last 6 months shifts — pending & completed
        $last6MonthsShiftsRaw = DB::select(
            "SELECT
                DATE_FORMAT(start, '%Y-%m')                           AS month,
                COUNT(CASE WHEN job_status = 'pending'   THEN 1 END) AS pending_shifts,
                COUNT(CASE WHEN job_status = 'completed' THEN 1 END) AS completed_shifts
             FROM job_rosters
             WHERE assigned_to = ?
             AND start >= ?
             GROUP BY DATE_FORMAT(start, '%Y-%m')
             ORDER BY month ASC",
            [$staffId, $sixMonthsAgo->toDateTimeString()]
        );

        $shiftsMap = [];
        foreach ($last6MonthsShiftsRaw as $item) {
            $shiftsMap[$item->month] = [
                'pending_shifts'   => (int) $item->pending_shifts,
                'completed_shifts' => (int) $item->completed_shifts,
            ];
        }

        $last6MonthsShifts = [];
        foreach ($last6Months as $month) {
            $last6MonthsShifts[] = [
                'month'            => $month,
                'pending_shifts'   => $shiftsMap[$month]['pending_shifts']   ?? 0,
                'completed_shifts' => $shiftsMap[$month]['completed_shifts'] ?? 0,
            ];
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'total_assigned_jobs'  => (int)   $totalAssignedJobs,
                'completed_jobs'       => (int)   $completedJobs,
                'pending_jobs'         => (int)   $pendingJobs,
                'earned_this_month'    => (float) $earnedThisMonth,
                'last_6_months_shifts' => $last6MonthsShifts,
            ],
        ]);
    }

    // =========================================================================
    // CUSTOMER DASHBOARD
    // job_rosters.created_by = customer.id
    // total_spend = SUM(job_amount) + 10% service charge
    // =========================================================================
    private function customerDashboard($user): JsonResponse
    {
        $now          = Carbon::now();
        $sixMonthsAgo = $now->copy()->subMonths(5)->startOfMonth();
        $weekStart    = $now->copy()->startOfWeek()->toDateTimeString();
        $weekEnd      = $now->copy()->endOfWeek()->toDateTimeString();
        $customerId   = $user->id;

        $last6Months = [];
        for ($i = 5; $i >= 0; $i--) {
            $last6Months[] = $now->copy()->subMonths($i)->format('Y-m');
        }

        // Total jobs
        $totalJobs = DB::selectOne(
            "SELECT COUNT(*) AS count
             FROM job_rosters
             WHERE created_by = ?",
            [$customerId]
        )->count;

        // Completed jobs
        $completedJobs = DB::selectOne(
            "SELECT COUNT(*) AS count
             FROM job_rosters
             WHERE created_by = ? AND job_status = 'completed'",
            [$customerId]
        )->count;

        // Distinct staff assigned to customer's jobs
        $staffAssigned = DB::selectOne(
            "SELECT COUNT(*) AS count
             FROM job_rosters
             WHERE created_by = ? AND assigned_to IS NOT NULL",
            [$customerId]
        )->count;

        // Total spend = SUM(job_amount) + 10% service charge
        $rawAmount  = DB::selectOne(
            "SELECT COALESCE(SUM(job_amount), 0) AS total
             FROM job_rosters
             WHERE created_by = ?",
            [$customerId]
        )->total;
        $totalSpend = round((float) $rawAmount * 1.10, 2);

        // Last 6 months jobs
        $last6MonthsJobsRaw = DB::select(
            "SELECT
                DATE_FORMAT(start, '%Y-%m')                           AS month,
                COUNT(CASE WHEN job_status = 'pending'   THEN 1 END) AS pending_jobs,
                COUNT(CASE WHEN job_status = 'completed' THEN 1 END) AS completed_jobs
             FROM job_rosters
             WHERE created_by = ?
             AND start >= ?
             GROUP BY DATE_FORMAT(start, '%Y-%m')
             ORDER BY month ASC",
            [$customerId, $sixMonthsAgo->toDateTimeString()]
        );

        $jobsMap = [];
        foreach ($last6MonthsJobsRaw as $item) {
            $jobsMap[$item->month] = [
                'pending_jobs'   => (int) $item->pending_jobs,
                'completed_jobs' => (int) $item->completed_jobs,
            ];
        }

        $last6MonthsJobs = [];
        foreach ($last6Months as $month) {
            $last6MonthsJobs[] = [
                'month'          => $month,
                'pending_jobs'   => $jobsMap[$month]['pending_jobs']   ?? 0,
                'completed_jobs' => $jobsMap[$month]['completed_jobs'] ?? 0,
            ];
        }

        // This week's jobs list with assigned staff name
        $thisWeekJobs = DB::select(
            "SELECT
                jr.id,
                jr.job_status,
                jr.job_amount,
                jr.start,
                jr.end,
                u.name  AS assigned_staff_name,
                u.email AS assigned_staff_email
             FROM job_rosters jr
             LEFT JOIN users u
                ON u.id = jr.assigned_to AND u.user_type = 'staff'
             WHERE jr.created_by = ?
             AND jr.start BETWEEN ? AND ?
             ORDER BY jr.start ASC",
            [$customerId, $weekStart, $weekEnd]
        );

        return response()->json([
            'success' => true,
            'data'    => [
                'total_jobs'         => (int)   $totalJobs,
                'completed_jobs'     => (int)   $completedJobs,
                'staff_assigned'     => (int)   $staffAssigned,
                'total_spend'        => (float) $totalSpend,
                'last_6_months_jobs' => $last6MonthsJobs,
                'this_week_jobs'     => $thisWeekJobs,
            ],
        ]);
    }

    // =========================================================================
    // CONTRACTOR DASHBOARD
    // staff.user_id = contractor.id  →  job_rosters.assigned_to = staff.id
    // =========================================================================
    private function contractorDashboard($user): JsonResponse
    {
        $now          = Carbon::now();
        $sixMonthsAgo = $now->copy()->subMonths(5)->startOfMonth();
        $contractorId = $user->id;

        $last6Months = [];
        for ($i = 5; $i >= 0; $i--) {
            $last6Months[] = $now->copy()->subMonths($i)->format('Y-m');
        }

        // All staff under this contractor (staff.user_id = contractor.id)
        $staffRows          = DB::select(
            "SELECT id AS staff_id FROM users WHERE user_type = 'staff' AND user_id = ?",
            [$contractorId]
        );
        $staffIds           = array_column($staffRows, 'staff_id');
        $totalAssignedStaff = count($staffIds);

        // Empty state if no staff
        if (empty($staffIds)) {
            return response()->json([
                'success' => true,
                'data'    => [
                    'total_assigned_staff' => 0,
                    'active_jobs'          => 0,
                    'completed_jobs'       => 0,
                    'last_6_months_jobs'   => array_map(fn($m) => [
                        'month'          => $m,
                        'pending_jobs'   => 0,
                        'completed_jobs' => 0,
                    ], $last6Months),
                ],
            ]);
        }

        $staffPlaceholders = implode(',', array_fill(0, count($staffIds), '?'));

        // Active jobs (ongoing)
        $activeJobs = DB::selectOne(
            "SELECT COUNT(*) AS count
             FROM job_rosters
             WHERE assigned_to IN ($staffPlaceholders)
             AND job_status = 'ongoing'",
            $staffIds
        )->count;

        // Completed jobs
        $completedJobs = DB::selectOne(
            "SELECT COUNT(*) AS count
             FROM job_rosters
             WHERE assigned_to IN ($staffPlaceholders)
             AND job_status = 'completed'",
            $staffIds
        )->count;

        // Last 6 months jobs
        $last6MonthsJobsRaw = DB::select(
            "SELECT
                DATE_FORMAT(start, '%Y-%m')                           AS month,
                COUNT(CASE WHEN job_status = 'pending'   THEN 1 END) AS pending_jobs,
                COUNT(CASE WHEN job_status = 'completed' THEN 1 END) AS completed_jobs
             FROM job_rosters
             WHERE assigned_to IN ($staffPlaceholders)
             AND start >= ?
             GROUP BY DATE_FORMAT(start, '%Y-%m')
             ORDER BY month ASC",
            array_merge($staffIds, [$sixMonthsAgo->toDateTimeString()])
        );

        $jobsMap = [];
        foreach ($last6MonthsJobsRaw as $item) {
            $jobsMap[$item->month] = [
                'pending_jobs'   => (int) $item->pending_jobs,
                'completed_jobs' => (int) $item->completed_jobs,
            ];
        }

        $last6MonthsJobs = [];
        foreach ($last6Months as $month) {
            $last6MonthsJobs[] = [
                'month'          => $month,
                'pending_jobs'   => $jobsMap[$month]['pending_jobs']   ?? 0,
                'completed_jobs' => $jobsMap[$month]['completed_jobs'] ?? 0,
            ];
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'total_assigned_staff' => (int) $totalAssignedStaff,
                'active_jobs'          => (int) $activeJobs,
                'completed_jobs'       => (int) $completedJobs,
                'last_6_months_jobs'   => $last6MonthsJobs,
            ],
        ]);
    }
}