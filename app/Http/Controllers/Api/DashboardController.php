<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $now          = Carbon::now();
        $monthStart   = $now->copy()->startOfMonth()->toDateTimeString();
        $monthEnd     = $now->copy()->endOfMonth()->toDateTimeString();
        $sixMonthsAgo = $now->copy()->subMonths(5)->startOfMonth();

        // ── Generate last 6 months labels (including current) ─────────────
        $last6Months = [];
        for ($i = 5; $i >= 0; $i--) {
            $last6Months[] = $now->copy()->subMonths($i)->format('Y-m');
        }

        // ── 1. Total Users ─────────────────────────────────────────────────
        $totalUsers = DB::selectOne(
            "SELECT COUNT(*) AS count FROM users"
        )->count;

        // ── 2. Total Jobs ──────────────────────────────────────────────────
        $totalJobs = DB::selectOne(
            "SELECT COUNT(*) AS count FROM job_rosters"
        )->count;

        // ── 3. Total Revenue all time (from job_rosters.total_amount) ──────
        $totalRevenue = DB::selectOne(
            "SELECT COALESCE(SUM(job_amount), 0) AS total FROM job_rosters"
        )->total;

        // ── 4. This Month Revenue ──────────────────────────────────────────
        $thisMonthRevenue = DB::selectOne(
            "SELECT COALESCE(SUM(job_amount), 0) AS total
             FROM job_rosters
             WHERE start BETWEEN ? AND ?",
            [$monthStart, $monthEnd]
        )->total;

        // ── 5. Staff Count ─────────────────────────────────────────────────
        $staffCount = DB::selectOne(
            "SELECT COUNT(*) AS count FROM users WHERE user_type = 'staff'"
        )->count;

        // ── 6. Contractor Count ────────────────────────────────────────────
        $contractorCount = DB::selectOne(
            "SELECT COUNT(*) AS count FROM users WHERE user_type = 'contractor'"
        )->count;

        // ── 7. Customer Count ──────────────────────────────────────────────
        $customerCount = DB::selectOne(
            "SELECT COUNT(*) AS count FROM users WHERE user_type = 'customer'"
        )->count;

        // ── 8. Completed Shifts Count ──────────────────────────────────────
        $completedJobsCount = DB::selectOne(
            "SELECT COUNT(*) AS count FROM job_rosters WHERE job_status = 'completed'"
        )->count;

        // ── 9. Last 6 Months Revenue (fill missing months with 0) ─────────
        $last6MonthsRevenueRaw = DB::select(
            "SELECT
                DATE_FORMAT(start, '%Y-%m')     AS month,
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

        // ── 10. Last 6 Months Jobs — pending & completed ───────────────────
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

        // ── 11. Contractors with staff list, completed shifts & revenue ────
        //
        // Relationship:
        //   users.id          = contractor's primary key  (user_type = 'contractor')
        //   users.id          = staff's primary key       (user_type = 'staff')
        //   users.user_id     = contractor.id             (on staff row — links staff → contractor)
        //   job_rosters.assigned_to = staff.id
        // ──────────────────────────────────────────────────────────────────
        $contractors = DB::select(
            "SELECT id, name, email
             FROM users
             WHERE user_type = 'contractor'"
        );

        $contractorResult = [];

        if (!empty($contractors)) {

            $contractorIds = array_column($contractors, 'id');
            $placeholders  = implode(',', array_fill(0, count($contractorIds), '?'));

            // All staff belonging to these contractors (staff.user_id = contractor.id)
            $allStaff = DB::select(
                "SELECT id AS staff_id, name, email, user_id AS contractor_id
                 FROM users
                 WHERE user_type = 'staff'
                 AND user_id IN ($placeholders)",
                $contractorIds
            );

            $staffIds = array_column($allStaff, 'staff_id');

            // Group staff list by their contractor_id
            $staffByContractor = [];
            foreach ($allStaff as $staff) {
                $staffByContractor[$staff->contractor_id][] = [
                    'id'    => $staff->staff_id,
                    'name'  => $staff->name,
                    'email' => $staff->email,
                ];
            }

            // Current month jobs + revenue per contractor
            $jobStats = [];

            if (!empty($staffIds)) {
                $staffPlaceholders = implode(',', array_fill(0, count($staffIds), '?'));

                $jobs = DB::select(
                    "SELECT
                        jr.id                        AS job_id,
                        jr.assigned_to               AS staff_id,
                        jr.job_status,
                        COALESCE(jr.job_amount, 0) AS revenue,
                        u.user_id                    AS contractor_id
                     FROM job_rosters jr
                     INNER JOIN users u
                        ON u.id         = jr.assigned_to
                        AND u.user_type = 'staff'
                     WHERE jr.assigned_to IN ($staffPlaceholders)
                     AND jr.start BETWEEN ? AND ?",
                    array_merge($staffIds, [$monthStart, $monthEnd])
                );

                foreach ($jobs as $job) {
                    $cid = $job->contractor_id;

                    if (!isset($jobStats[$cid])) {
                        $jobStats[$cid] = [
                            'total_jobs'       => 0,
                            'completed_shifts' => 0,
                            'revenue'          => 0.0,
                        ];
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
                $stats = $jobStats[$cid] ?? [
                    'total_jobs'       => 0,
                    'completed_shifts' => 0,
                    'revenue'          => 0.0,
                ];

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

        // ── Final Response ─────────────────────────────────────────────────
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
}