import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_SHIFTS } from "@/constants/mock-data";

const statusColor: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  signed_in: "bg-emerald-100 text-emerald-800",
  on_patrol: "bg-purple-100 text-purple-800",
  signed_out: "bg-amber-100 text-amber-800",
  completed: "bg-gray-100 text-gray-800",
};

const StaffShifts: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Shifts"
        subtitle="View all your scheduled and past shifts"
      />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Pay Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SHIFTS.filter((s) => s.status !== "completed").map(
                    (shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium">
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
                            className={statusColor[shift.status]}
                          >
                            {shift.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Pay Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SHIFTS.filter((s) => s.status === "completed").map(
                    (shift) => (
                      <TableRow key={shift.id}>
                        <TableCell className="font-medium">
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
                            className={statusColor[shift.status]}
                          >
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffShifts;
