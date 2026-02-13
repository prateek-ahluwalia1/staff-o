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
import { MOCK_SHIFTS } from "@/constants/mock-data";

const ContractorShifts: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shift Details"
        subtitle="View all shift assignments and statuses"
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Charge Rate</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell>£{shift.chargeRate}/hr</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        shift.status === "signed_in"
                          ? "bg-emerald-100 text-emerald-800"
                          : shift.status === "completed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-blue-100 text-blue-800"
                      }
                    >
                      {shift.status.replace("_", " ")}
                    </Badge>
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

export default ContractorShifts;
