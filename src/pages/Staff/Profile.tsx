import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { DocumentType, DocumentStatus } from "@/types";

const MOCK_MY_DOCS = [
  {
    id: "doc_001",
    type: DocumentType.SECURITY_LICENSE,
    status: DocumentStatus.VERIFIED,
    expiry: "2027-03-15",
  },
  {
    id: "doc_002",
    type: DocumentType.PASSPORT,
    status: DocumentStatus.VERIFIED,
    expiry: "2030-08-22",
  },
  {
    id: "doc_003",
    type: DocumentType.WHITE_CARD,
    status: DocumentStatus.PENDING,
    expiry: "2028-06-01",
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

const StaffProfile: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and documents"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input defaultValue={user.firstName} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input defaultValue={user.lastName} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={user.email} type="email" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue={user.phone || ""} />
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_MY_DOCS.map((doc) => (
              <div key={doc.id} className="rounded-lg border p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {docTypeLabel[doc.type]}
                  </p>
                  <Badge
                    variant="secondary"
                    className={docStatusColor[doc.status]}
                  >
                    {doc.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expires: {doc.expiry}
                </p>
              </div>
            ))}
            <Separator />
            <Button variant="outline" className="w-full">
              Upload Document
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffProfile;
