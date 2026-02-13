import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_PAYMENTS } from "@/constants/mock-data";
import { PaymentStatus } from "@/types";

const payStatusColor: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "bg-amber-100 text-amber-800",
  [PaymentStatus.IN_ESCROW]: "bg-blue-100 text-blue-800",
  [PaymentStatus.RELEASED]: "bg-emerald-100 text-emerald-800",
  [PaymentStatus.REFUNDED]: "bg-red-100 text-red-800",
};

const CustomerPayments: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Payments" subtitle="View your payment history" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_PAYMENTS.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <p className="font-medium">
                  £{payment.totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Includes £{payment.escrowFee} Staffo fee · {payment.method} ·{" "}
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

export default CustomerPayments;
