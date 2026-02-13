// ============================================================
// STAFFO - Shared Type Definitions
// ============================================================

export const UserRole = {
  ADMIN: "admin",
  STAFF: "staff",
  CONTRACTOR: "contractor",
  CUSTOMER: "customer",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const JobStatus = {
  OPEN: "open",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const ShiftStatus = {
  SCHEDULED: "scheduled",
  SIGNED_IN: "signed_in",
  ON_PATROL: "on_patrol",
  INCIDENT: "incident",
  SIGNED_OUT: "signed_out",
  COMPLETED: "completed",
} as const;
export type ShiftStatus = (typeof ShiftStatus)[keyof typeof ShiftStatus];

export const PaymentStatus = {
  PENDING: "pending",
  IN_ESCROW: "in_escrow",
  RELEASED: "released",
  REFUNDED: "refunded",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const DocumentType = {
  PASSPORT: "passport",
  WHITE_CARD: "white_card",
  SECURITY_LICENSE: "security_license_sia",
  RESIDENCE_TYPE: "residence_type",
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const DocumentStatus = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  EXPIRED: "expired",
} as const;
export type DocumentStatus =
  (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const IndustryType = {
  CONSTRUCTION: "construction",
  CLEANING: "cleaning",
  CAPITAL_SECURITY: "capital_security",
} as const;
export type IndustryType = (typeof IndustryType)[keyof typeof IndustryType];

// ---- User Types ----
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface StaffProfile extends User {
  role: typeof UserRole.STAFF;
  documents: Document[];
  competences: string[];
  rating: number;
  totalShifts: number;
  industries: IndustryType[];
}

export interface ContractorProfile extends User {
  role: typeof UserRole.CONTRACTOR;
  companyName?: string;
  staffCount: number;
  industries: IndustryType[];
}

export interface CustomerProfile extends User {
  role: typeof UserRole.CUSTOMER;
  companyName?: string;
  sites: Site[];
}

// ---- Documents ----
export interface Document {
  id: string;
  userId: string;
  type: DocumentType;
  fileName: string;
  status: DocumentStatus;
  expiryDate?: string;
  uploadedAt: string;
}

// ---- Sites & Shifts ----
export interface Site {
  id: string;
  name: string;
  address: string;
  industry: IndustryType;
  customerId: string;
  isActive: boolean;
}

export interface Shift {
  id: string;
  siteId: string;
  siteName: string;
  staffId?: string;
  staffName?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  signInTimestamp?: string;
  signOutTimestamp?: string;
  payRate: number;
  chargeRate: number;
}

// ---- Job Posts ----
export interface JobPost {
  id: string;
  title: string;
  description: string;
  siteId: string;
  siteName: string;
  industry: IndustryType;
  payRate: number;
  chargeRate: number;
  startDate: string;
  endDate: string;
  status: JobStatus;
  requiredStaff: number;
  assignedStaff: number;
  createdBy: string;
  createdAt: string;
  isBroadcast: boolean;
}

// ---- Payments & Escrow ----
export interface Payment {
  id: string;
  jobPostId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  escrowFee: number; // 15% Staffo fee
  totalAmount: number;
  status: PaymentStatus;
  method: "stripe" | "paypal";
  createdAt: string;
  releasedAt?: string;
}

// ---- Incidents & Patrols ----
export interface IncidentReport {
  id: string;
  shiftId: string;
  staffId: string;
  siteId: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  images?: string[];
}

export interface FootPatrol {
  id: string;
  shiftId: string;
  staffId: string;
  checkpoints: PatrolCheckpoint[];
  startedAt: string;
  completedAt?: string;
}

export interface PatrolCheckpoint {
  id: string;
  name: string;
  checkedAt: string;
  notes?: string;
}

// ---- Roster ----
export interface RosterEntry {
  id: string;
  staffId: string;
  staffName: string;
  siteId: string;
  siteName: string;
  shifts: Shift[];
  weekStartDate: string;
}

// ---- Notifications ----
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "job_post" | "shift" | "payment" | "document" | "general";
  isRead: boolean;
  createdAt: string;
}

// ---- Dashboard Stats ----
export interface AdminDashboardStats {
  totalStaff: number;
  totalContractors: number;
  totalCustomers: number;
  activeJobs: number;
  totalRevenue: number;
  pendingDocuments: number;
  activeShifts: number;
}

export interface StaffDashboardStats {
  upcomingShifts: number;
  completedShifts: number;
  totalEarnings: number;
  rating: number;
  pendingDocuments: number;
}

export interface ContractorDashboardStats {
  activeStaff: number;
  activeJobs: number;
  totalSpent: number;
  pendingPayments: number;
}

export interface CustomerDashboardStats {
  activeSites: number;
  activeShifts: number;
  totalSpent: number;
  openJobPosts: number;
}
