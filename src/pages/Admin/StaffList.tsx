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

const MOCK_STAFF_LIST = [
  {
    id: "usr_010",
    name: "Michael Roberts",
    email: "michael@staffo.com",
    phone: "+44 7700 001",
    industry: "Capital Security",
    status: "active",
    rating: 4.8,
    shifts: 156,
  },
  {
    id: "usr_011",
    name: "Sarah Chen",
    email: "sarah@staffo.com",
    phone: "+44 7700 002",
    industry: "Construction",
    status: "active",
    rating: 4.5,
    shifts: 89,
  },
  {
    id: "usr_012",
    name: "David Okafor",
    email: "david@staffo.com",
    phone: "+44 7700 003",
    industry: "Cleaning",
    status: "active",
    rating: 4.7,
    shifts: 212,
  },
  {
    id: "usr_013",
    name: "Emma Wilson",
    email: "emma@staffo.com",
    phone: "+44 7700 004",
    industry: "Capital Security",
    status: "inactive",
    rating: 4.2,
    shifts: 45,
  },
  {
    id: "usr_014",
    name: "James Patel",
    email: "james@staffo.com",
    phone: "+44 7700 005",
    industry: "Construction",
    status: "pending",
    rating: 0,
    shifts: 0,
  },
];

const StaffList: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        subtitle="Manage all registered staff members"
        actions={<Button>Add Staff</Button>}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-4">
            <Input placeholder="Search staff..." className="max-w-sm" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Shifts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_STAFF_LIST.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {staff.email}
                  </TableCell>
                  <TableCell>{staff.industry}</TableCell>
                  <TableCell>
                    {staff.rating > 0 ? `${staff.rating} ★` : "N/A"}
                  </TableCell>
                  <TableCell>{staff.shifts}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        staff.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : staff.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {staff.status}
                    </Badge>
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

export default StaffList;
