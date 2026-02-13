import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_JOB_POSTS } from "@/constants/mock-data";

const CustomerJobPosts: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Posts"
        subtitle="Post jobs and find staff"
        actions={<Button>Create Job Post</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_JOB_POSTS.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{job.title}</CardTitle>
                <Badge
                  variant="secondary"
                  className={
                    job.status === "open"
                      ? "bg-emerald-100 text-emerald-800"
                      : job.status === "assigned"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                  }
                >
                  {job.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{job.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Charge Rate</p>
                  <p className="font-medium">£{job.chargeRate}/hr</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Staff</p>
                  <p className="font-medium">
                    {job.assignedStaff}/{job.requiredStaff}
                  </p>
                </div>
              </div>
              {job.isBroadcast && <Badge variant="outline">Broadcast</Badge>}
              <Button variant="outline" className="w-full">
                View Applications
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerJobPosts;
