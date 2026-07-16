import React from "react";
import { useAuth } from "./AuthContext";

interface GuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function RoleGuard({ children, requiredRoles = [] }: GuardProps) {
  const { claims } = useAuth();

  const userRoles = claims?.roles || [];

  const hasAccess =
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => userRoles.includes(role));

  if (!hasAccess) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
}