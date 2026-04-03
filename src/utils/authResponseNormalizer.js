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

  return {
    token,
    user,
  };
};

/**
 * Extracts the user ID from various response formats
 */
export const extractUserId = (userData) => {
  if (!userData) return null;
  return userData.data?.id || userData.id;
};
