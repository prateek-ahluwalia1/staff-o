import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { UserRole } from "@/types";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import RoleRedirect from "@/components/shared/RoleRedirect";

// Layouts
const AuthLayout = lazy(() => import("@/components/layouts/AuthLayout"));
const DashboardLayout = lazy(
  () => import("@/components/layouts/DashboardLayout"),
);

// UnAuth pages
const Login = lazy(() => import("@/pages/UnAuthenticated/Login"));
const Register = lazy(() => import("@/pages/UnAuthenticated/Register"));
const ForgotPassword = lazy(
  () => import("@/pages/UnAuthenticated/ForgotPassword"),
);

// Common pages
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/Admin/Dashboard"));
const AdminStaffList = lazy(() => import("@/pages/Admin/StaffList"));
const AdminContractorList = lazy(() => import("@/pages/Admin/ContractorList"));
const AdminCustomerList = lazy(() => import("@/pages/Admin/CustomerList"));
const AdminJobPosts = lazy(() => import("@/pages/Admin/JobPosts"));
const AdminRoster = lazy(() => import("@/pages/Admin/Roster"));
const AdminDocuments = lazy(() => import("@/pages/Admin/Documents"));
const AdminIncidents = lazy(() => import("@/pages/Admin/Incidents"));
const AdminPayments = lazy(() => import("@/pages/Admin/Payments"));
const AdminSettings = lazy(() => import("@/pages/Admin/Settings"));

// Staff pages
const StaffDashboard = lazy(() => import("@/pages/Staff/Dashboard"));
const StaffShifts = lazy(() => import("@/pages/Staff/Shifts"));
const SiteCheckin = lazy(() => import("@/pages/Staff/SiteCheckin"));
const FootPatrol = lazy(() => import("@/pages/Staff/FootPatrol"));
const StaffIncidentReport = lazy(() => import("@/pages/Staff/IncidentReport"));
const StaffJobBoard = lazy(() => import("@/pages/Staff/JobBoard"));
const StaffEarnings = lazy(() => import("@/pages/Staff/Earnings"));
const StaffProfile = lazy(() => import("@/pages/Staff/Profile"));

// Contractor pages
const ContractorDashboard = lazy(() => import("@/pages/Contractor/Dashboard"));
const ContractorStaff = lazy(() => import("@/pages/Contractor/Staff"));
const ContractorRoster = lazy(() => import("@/pages/Contractor/Roster"));
const ContractorShifts = lazy(() => import("@/pages/Contractor/Shifts"));
const ContractorJobPosts = lazy(() => import("@/pages/Contractor/JobPosts"));
const ContractorPayments = lazy(() => import("@/pages/Contractor/Payments"));
const ContractorHistory = lazy(() => import("@/pages/Contractor/History"));
const ContractorProfile = lazy(() => import("@/pages/Contractor/Profile"));

// Customer pages
const CustomerDashboard = lazy(() => import("@/pages/Customer/Dashboard"));
const CustomerSites = lazy(() => import("@/pages/Customer/Sites"));
const CustomerRoster = lazy(() => import("@/pages/Customer/Roster"));
const CustomerShifts = lazy(() => import("@/pages/Customer/Shifts"));
const CustomerJobPosts = lazy(() => import("@/pages/Customer/JobPosts"));
const CustomerPayments = lazy(() => import("@/pages/Customer/Payments"));
const CustomerHistory = lazy(() => import("@/pages/Customer/History"));
const CustomerProfile = lazy(() => import("@/pages/Customer/Profile"));

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Root redirect based on role */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Auth pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Admin portal */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/staff" element={<AdminStaffList />} />
          <Route path="/admin/contractors" element={<AdminContractorList />} />
          <Route path="/admin/customers" element={<AdminCustomerList />} />
          <Route path="/admin/jobs" element={<AdminJobPosts />} />
          <Route path="/admin/roster" element={<AdminRoster />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />
          <Route path="/admin/incidents" element={<AdminIncidents />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/escrow" element={<AdminPayments />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* Staff portal */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[UserRole.STAFF]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/shifts" element={<StaffShifts />} />
          <Route path="/staff/checkin" element={<SiteCheckin />} />
          <Route path="/staff/patrol" element={<FootPatrol />} />
          <Route path="/staff/incidents" element={<StaffIncidentReport />} />
          <Route path="/staff/jobs" element={<StaffJobBoard />} />
          <Route path="/staff/documents" element={<StaffProfile />} />
          <Route path="/staff/earnings" element={<StaffEarnings />} />
          <Route path="/staff/profile" element={<StaffProfile />} />
        </Route>

        {/* Contractor portal */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[UserRole.CONTRACTOR]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/contractor" element={<ContractorDashboard />} />
          <Route path="/contractor/staff" element={<ContractorStaff />} />
          <Route path="/contractor/roster" element={<ContractorRoster />} />
          <Route path="/contractor/shifts" element={<ContractorShifts />} />
          <Route path="/contractor/jobs" element={<ContractorJobPosts />} />
          <Route path="/contractor/payments" element={<ContractorPayments />} />
          <Route path="/contractor/history" element={<ContractorHistory />} />
          <Route path="/contractor/profile" element={<ContractorProfile />} />
        </Route>

        {/* Customer portal */}
        <Route
          element={
            <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/customer/sites" element={<CustomerSites />} />
          <Route path="/customer/roster" element={<CustomerRoster />} />
          <Route path="/customer/shifts" element={<CustomerShifts />} />
          <Route path="/customer/jobs" element={<CustomerJobPosts />} />
          <Route path="/customer/payments" element={<CustomerPayments />} />
          <Route path="/customer/history" element={<CustomerHistory />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
        </Route>

        {/* Error pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
