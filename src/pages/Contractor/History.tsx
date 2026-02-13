import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_HISTORY = [
  {
    id: "h1",
    title: "Night Security - Canary Wharf",
    period: "Jan 2026 - Feb 2026",
    status: "completed",
    total: "£4,250",
  },
  {
    id: "h2",
    title: "Construction Guard - Westfield",
    period: "Nov 2025 - Jan 2026",
    status: "completed",
    total: "£8,120",
  },
  {
    id: "h3",
    title: "Cleaning Crew - TechCorp",
    period: "Sep 2025 - Oct 2025",
    status: "completed",
    total: "£3,680",
  },
];

const ContractorHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="History" subtitle="View past jobs and contracts" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Completed Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_HISTORY.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.period}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-medium">{item.total}</p>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800"
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractorHistory;
