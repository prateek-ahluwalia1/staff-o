import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_JOB_POSTS } from "@/constants/mock-data";

const StaffJobBoard: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Board"
        subtitle="Browse and apply for available positions"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_JOB_POSTS.filter((j) => j.status === "open").map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{job.title}</CardTitle>
                {job.isBroadcast && (
                  <Badge variant="outline" className="shrink-0">
                    Broadcast
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{job.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Pay Rate</p>
                  <p className="font-medium">£{job.payRate}/hr</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Site</p>
                  <p className="font-medium">{job.siteName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start</p>
                  <p className="font-medium">{job.startDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Positions</p>
                  <p className="font-medium">
                    {job.requiredStaff - job.assignedStaff} open
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {job.industry.replace("_", " ")}
              </Badge>
              <Button className="w-full">Apply Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StaffJobBoard;
