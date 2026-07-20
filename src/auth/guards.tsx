import React from "react";
import { useAuth } from "./AuthContext";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback = <div>Access Denied</div>
}: RoleGuardProps) {
  const { claims, isAuthenticated } = useAuth();

  const roles = claims.roles || [];
  const permissions = claims.permissions || [];

  const hasRequiredRole =
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => roles.includes(role));

  const hasRequiredPermission =
    requiredPermissions.length === 0 ||
    requiredPermissions.some((permission) => permissions.includes(permission));

  if (!isAuthenticated || !hasRequiredRole || !hasRequiredPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface CanAccessOptions {
  claims?: {
    roles?: string[];
    permissions?: string[];
    groups?: string[];
  };
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

export function canAccess({
  claims,
  requiredRoles = [],
  requiredPermissions = []
}: CanAccessOptions): boolean {
  const roles = claims?.roles || [];
  const permissions = claims?.permissions || [];

  const hasRole =
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => roles.includes(role));

  const hasPermission =
    requiredPermissions.length === 0 ||
    requiredPermissions.some((permission) => permissions.includes(permission));

  return hasRole && hasPermission;
}