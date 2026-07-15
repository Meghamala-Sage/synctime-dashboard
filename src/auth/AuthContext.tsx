import React, { createContext, useContext } from "react";
import type { Claims, HostAuth } from "../shared/types";

export type AuthValue = Required<Pick<HostAuth, "claims">> & {
  token?: string;
  getAccessToken?: () => string | Promise<string>;
};

const AuthContext = createContext<AuthValue>({ claims: {} as Claims });
export const AuthProvider = AuthContext.Provider;
export const useAuth = () => useContext(AuthContext);