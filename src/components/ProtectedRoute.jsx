import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { getUserType } from "../utils/authResponseNormalizer";

/**
 * Unified route guard for authenticated, guest-only, and public routes.
 *
 * @param {boolean}        guestOnly    - If true, only unauthenticated users may access.
 * @param {boolean}        public       - If true, route is accessible to anyone (no auth check).
 * @param {string}         redirectTo   - Override the default redirect target.
 * @param {React.ReactNode} children    - Wrapped element(s). Falls back to <Outlet /> for layout routes.
 */
const ProtectedRoute = ({
  children,
  guestOnly = false,
  public: isPublic = false,
  redirectTo,
  allowedRoles,
}) => {
  const token = useSelector((state) => state.auth.token);
  const userdata = useSelector((state) => state.auth.userdata);
  const location = useLocation();

  const isAuthenticated = Boolean(token);
  const userRole = (getUserType(userdata) || "").toLowerCase();

  // Public routes — accessible by anyone, no auth required
  if (isPublic) {
    return children ?? <Outlet />;
  }

  // Guest-only routes (login, register) — redirect authenticated users away
  if (guestOnly && isAuthenticated) {
    const destination = redirectTo || "/edit-profile";
    return <Navigate to={destination} replace />;
  }

  // Protected routes — redirect unauthenticated users to login
  if (!guestOnly && !isAuthenticated) {
    const destination = redirectTo || "/login";
    return <Navigate to={destination} state={{ from: location }} replace />;
  }

  // Role-restricted routes — authenticated but not authorized users are redirected away
  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userRole)
  ) {
    const destination = redirectTo || "/dashboard";
    return <Navigate to={destination} replace />;
  }

  return children ?? <Outlet />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  guestOnly: PropTypes.bool,
  public: PropTypes.bool,
  redirectTo: PropTypes.string,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
