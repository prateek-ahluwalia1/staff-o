// Utility functions for dashboard calculations and formatting

export const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (name) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA15E",
    "#BC6C25",
  ];
  let hash = 0;
  if (name) {
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  return colors[Math.abs(hash) % colors.length];
};

// Format currency
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

// Format large numbers with K, M, B suffix
export const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num;
};

// Generate job trend mock data
export const generateJobTrendData = (months = 6) => {
  const data = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 0; i < months; i++) {
    data.push({
      month: monthNames[i],
      completed: Math.floor(Math.random() * 30) + 10,
      pending: Math.floor(Math.random() * 10) + 1,
    });
  }

  return data;
};

// Generate revenue data
export const generateRevenueData = (months = 7) => {
  const data = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
  ];

  for (let i = 0; i < months; i++) {
    data.push({
      month: monthNames[i],
      revenue: Math.floor(Math.random() * 30000) + 20000,
    });
  }

  return data;
};

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};

// User type display names
export const USER_TYPE_LABELS = {
  staff: "Staff Member",
  contractor: "Contractor",
  customer: "Customer/Employer",
  employer: "Employer",
  admin: "Administrator",
  administrator: "Administrator",
};

// User type icons
export const USER_TYPE_ICONS = {
  staff: "fa-user-tie",
  contractor: "fa-handshake",
  customer: "fa-building",
  employer: "fa-briefcase",
  admin: "fa-shield",
  administrator: "fa-shield",
};
