import type { ConnectorConfig, ConnectorId, EventBridgeState, SyncTimes } from "../shared/types";

let apiBaseUrl = "";
let environment = "";

export function configureApi(baseUrl: string, currentEnvironment: string): void {
  apiBaseUrl = baseUrl.replace(/\/$/, "");
  environment = currentEnvironment;
}

function base(): string {
  const configured = apiBaseUrl || window.__SYNC_TIME_API_BASE_URL__;
  if (!configured) throw new Error("Sync Dashboard API is not configured");
  return configured.replace(/\/$/, "");
}

declare global {
  interface Window { __SYNC_TIME_API_BASE_URL__?: string; }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${base()}${path}`, {
    ...options,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...options?.headers }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data as T;
}

export interface ConnectorState {
  connector: ConnectorId;
  environment: string;
  parameterName: string;
  syncTimes: SyncTimes;
  version: number;
  eventBridge: EventBridgeState | null;
}

export interface HistoryEvent {
  changeId: string;
  timestampUtc: string;
  actorEmail: string;
  connector: string;
  action: string;
  status: string;
  reason: string;
  before?: unknown;
  after?: unknown;
}

export const currentEnvironment = () => environment;
export const getConnectors = async () => (await request<{ connectors: ConnectorConfig[] }>("/connectors")).connectors;
export const getConnectorState = (id: ConnectorId) => request<ConnectorState>(`/${encodeURIComponent(id)}`);
export const saveSchedule = (id: ConnectorId, syncTimes: SyncTimes, reason: string, expectedVersion: number) =>
  request<ConnectorState>(`/${encodeURIComponent(id)}`, {
    method: "PUT", body: JSON.stringify({ syncTimes, reason, expectedVersion })
  });
export const setRuleState = (id: ConnectorId, enabled: boolean, reason: string) =>
  request<ConnectorState>(`/${encodeURIComponent(id)}/rule-state`, {
    method: "POST", body: JSON.stringify({ enabled, reason })
  });
export const getHistory = (id: ConnectorId, nextToken?: string) =>
  request<{ events: HistoryEvent[]; nextToken?: string }>(
    `/history?connector=${encodeURIComponent(id)}${nextToken ? `&nextToken=${encodeURIComponent(nextToken)}` : ""}`
  );
