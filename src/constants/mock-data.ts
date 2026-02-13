import {
  UserRole,
  type AdminDashboardStats,
  type ContractorDashboardStats,
  type CustomerDashboardStats,
  type StaffDashboardStats,
  type JobPost,
  type Shift,
  type RosterEntry,
  type Payment,
  type Notification,
  type IncidentReport,
  JobStatus,
  ShiftStatus,
  PaymentStatus,
  IndustryType,
} from "@/types";

// ---- Mock Users ----
export const MOCK_CURRENT_USER = {
  id: "usr_001",
  email: "admin@staffo.com",
  firstName: "James",
  lastName: "Wilson",
  role: UserRole.ADMIN as UserRole,
  phone: "+44 7700 900000",
  avatar: "",
  isActive: true,
  createdAt: "2025-01-15T08:00:00Z",
};

// ---- Mock Dashboard Stats ----
export const MOCK_ADMIN_STATS: AdminDashboardStats = {
  totalStaff: 248,
  totalContractors: 32,
  totalCustomers: 56,
  activeJobs: 18,
  totalRevenue: 125430,
  pendingDocuments: 12,
  activeShifts: 42,
};

export const MOCK_STAFF_STATS: StaffDashboardStats = {
  upcomingShifts: 5,
  completedShifts: 128,
  totalEarnings: 18420,
  rating: 4.7,
  pendingDocuments: 1,
};

export const MOCK_CONTRACTOR_STATS: ContractorDashboardStats = {
  activeStaff: 24,
  activeJobs: 6,
  totalSpent: 45200,
  pendingPayments: 3,
};

export const MOCK_CUSTOMER_STATS: CustomerDashboardStats = {
  activeSites: 4,
  activeShifts: 12,
  totalSpent: 32100,
  openJobPosts: 2,
};

// ---- Mock Job Posts ----
export const MOCK_JOB_POSTS: JobPost[] = [
  {
    id: "job_001",
    title: "Night Security - Canary Wharf Office",
    description: "Overnight security guard needed for office complex.",
    siteId: "site_001",
    siteName: "Canary Wharf Office Complex",
    industry: IndustryType.CAPITAL_SECURITY,
    payRate: 14.5,
    chargeRate: 18.5,
    startDate: "2026-02-15",
    endDate: "2026-03-15",
    status: JobStatus.OPEN,
    requiredStaff: 3,
    assignedStaff: 1,
    createdBy: "usr_002",
    createdAt: "2026-02-10T10:00:00Z",
    isBroadcast: true,
  },
  {
    id: "job_002",
    title: "Construction Site Guard - Westfield",
    description: "Day shift security for active construction site.",
    siteId: "site_002",
    siteName: "Westfield Construction Site",
    industry: IndustryType.CONSTRUCTION,
    payRate: 13.0,
    chargeRate: 17.0,
    startDate: "2026-02-20",
    endDate: "2026-04-20",
    status: JobStatus.ASSIGNED,
    requiredStaff: 2,
    assignedStaff: 2,
    createdBy: "usr_003",
    createdAt: "2026-02-08T14:00:00Z",
    isBroadcast: false,
  },
  {
    id: "job_003",
    title: "Cleaning Crew - Corporate HQ",
    description: "Evening cleaning shift for corporate headquarters.",
    siteId: "site_003",
    siteName: "TechCorp HQ",
    industry: IndustryType.CLEANING,
    payRate: 12.0,
    chargeRate: 15.5,
    startDate: "2026-02-18",
    endDate: "2026-05-18",
    status: JobStatus.IN_PROGRESS,
    requiredStaff: 5,
    assignedStaff: 4,
    createdBy: "usr_004",
    createdAt: "2026-02-05T09:00:00Z",
    isBroadcast: true,
  },
];

