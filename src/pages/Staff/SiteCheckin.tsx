import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_SHIFTS } from "@/constants/mock-data";

const SiteCheckin: React.FC = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const currentTime = new Date().toLocaleTimeString();
  const todayShifts = MOCK_SHIFTS.filter(
    (s) => s.status === "scheduled" || s.status === "signed_in",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Check-in"
        subtitle="Sign in/out with timestamp and face recognition"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Check-in Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {checkedIn ? "You are Signed In" : "Ready to Sign In"}
            </CardTitle>
            <CardDescription>Current time: {currentTime}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
              <div className="text-center space-y-2">
                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Face recognition camera
                </p>
              </div>
            </div>

            {checkedIn ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setCheckedIn(false)}
              >
                Sign Out
              </Button>
            ) : (
              <Button className="w-full" onClick={() => setCheckedIn(true)}>
                Sign In with Face Recognition
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Today's Shifts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Today&apos;s Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayShifts.map((shift) => (
              <div key={shift.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{shift.siteName}</p>
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
                <p className="text-sm text-muted-foreground">
                  {shift.startTime} - {shift.endTime}
                </p>
                {shift.signInTimestamp && (
                  <p className="text-xs text-muted-foreground">
                    Signed in:{" "}
                    {new Date(shift.signInTimestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SiteCheckin;
