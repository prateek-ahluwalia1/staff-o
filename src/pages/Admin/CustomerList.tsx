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

const MOCK_CUSTOMERS = [
  {
    id: "cust_001",
    name: "TechCorp International",
    contact: "Amanda Reed",
    email: "amanda@techcorp.com",
    sites: 4,
    activePosts: 2,
    status: "active",
  },
  {
    id: "cust_002",
    name: "Metro Construction PLC",
    contact: "Robert Davies",
    email: "robert@metrocon.com",
    sites: 7,
    activePosts: 3,
    status: "active",
  },
  {
    id: "cust_003",
    name: "Greenfield Estates",
    contact: "Susan White",
    email: "susan@greenfield.com",
    sites: 2,
    activePosts: 0,
    status: "inactive",
  },
];

const CustomerList: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Management"
        subtitle="Manage platform customers and their sites"
        actions={<Button>Add Customer</Button>}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-4">
            <Input placeholder="Search customers..." className="max-w-sm" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Sites</TableHead>
                <TableHead>Active Posts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CUSTOMERS.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.contact}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.email}
                  </TableCell>
                  <TableCell>{customer.sites}</TableCell>
                  <TableCell>{customer.activePosts}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        customer.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {customer.status}
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

export default CustomerList;
