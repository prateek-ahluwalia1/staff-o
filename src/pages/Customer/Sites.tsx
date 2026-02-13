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

const MOCK_SITES = [
  {
    id: "site_001",
    name: "Canary Wharf Office Complex",
    address: "1 Canada Square, London E14",
    industry: "Capital Security",
    activeShifts: 3,
    status: "active",
  },
  {
    id: "site_002",
    name: "Westfield Construction Site",
    address: "Stratford, London E20",
    industry: "Construction",
    activeShifts: 2,
    status: "active",
  },
  {
    id: "site_003",
    name: "TechCorp HQ",
    address: "Kings Cross, London N1",
    industry: "Cleaning",
    activeShifts: 5,
    status: "active",
  },
  {
    id: "site_004",
    name: "Riverside Apartments",
    address: "Greenwich, London SE10",
    industry: "Capital Security",
    activeShifts: 0,
    status: "inactive",
  },
];

const CustomerSites: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Sites"
        subtitle="Manage your locations and sites"
        actions={<Button>Add Site</Button>}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Input placeholder="Search sites..." className="max-w-sm" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Active Shifts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SITES.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {site.address}
                  </TableCell>
                  <TableCell>{site.industry}</TableCell>
                  <TableCell>{site.activeShifts}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        site.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {site.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Manage
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

export default CustomerSites;
