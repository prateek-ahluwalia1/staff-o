import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_PAYMENTS } from "@/constants/mock-data";
import { PaymentStatus } from "@/types";

const payStatusColor: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "bg-amber-100 text-amber-800",
  [PaymentStatus.IN_ESCROW]: "bg-blue-100 text-blue-800",
  [PaymentStatus.RELEASED]: "bg-emerald-100 text-emerald-800",
  [PaymentStatus.REFUNDED]: "bg-red-100 text-red-800",
};

const StaffEarnings: React.FC = () => {
  const totalEarnings = MOCK_PAYMENTS.filter(
    (p) => p.status === PaymentStatus.RELEASED,
  ).reduce((acc, p) => acc + p.amount, 0);

  const pendingEarnings = MOCK_PAYMENTS.filter(
    (p) => p.status === PaymentStatus.IN_ESCROW,
  ).reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Earnings"
        subtitle="Track your payments and earnings"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Earned"
          value={`£${totalEarnings.toLocaleString()}`}
          description="Released payments"
        />
        <StatCard
          title="Pending"
          value={`£${pendingEarnings.toLocaleString()}`}
          description="In escrow"
        />
        <StatCard title="This Month" value="£580" description="February 2026" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_PAYMENTS.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  £{payment.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {payment.method} ·{" "}
                  {new Date(payment.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={payStatusColor[payment.status]}
              >
                {payment.status.replace("_", " ")}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffEarnings;
