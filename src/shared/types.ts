export type ConnectorId = "ob" | "obbarclays" | "nordigen";
export type EnvironmentId = "dev03";

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type SyncTimes = Record<Weekday, string>;

export interface ConnectorConfig {
  id: ConnectorId;
  displayName: string;
  parameterName: string;
}

/**
 * Keep these because existing auth/AuthContext.tsx and auth/guards.tsx import them.
 * Adjust fields later if your host/Admin Portal passes more claims.
 */
export interface Claims {
  sub?: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: unknown;
}

export interface HostAuth {
  accessToken?: string;
  idToken?: string;
  claims?: Claims;
  isAuthenticated?: boolean;
  login?: () => void;
  logout?: () => void;
}

export interface UpdateSyncTimesRequest {
  connector: ConnectorId;
  environment: EnvironmentId;
  syncTimes: SyncTimes;
  reason?: string;
  triggerMode?: "none" | "invoke-listener";
}

export interface UpdateSyncTimesResponse {
  message: string;
  connector: ConnectorId;
  environment: EnvironmentId;
  parameterName: string;
  version?: number;
  previousValue?: string;
  currentValue: string;
  triggerMode: "none" | "invoke-listener";
  listenerInvokeStatus?: number;
}