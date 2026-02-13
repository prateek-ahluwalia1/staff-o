import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage platform configuration" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Settings</CardTitle>
            <CardDescription>
              Configure general platform options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input defaultValue="Staffo" />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input defaultValue="support@staffo.com" />
            </div>
            <div className="space-y-2">
              <Label>Escrow Fee (%)</Label>
              <Input type="number" defaultValue="15" />
            </div>
            <Separator />
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Integration</CardTitle>
            <CardDescription>Configure Stripe & PayPal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Stripe API Key</Label>
              <Input type="password" defaultValue="sk_live_•••••••••••" />
            </div>
            <div className="space-y-2">
              <Label>PayPal Client ID</Label>
              <Input type="password" defaultValue="AX•••••••••••••" />
            </div>
            <Separator />
            <Button>Update Keys</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
