import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_JOB_POSTS } from "@/constants/mock-data";

const statusColor: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const AdminJobPosts: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Posts"
        subtitle="Manage all job postings on the platform"
        actions={<Button>Create Job Post</Button>}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-4">
            <Input placeholder="Search jobs..." className="max-w-sm" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Pay Rate</TableHead>
                <TableHead>Charge Rate</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Broadcast</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_JOB_POSTS.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {job.siteName}
                  </TableCell>
                  <TableCell>£{job.payRate}/hr</TableCell>
                  <TableCell>£{job.chargeRate}/hr</TableCell>
                  <TableCell>
                    {job.assignedStaff}/{job.requiredStaff}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColor[job.status]}
                    >
                      {job.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.isBroadcast ? (
                      <Badge variant="outline">Broadcast</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Direct
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminJobPosts;