// ---- Mock Shifts ----
export const MOCK_SHIFTS: Shift[] = [
  {
    id: "shift_001",
    siteId: "site_001",
    siteName: "Canary Wharf Office Complex",
    staffId: "usr_010",
    staffName: "Michael Roberts",
    date: "2026-02-13",
    startTime: "22:00",
    endTime: "06:00",
    status: ShiftStatus.COMPLETED,
    signInTimestamp: "2026-02-13T21:55:00Z",
    signOutTimestamp: "2026-02-14T06:02:00Z",
    payRate: 14.5,
    chargeRate: 18.5,
  },
  {
    id: "shift_002",
    siteId: "site_002",
    siteName: "Westfield Construction Site",
    staffId: "usr_011",
    staffName: "Sarah Chen",
    date: "2026-02-14",
    startTime: "07:00",
    endTime: "19:00",
    status: ShiftStatus.SIGNED_IN,
    signInTimestamp: "2026-02-14T06:58:00Z",
    payRate: 13.0,
    chargeRate: 17.0,
  },
  {
    id: "shift_003",
    siteId: "site_003",
    siteName: "TechCorp HQ",
    staffId: "usr_012",
    staffName: "David Okafor",
    date: "2026-02-14",
    startTime: "18:00",
    endTime: "23:00",
    status: ShiftStatus.SCHEDULED,
    payRate: 12.0,
    chargeRate: 15.5,
  },
];

// ---- Mock Roster ----
export const MOCK_ROSTER: RosterEntry[] = [
  {
    id: "roster_001",
    staffId: "usr_010",
    staffName: "Michael Roberts",
    siteId: "site_001",
    siteName: "Canary Wharf Office Complex",
    weekStartDate: "2026-02-09",
    shifts: MOCK_SHIFTS.filter((s) => s.staffId === "usr_010"),
  },
  {
    id: "roster_002",
    staffId: "usr_011",
    staffName: "Sarah Chen",
    siteId: "site_002",
    siteName: "Westfield Construction Site",
    weekStartDate: "2026-02-09",
    shifts: MOCK_SHIFTS.filter((s) => s.staffId === "usr_011"),
  },
];

// ---- Mock Payments ----
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay_001",
    jobPostId: "job_001",
    payerId: "usr_002",
    payeeId: "usr_010",
    amount: 1160,
    escrowFee: 174,
    totalAmount: 1334,
    status: PaymentStatus.IN_ESCROW,
    method: "stripe",
    createdAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "pay_002",
    jobPostId: "job_002",
    payerId: "usr_003",
    payeeId: "usr_011",
    amount: 2340,
    escrowFee: 351,
    totalAmount: 2691,
    status: PaymentStatus.RELEASED,
    method: "paypal",
    createdAt: "2026-01-25T14:00:00Z",
    releasedAt: "2026-02-10T09:00:00Z",
  },
];

// ---- Mock Notifications ----
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif_001",
    userId: "usr_001",
    title: "New Job Application",
    message: "Michael Roberts applied for Night Security at Canary Wharf.",
    type: "job_post",
    isRead: false,
    createdAt: "2026-02-13T15:30:00Z",
  },
  {
    id: "notif_002",
    userId: "usr_001",
    title: "Document Expired",
    message: "Sarah Chen's SIA license has expired.",
    type: "document",
    isRead: false,
    createdAt: "2026-02-13T09:00:00Z",
  },
  {
    id: "notif_003",
    userId: "usr_001",
    title: "Payment Released",
    message: "£2,340 payment released for Westfield Construction job.",
    type: "payment",
    isRead: true,
    createdAt: "2026-02-10T09:00:00Z",
  },
];

// ---- Mock Incidents ----
export const MOCK_INCIDENTS: IncidentReport[] = [
  {
    id: "inc_001",
    shiftId: "shift_001",
    staffId: "usr_010",
    siteId: "site_001",
    title: "Unauthorized Access Attempt",
    description:
      "Individual attempted to access restricted area without ID badge at 02:30 AM. Escorted off premises.",
    severity: "medium",
    createdAt: "2026-02-14T02:30:00Z",
  },
  {
    id: "inc_002",
    shiftId: "shift_002",
    staffId: "usr_011",
    siteId: "site_002",
    title: "Equipment Left Unsecured",
    description: "Construction equipment left unsecured at perimeter gate B.",
    severity: "low",
    createdAt: "2026-02-14T08:15:00Z",
  },
];
