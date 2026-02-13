import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_ROSTER } from "@/constants/mock-data";
import { Button } from "@/components/ui/button";

const CustomerRoster: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roster"
        subtitle="View staff schedules at your sites"
        actions={<Button>Request Schedule</Button>}
      />

      {MOCK_ROSTER.map((entry) => (
        <Card key={entry.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{entry.staffName}</CardTitle>
              <Badge variant="outline">{entry.siteName}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Week of {entry.weekStartDate}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {entry.shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between rounded-md border p-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{shift.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {shift.startTime} - {shift.endTime}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      shift.status === "completed"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {shift.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CustomerRoster;
