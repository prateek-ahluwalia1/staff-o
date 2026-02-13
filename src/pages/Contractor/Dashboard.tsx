import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_CONTRACTOR_STATS,
  MOCK_JOB_POSTS,
  MOCK_SHIFTS,
} from "@/constants/mock-data";

const ContractorDashboard: React.FC = () => {
  const stats = MOCK_CONTRACTOR_STATS;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contractor Dashboard"
        subtitle="Manage your staff and operations"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Staff"
          value={stats.activeStaff}
          description="under contract"
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          description="currently running"
        />
        <StatCard
          title="Total Spent"
          value={`£${stats.totalSpent.toLocaleString()}`}
          description="all time"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          description="awaiting release"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_JOB_POSTS.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="text-xs text-muted-foreground">
                    £{job.chargeRate}/hr · {job.siteName}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  {job.assignedStaff}/{job.requiredStaff} staff
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Shifts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_SHIFTS.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{shift.staffName}</p>
                  <p className="text-xs text-muted-foreground">
                    {shift.siteName} · {shift.startTime}-{shift.endTime}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    shift.status === "signed_in"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  }
                >
                  {shift.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractorDashboard;
