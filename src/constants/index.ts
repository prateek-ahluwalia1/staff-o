import { UserRole } from "@/types";

export const APP_NAME = "Staffo";
export const ESCROW_FEE_PERCENT = 15;

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrator",
  [UserRole.STAFF]: "Staff",
  [UserRole.CONTRACTOR]: "Contractor",
  [UserRole.CUSTOMER]: "Customer",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  [UserRole.STAFF]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  [UserRole.CONTRACTOR]:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  [UserRole.CUSTOMER]:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};
