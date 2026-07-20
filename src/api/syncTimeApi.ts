import type {
  ConnectorConfig,
  ConnectorId,
  EnvironmentId,
  SyncTimes,
  UpdateSyncTimesResponse
} from "../shared/types";

import { DEFAULT_SYNC_TIMES } from "../shared/validation";

declare global {
  interface Window {
    __SYNC_TIME_API_BASE_URL__?: string;
  }
}

const API_BASE_URL: string = window.__SYNC_TIME_API_BASE_URL__ || "";

export const localConnectors: ConnectorConfig[] = [
  {
    id: "ob",
    displayName: "Open Banking",
    parameterName: "/bnkc-ob-dev03/SyncTimes"
  },
  {
    id: "obbarclays",
    displayName: "OB Barclays",
    parameterName: "/bnkc-obbarclays-dev03/SyncTimes"
  },
  {
    id: "nordigen",
    displayName: "Nordigen",
    parameterName: "/bnkc-nordigen-dev03/SyncTimes"
  }
];

export async function getConnectors(): Promise<ConnectorConfig[]> {
  if (!API_BASE_URL) {
    return localConnectors;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/connectors`);

    if (!response.ok) {
      return localConnectors;
    }

    const data = await response.json();

    return Array.isArray(data.connectors)
      ? (data.connectors as ConnectorConfig[])
      : localConnectors;
  } catch {
    return localConnectors;
  }
}

export async function getSyncTimes(
  connector: ConnectorId,
  environment: EnvironmentId
): Promise<SyncTimes> {
  if (!API_BASE_URL) {
    return { ...DEFAULT_SYNC_TIMES };
  }

  const url = `${API_BASE_URL}/sync-times?connector=${encodeURIComponent(connector)}&environment=${encodeURIComponent(environment)}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Failed to fetch SyncTimes");
  }

  return data.syncTimes as SyncTimes;
}

export async function updateSyncTimes(
  connector: ConnectorId,
  environment: EnvironmentId,
  syncTimes: SyncTimes,
  reason: string,
  triggerMode: "none" | "invoke-listener" = "none"
): Promise<UpdateSyncTimesResponse> {
  if (!API_BASE_URL) {
    console.log("Local mock updateSyncTimes", {
      connector,
      environment,
      syncTimes,
      reason,
      triggerMode
    });

    return {
      message: "Local mock: SyncTimes updated",
      connector,
      environment,
      parameterName: `/bnkc-${connector}-${environment}/SyncTimes`,
      currentValue: JSON.stringify(syncTimes),
      triggerMode
    };
  }

  const response = await fetch(`${API_BASE_URL}/sync-times`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      connector,
      environment,
      syncTimes,
      reason,
      triggerMode
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Failed to update SyncTimes");
  }

  return data as UpdateSyncTimesResponse;
}

export const syncTimeApi = {
  getConnectors,
  updateSyncTimes,

  getSchedule: async (): Promise<{ schedule: SyncTimes }> => ({
    schedule: DEFAULT_SYNC_TIMES
  }),

  preview: async (data: { schedule: SyncTimes }) => ({
    changes: Object.keys(data.schedule).map((day) => {
      const typedDay = day as keyof SyncTimes;

      return {
        day,
        before: DEFAULT_SYNC_TIMES[typedDay],
        after: data.schedule[typedDay],
        changed: DEFAULT_SYNC_TIMES[typedDay] !== data.schedule[typedDay]
      };
    })
  }),

  update: async (data: { schedule: SyncTimes }) =>
    updateSyncTimes("ob", "dev03", data.schedule, "Legacy update call", "none")
};