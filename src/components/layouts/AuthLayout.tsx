import React from "react";
import { Outlet } from "react-router-dom";
import { Users, ShieldCheck, CalendarDays } from "lucide-react";

const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-primary p-12">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">
            Staffo
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Security staffing management made simple. Connect staff,
            contractors, and customers on one platform.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-primary-foreground/70 text-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-primary-foreground/10 p-3">
                <Users className="h-6 w-6" />
              </div>
              <span>Staff Management</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-primary-foreground/10 p-3">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span>Secure Escrow</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-primary-foreground/10 p-3">
                <CalendarDays className="h-6 w-6" />
              </div>
              <span>Roster & Shifts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
