import React from "react";
import { useAuth } from "./AuthContext";
import type { Claims } from "../shared/types";

const values = (claims: Claims) =>
  [
    ...(claims.roles ?? []),
    ...(claims.groups ?? []),
    ...(claims.permissions ?? [])
  ].map(String);

export const READ_ROLES = ["SyncTime.Read", "SyncTime.Admin", "AdminPortal.SuperUser"];
export const WRITE_ROLES = ["SyncTime.Admin", "AdminPortal.SuperUser"];

export function hasAnyRole(claims: Claims, allowed: string[]) {
  const claimValues = new Set(values(claims));
  return allowed.some(role => claimValues.has(role));
}

export function useCan(allowed: string[]) {
  return hasAnyRole(useAuth().claims, allowed);
}

export function RequireRole({ allowed, children }: { allowed: string[]; children: React.ReactNode }) {
  const can = useCan(allowed);
  return can ? <>{children}</> : <div className="card error">You do not have access to this SyncTime area.</div>;
}