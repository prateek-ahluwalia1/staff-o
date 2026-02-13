import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_ADMIN_STATS,
  MOCK_JOB_POSTS,
  MOCK_SHIFTS,
  MOCK_NOTIFICATIONS,
} from "@/constants/mock-data";
import { JobStatus, ShiftStatus } from "@/types";

const jobStatusColor: Record<string, string> = {
  [JobStatus.OPEN]: "bg-emerald-100 text-emerald-800",
  [JobStatus.ASSIGNED]: "bg-blue-100 text-blue-800",
  [JobStatus.IN_PROGRESS]: "bg-amber-100 text-amber-800",
  [JobStatus.COMPLETED]: "bg-gray-100 text-gray-800",
};

const shiftStatusColor: Record<string, string> = {
  [ShiftStatus.SIGNED_IN]: "bg-emerald-100 text-emerald-800",
  [ShiftStatus.SCHEDULED]: "bg-blue-100 text-blue-800",
  [ShiftStatus.COMPLETED]: "bg-gray-100 text-gray-800",
};

const AdminDashboard: React.FC = () => {
  const stats = MOCK_ADMIN_STATS;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of all operations"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Staff"
          value={stats.totalStaff}
          description="from last month"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          description="currently running"
        />
        <StatCard
          title="Revenue"
          value={`£${stats.totalRevenue.toLocaleString()}`}
          description="from last month"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Shifts"
          value={stats.activeShifts}
          description="today"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Job Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Job Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_JOB_POSTS.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {job.siteName} · £{job.payRate}/hr
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={jobStatusColor[job.status]}
                >
                  {job.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Shifts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Shifts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_SHIFTS.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{shift.staffName}</p>
                  <p className="text-xs text-muted-foreground">
                    {shift.siteName} · {shift.startTime} - {shift.endTime}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={shiftStatusColor[shift.status]}
                >
                  {shift.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_NOTIFICATIONS.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <div
                className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                  notif.isRead ? "bg-muted" : "bg-primary"
                }`}
              />
              <div className="space-y-1">
                <p className="text-sm font-medium">{notif.title}</p>
                <p className="text-xs text-muted-foreground">{notif.message}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
