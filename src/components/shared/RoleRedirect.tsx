import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getRoleDashboardPath } from "@/constants/navigation";

const RoleRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleDashboardPath(user.role)} replace />;
};

export default RoleRedirect;
