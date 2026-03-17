import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

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
}) => {
  const token = useSelector((state) => state.auth.token);
  const location = useLocation();

  const isAuthenticated = Boolean(token);

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

  return children ?? <Outlet />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  guestOnly: PropTypes.bool,
  public: PropTypes.bool,
  redirectTo: PropTypes.string,
};

export default ProtectedRoute;
