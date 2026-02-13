import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_INCIDENTS } from "@/constants/mock-data";

const severityColor: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const IncidentReport: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Would submit to API
    setTitle("");
    setDescription("");
    setSeverity("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident Reports"
        subtitle="Report and view site incidents"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Report Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report New Incident</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Brief incident title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the incident in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Recent Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_INCIDENTS.map((incident) => (
              <div
                key={incident.id}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{incident.title}</p>
                  <Badge
                    variant="secondary"
                    className={severityColor[incident.severity]}
                  >
                    {incident.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {incident.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(incident.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncidentReport;
