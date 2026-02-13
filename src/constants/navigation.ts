import { UserRole } from "@/types";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  Briefcase,
  Calendar,
  FileCheck,
  AlertTriangle,
  CreditCard,
  Landmark,
  Settings,
  MapPin,
  Route,
  Wallet,
  UserCircle,
  Clock,
  History,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const ADMIN_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "User Management",
    items: [
      { title: "Staff", href: "/admin/staff", icon: Users },
      { title: "Contractors", href: "/admin/contractors", icon: Building2 },
      { title: "Customers", href: "/admin/customers", icon: UserCheck },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Job Posts", href: "/admin/jobs", icon: Briefcase },
      { title: "Roster", href: "/admin/roster", icon: Calendar },
      { title: "Documents", href: "/admin/documents", icon: FileCheck },
      { title: "Incidents", href: "/admin/incidents", icon: AlertTriangle },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Payments", href: "/admin/payments", icon: CreditCard },
      { title: "Escrow", href: "/admin/escrow", icon: Landmark },
    ],
  },
  {
    label: "System",
    items: [{ title: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

export const STAFF_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/staff", icon: LayoutDashboard }],
  },
  {
    label: "Work",
    items: [
      { title: "My Shifts", href: "/staff/shifts", icon: Calendar },
      {
        title: "Site Check-in",
        href: "/staff/checkin",
        icon: MapPin,
      },
      { title: "Foot Patrol", href: "/staff/patrol", icon: Route },
      { title: "Incidents", href: "/staff/incidents", icon: AlertTriangle },
      { title: "Job Board", href: "/staff/jobs", icon: Briefcase },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "My Documents",
        href: "/staff/documents",
        icon: FileCheck,
      },
      { title: "Earnings", href: "/staff/earnings", icon: Wallet },
      { title: "Profile", href: "/staff/profile", icon: UserCircle },
    ],
  },
];

export const CONTRACTOR_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/contractor", icon: LayoutDashboard }],
  },
  {
    label: "Management",
    items: [
      { title: "My Staff", href: "/contractor/staff", icon: Users },
      { title: "Roster", href: "/contractor/roster", icon: Calendar },
      { title: "Shift Details", href: "/contractor/shifts", icon: Clock },
      { title: "Job Posts", href: "/contractor/jobs", icon: Briefcase },
    ],
  },
  {
    label: "Finance & History",
    items: [
      { title: "Payments", href: "/contractor/payments", icon: CreditCard },
      { title: "History", href: "/contractor/history", icon: History },
      { title: "Profile", href: "/contractor/profile", icon: UserCircle },
    ],
  },
];

export const CUSTOMER_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/customer", icon: LayoutDashboard }],
  },
  {
    label: "Management",
    items: [
      { title: "My Sites", href: "/customer/sites", icon: Building2 },
      { title: "Roster", href: "/customer/roster", icon: Calendar },
      { title: "Shift Details", href: "/customer/shifts", icon: Clock },
      { title: "Job Posts", href: "/customer/jobs", icon: Briefcase },
    ],
  },
  {
    label: "Finance & History",
    items: [
      { title: "Payments", href: "/customer/payments", icon: CreditCard },
      { title: "History", href: "/customer/history", icon: History },
      { title: "Profile", href: "/customer/profile", icon: UserCircle },
    ],
  },
];

export function getNavForRole(role: UserRole): NavGroup[] {
  switch (role) {
    case UserRole.ADMIN:
      return ADMIN_NAV;
    case UserRole.STAFF:
      return STAFF_NAV;
    case UserRole.CONTRACTOR:
      return CONTRACTOR_NAV;
    case UserRole.CUSTOMER:
      return CUSTOMER_NAV;
    default:
      return [];
  }
}

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "/admin";
    case UserRole.STAFF:
      return "/staff";
    case UserRole.CONTRACTOR:
      return "/contractor";
    case UserRole.CUSTOMER:
      return "/customer";
    default:
      return "/login";
  }
}
