import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_STAFF_STATS,
  MOCK_SHIFTS,
  MOCK_JOB_POSTS,
} from "@/constants/mock-data";

const StaffDashboard: React.FC = () => {
  const stats = MOCK_STAFF_STATS;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        subtitle="Your shift overview and activity"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Upcoming Shifts"
          value={stats.upcomingShifts}
          description="this week"
        />
        <StatCard
          title="Completed Shifts"
          value={stats.completedShifts}
          description="total"
        />
        <StatCard
          title="Total Earnings"
          value={`£${stats.totalEarnings.toLocaleString()}`}
          description="all time"
        />
        <StatCard
          title="Rating"
          value={`${stats.rating} ★`}
          description="out of 5"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_SHIFTS.filter((s) => s.status === "scheduled").map(
              (shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{shift.siteName}</p>
                    <p className="text-xs text-muted-foreground">
                      {shift.date} · {shift.startTime} - {shift.endTime}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    Scheduled
                  </Badge>
                </div>
              ),
            )}
            {MOCK_SHIFTS.filter((s) => s.status === "scheduled").length ===
              0 && (
              <p className="text-sm text-muted-foreground">
                No upcoming shifts
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_JOB_POSTS.filter((j) => j.status === "open").map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="text-xs text-muted-foreground">
                    £{job.payRate}/hr · {job.siteName}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-800"
                >
                  Apply
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;
