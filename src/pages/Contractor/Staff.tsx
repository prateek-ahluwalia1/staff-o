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

const MOCK_CONTRACTOR_STAFF = [
  {
    id: "s1",
    name: "Michael Roberts",
    role: "Security Guard",
    status: "on_shift",
    rating: 4.8,
  },
  {
    id: "s2",
    name: "Sarah Chen",
    role: "Security Guard",
    status: "on_shift",
    rating: 4.5,
  },
  {
    id: "s3",
    name: "David Okafor",
    role: "Cleaner",
    status: "available",
    rating: 4.7,
  },
  {
    id: "s4",
    name: "Emma Wilson",
    role: "Security Guard",
    status: "off_duty",
    rating: 4.2,
  },
];

const ContractorStaff: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Staff"
        subtitle="Manage your contracted staff"
        actions={<Button>Add Staff</Button>}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Input placeholder="Search staff..." className="max-w-sm" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CONTRACTOR_STAFF.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.role}</TableCell>
                  <TableCell>{s.rating} ★</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        s.status === "on_shift"
                          ? "bg-emerald-100 text-emerald-800"
                          : s.status === "available"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {s.status.replace("_", " ")}
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

export default ContractorStaff;
