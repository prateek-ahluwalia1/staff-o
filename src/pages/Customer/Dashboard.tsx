import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_CUSTOMER_STATS,
  MOCK_JOB_POSTS,
  MOCK_SHIFTS,
} from "@/constants/mock-data";

const CustomerDashboard: React.FC = () => {
  const stats = MOCK_CUSTOMER_STATS;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Dashboard"
        subtitle="Overview of your sites and security services"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Sites"
          value={stats.activeSites}
          description="locations"
        />
        <StatCard
          title="Active Shifts"
          value={stats.activeShifts}
          description="today"
        />
        <StatCard
          title="Total Spent"
          value={`£${stats.totalSpent.toLocaleString()}`}
          description="all time"
        />
        <StatCard
          title="Open Job Posts"
          value={stats.openJobPosts}
          description="accepting applications"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Job Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_JOB_POSTS.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="text-xs text-muted-foreground">
                    £{job.chargeRate}/hr · {job.assignedStaff}/
                    {job.requiredStaff} staff
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    job.status === "open"
                      ? "bg-emerald-100 text-emerald-800"
                      : job.status === "in_progress"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                  }
                >
                  {job.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Shifts Today</CardTitle>
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

export default CustomerDashboard;
