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
import { Button } from "@/components/ui/button";
import { MOCK_INCIDENTS } from "@/constants/mock-data";

const severityColor: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const AdminIncidents: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident Reports"
        subtitle="Monitor all reported incidents across sites"
      />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_INCIDENTS.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">
                    {incident.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {incident.siteId}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {incident.staffId}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={severityColor[incident.severity]}
                    >
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Details
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

export default AdminIncidents;
