import React from "react";
import { useAuth } from "./AuthContext";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

export function RoleGuard({
  children,
  requiredRoles = [],
  requiredPermissions = []
}: RoleGuardProps) {
  const { claims } = useAuth();

  const roles = claims?.roles || [];
  const permissions = claims?.permissions || [];

  const hasRole =
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => roles.includes(role));

  const hasPermission =
    requiredPermissions.length === 0 ||
    requiredPermissions.some((permission) => permissions.includes(permission));

  if (!hasRole || !hasPermission) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
}