import type React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  requiresAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  requiresAdmin = false
}) => {
  const { currentUser, hasPermission, hasRole } = useUser();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }

  // Check if user is admin when admin is required
  if (requiresAdmin && !currentUser.isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  // Check if user has the required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user has the required role
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
