/**
 * Normalizes authentication API responses to a consistent format
 * Handles different response structures from staff, customer, and contractor endpoints
 *
 * Expected output:
 * {
 *   token: string,
 *   user: { id, name, email, user_type, ... }
 * }
 */

export const normalizeAuthResponse = (response) => {
  if (!response) return null;

  // Extract token (consistent across all types)
  const token = response.token;

  if (!token) return null;

  // Extract user data - handle different response structures
  let user = null;

  if (response.data?.user) {
    // Staff response format: { data: { user: {...}, staff: {...} } }
    user = response.data.user;
  } else if (response.user) {
    // Customer/Contractor response format: { user: {...} }
    user = response.user;
  } else if (response.data) {
    // Fallback: if data exists but no user key
    user = response.data;
  }

  // Ensure user object has both id formats for compatibility
  if (user && !user.id && user.data?.id) {
    user.id = user.data.id;
  }

  // Log inconsistencies for debugging
  if (user && !user.id && !user.data?.id) {
    console.warn("User object missing ID in all expected locations:", user);
  }

  return {
    token,
    user,
  };
};

/**
 * Extracts the user ID from various response formats
 * Handles both flat and nested structures
 */
export const extractUserId = (userData) => {
  if (!userData) return null;

  // Try multiple possible locations
  return userData.data?.id || userData.id || userData.user?.id;
};

/**
 * Safely get user type from various response formats
 */
export const getUserType = (userData) => {
  if (!userData) return null;

  return userData.data?.user_type || userData.user_type;
};
