import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_CHECKPOINTS = [
  { id: "cp_001", name: "Main Entrance", checked: true, time: "08:15" },
  { id: "cp_002", name: "Parking Level B1", checked: true, time: "08:25" },
  { id: "cp_003", name: "Server Room", checked: false, time: null },
  { id: "cp_004", name: "Roof Access", checked: false, time: null },
  { id: "cp_005", name: "Emergency Exit C", checked: false, time: null },
];

const FootPatrol: React.FC = () => {
  const [checkpoints, setCheckpoints] = useState(MOCK_CHECKPOINTS);
  const [notes, setNotes] = useState("");

  const handleCheck = (id: string) => {
    setCheckpoints((prev) =>
      prev.map((cp) =>
        cp.id === id
          ? {
              ...cp,
              checked: true,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : cp,
      ),
    );
  };

  const completedCount = checkpoints.filter((cp) => cp.checked).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Foot Patrol"
        subtitle="Complete your patrol checkpoints"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patrol Checkpoints */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Patrol Checkpoints</CardTitle>
              <Badge variant="outline">
                {completedCount}/{checkpoints.length} completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {checkpoints.map((cp) => (
              <div
                key={cp.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  cp.checked ? "bg-muted/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      cp.checked
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cp.checked ? "✓" : "○"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cp.name}</p>
                    {cp.time && (
                      <p className="text-xs text-muted-foreground">
                        Checked at {cp.time}
                      </p>
                    )}
                  </div>
                </div>
                {!cp.checked && (
                  <Button size="sm" onClick={() => handleCheck(cp.id)}>
                    Check In
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patrol Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any observations during patrol..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />
            </div>
            <Button
              className="w-full"
              disabled={completedCount < checkpoints.length}
            >
              Complete Patrol
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FootPatrol;
