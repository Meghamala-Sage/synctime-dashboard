export const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] as const;
export type DayOfWeek = typeof DAYS[number];
export type WeeklySchedule = Record<DayOfWeek, string>;

export type Claims = Record<string, unknown> & {
  sub?: string; email?: string; name?: string;
  roles?: string[]; groups?: string[]; permissions?: string[];
};

export interface HostAuth {
  token?: string;
  claims?: Claims;
  getAccessToken?: () => string | Promise<string>;
}

export interface HostProps {
  domElement?: Element;
  domElementGetter?: () => Element;
  routeBase?: string;
  apiBaseUrl?: string;
  environment?: "dev" | "qa" | "pre" | "prod";
  auth?: HostAuth;
}

export interface Connector {
  id: string;
  code: string;
  displayName: string;
  enabled: boolean;
}

export interface SyncSchedule {
  connectorId: string;
  version?: string;
  timezone: "UTC";
  weekly: WeeklySchedule;
  updatedBy?: string;
  updatedAt?: string;
}

export interface SyncStatus {
  connectorId: string;
  currentStartTime?: string;
  lastAppliedAt?: string;
  lastResult: "Unknown" | "Applied" | "Pending" | "Failed";
  message?: string;
}

export interface PreviewRun {
  day: DayOfWeek;
  proposedStartTime: string;
  effectiveDateUtc?: string;
}

export interface SchedulePreview {
  connectorId: string;
  nextRuns: PreviewRun[];
  warnings: string[];
}