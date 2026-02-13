import React from "react";
import PageHeader from "@/components/shared/PageHeader";
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
import { Button } from "@/components/ui/button";
import { DocumentStatus, DocumentType } from "@/types";

const MOCK_DOCUMENTS = [
  {
    id: "doc_001",
    staffName: "Michael Roberts",
    type: DocumentType.SECURITY_LICENSE,
    status: DocumentStatus.VERIFIED,
    expiry: "2027-03-15",
    uploaded: "2025-11-20",
  },
  {
    id: "doc_002",
    staffName: "Sarah Chen",
    type: DocumentType.SECURITY_LICENSE,
    status: DocumentStatus.EXPIRED,
    expiry: "2026-01-10",
    uploaded: "2024-12-05",
  },
  {
    id: "doc_003",
    staffName: "Michael Roberts",
    type: DocumentType.PASSPORT,
    status: DocumentStatus.VERIFIED,
    expiry: "2030-08-22",
    uploaded: "2025-11-20",
  },
  {
    id: "doc_004",
    staffName: "David Okafor",
    type: DocumentType.WHITE_CARD,
    status: DocumentStatus.PENDING,
    expiry: "2028-06-01",
    uploaded: "2026-02-12",
  },
  {
    id: "doc_005",
    staffName: "James Patel",
    type: DocumentType.RESIDENCE_TYPE,
    status: DocumentStatus.PENDING,
    expiry: "2027-09-30",
    uploaded: "2026-02-13",
  },
  {
    id: "doc_006",
    staffName: "Emma Wilson",
    type: DocumentType.SECURITY_LICENSE,
    status: DocumentStatus.REJECTED,
    expiry: "2026-05-20",
    uploaded: "2026-01-15",
  },
];

const docTypeLabel: Record<DocumentType, string> = {
  [DocumentType.PASSPORT]: "Passport",
  [DocumentType.WHITE_CARD]: "White Card",
  [DocumentType.SECURITY_LICENSE]: "Security License (SIA)",
  [DocumentType.RESIDENCE_TYPE]: "Residence Type",
};

const docStatusColor: Record<DocumentStatus, string> = {
  [DocumentStatus.VERIFIED]: "bg-emerald-100 text-emerald-800",
  [DocumentStatus.PENDING]: "bg-amber-100 text-amber-800",
  [DocumentStatus.REJECTED]: "bg-red-100 text-red-800",
  [DocumentStatus.EXPIRED]: "bg-gray-100 text-gray-800",
};

const AdminDocuments: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Verification"
        subtitle="Review and verify staff documents — Passport, White Card, SIA License, Residence"
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-4">
            <Input placeholder="Search by staff name..." className="max-w-sm" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_DOCUMENTS.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.staffName}</TableCell>
                  <TableCell>{docTypeLabel[doc.type]}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.uploaded}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.expiry}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={docStatusColor[doc.status]}
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {doc.status === DocumentStatus.PENDING && (
                      <>
                        <Button variant="default" size="sm">
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm">
                          Reject
                        </Button>
                      </>
                    )}
                    {doc.status !== DocumentStatus.PENDING && (
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    )}
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

export default AdminDocuments;
