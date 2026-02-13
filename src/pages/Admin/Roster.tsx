import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_ROSTER, MOCK_SHIFTS } from "@/constants/mock-data";

const shiftStatusColor: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  signed_in: "bg-emerald-100 text-emerald-800",
  on_patrol: "bg-purple-100 text-purple-800",
  incident: "bg-red-100 text-red-800",
  signed_out: "bg-amber-100 text-amber-800",
  completed: "bg-gray-100 text-gray-800",
};

const AdminRoster: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roster Management"
        subtitle="Manage staff schedules and shift assignments"
        actions={<Button>Create Schedule</Button>}
      />

      <Tabs defaultValue="roster">
        <TabsList>
          <TabsTrigger value="roster">Weekly Roster</TabsTrigger>
          <TabsTrigger value="shifts">All Shifts</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-4 mt-4">
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
                        className={shiftStatusColor[shift.status]}
                      >
                        {shift.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="shifts" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Pay Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SHIFTS.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">
                        {shift.staffName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {shift.siteName}
                      </TableCell>
                      <TableCell>{shift.date}</TableCell>
                      <TableCell>
                        {shift.startTime} - {shift.endTime}
                      </TableCell>
                      <TableCell>£{shift.payRate}/hr</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={shiftStatusColor[shift.status]}
                        >
                          {shift.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminRoster;
