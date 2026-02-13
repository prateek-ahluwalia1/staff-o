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

const MOCK_CONTRACTORS = [
  {
    id: "c_001",
    name: "Alpha Security Ltd",
    contact: "John Brown",
    email: "john@alphasec.com",
    staffCount: 24,
    industry: "Capital Security",
    status: "active",
  },
  {
    id: "c_002",
    name: "CleanCo Services",
    contact: "Lisa Park",
    email: "lisa@cleanco.com",
    staffCount: 18,
    industry: "Cleaning",
    status: "active",
  },
  {
    id: "c_003",
    name: "BuildSafe Group",
    contact: "Tom Harris",
    email: "tom@buildsafe.com",
    staffCount: 12,
    industry: "Construction",
    status: "pending",
  },
];

const ContractorList: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contractor Management"
        subtitle="Manage sub-contractors on the platform"
        actions={<Button>Add Contractor</Button>}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-4">
            <Input placeholder="Search contractors..." className="max-w-sm" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Staff Count</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CONTRACTORS.map((contractor) => (
                <TableRow key={contractor.id}>
                  <TableCell className="font-medium">
                    {contractor.name}
                  </TableCell>
                  <TableCell>{contractor.contact}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {contractor.email}
                  </TableCell>
                  <TableCell>{contractor.staffCount}</TableCell>
                  <TableCell>{contractor.industry}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        contractor.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {contractor.status}
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

export default ContractorList;
