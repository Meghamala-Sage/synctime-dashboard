import React, {
  createContext,
  useContext,
  useMemo
} from "react";

import type {
  Claims,
  HostAuth
} from "../shared/types";

export interface AuthContextValue {
  accessToken?: string;
  idToken?: string;
  claims: Claims;
  isAuthenticated: boolean;
  login?: () => void;
  logout?: () => void;
}

const defaultClaims: Claims = {
  roles: ["SyncTime.Admin"],
  permissions: ["SyncTime.Read", "SyncTime.Write"],
  groups: []
};

const defaultAuthContext: AuthContextValue = {
  accessToken: undefined,
  idToken: undefined,
  claims: defaultClaims,
  isAuthenticated: true,
  login: undefined,
  logout: undefined
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

interface AuthProviderProps {
  children: React.ReactNode;

  /**
   * This will be supplied by Admin Portal later.
   * For local development, it can be omitted.
   */
  auth?: HostAuth;
}

export function AuthProvider({
  children,
  auth
}: AuthProviderProps) {
  const value = useMemo<AuthContextValue>(() => {
    return {
      accessToken: auth?.accessToken,
      idToken: auth?.idToken,
      claims: auth?.claims || defaultClaims,
      isAuthenticated: auth?.isAuthenticated ?? true,
      login: auth?.login,
      logout: auth?.logout
    };
  }, [auth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}