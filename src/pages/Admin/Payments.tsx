import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_PAYMENTS } from "@/constants/mock-data";
import { PaymentStatus } from "@/types";
import { ESCROW_FEE_PERCENT } from "@/constants";

const payStatusColor: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "bg-amber-100 text-amber-800",
  [PaymentStatus.IN_ESCROW]: "bg-blue-100 text-blue-800",
  [PaymentStatus.RELEASED]: "bg-emerald-100 text-emerald-800",
  [PaymentStatus.REFUNDED]: "bg-red-100 text-red-800",
};

const AdminPayments: React.FC = () => {
  const totalInEscrow = MOCK_PAYMENTS.filter(
    (p) => p.status === PaymentStatus.IN_ESCROW,
  ).reduce((acc, p) => acc + p.totalAmount, 0);

  const totalReleased = MOCK_PAYMENTS.filter(
    (p) => p.status === PaymentStatus.RELEASED,
  ).reduce((acc, p) => acc + p.totalAmount, 0);

  const totalFees = MOCK_PAYMENTS.reduce((acc, p) => acc + p.escrowFee, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Escrow"
        subtitle={`${ESCROW_FEE_PERCENT}% Staffo commission on all payments`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="In Escrow"
          value={`£${totalInEscrow.toLocaleString()}`}
          description="Held securely"
        />
        <StatCard
          title="Released"
          value={`£${totalReleased.toLocaleString()}`}
          description="Paid out to staff"
        />
        <StatCard
          title="Staffo Fees Earned"
          value={`£${totalFees.toLocaleString()}`}
          description={`${ESCROW_FEE_PERCENT}% commission`}
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="escrow">In Escrow</TabsTrigger>
          <TabsTrigger value="released">Released</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Staffo Fee ({ESCROW_FEE_PERCENT}%)</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_PAYMENTS.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.id}
                      </TableCell>
                      <TableCell>£{payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        £{payment.escrowFee.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        £{payment.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.method}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={payStatusColor[payment.status]}
                        >
                          {payment.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escrow" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Payments held in escrow until job completion and sign-off.
              </p>
              {MOCK_PAYMENTS.filter(
                (p) => p.status === PaymentStatus.IN_ESCROW,
              ).map((payment) => (
                <div
                  key={payment.id}
                  className="mt-4 flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      £{payment.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Job: {payment.jobPostId} · {payment.method}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={payStatusColor[payment.status]}
                  >
                    In Escrow
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="released" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Completed payments released to staff/contractors.
              </p>
              {MOCK_PAYMENTS.filter(
                (p) => p.status === PaymentStatus.RELEASED,
              ).map((payment) => (
                <div
                  key={payment.id}
                  className="mt-4 flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      £{payment.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Released:{" "}
                      {payment.releasedAt
                        ? new Date(payment.releasedAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={payStatusColor[payment.status]}
                  >
                    Released
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPayments;
