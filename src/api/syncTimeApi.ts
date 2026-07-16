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

const API_BASE_URL =
  window.__SYNC_TIME_API_BASE_URL__ ||
  process.env.REACT_APP_SYNC_TIME_API_BASE_URL ||
  "";

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
  if (!API_BASE_URL) return localConnectors;

  try {
    const res = await fetch(`${API_BASE_URL}/connectors`);
    if (!res.ok) return localConnectors;

    const data = await res.json();
    return data.connectors || localConnectors;
  } catch {
    return localConnectors;
  }
}

export async function getSchedule(): Promise<{
  schedule: SyncTimes;
}> {
  return {
    schedule: DEFAULT_SYNC_TIMES
  };
}

export async function preview(data: {
  schedule: SyncTimes;
  reason?: string;
}) {
  return {
    changes: Object.keys(data.schedule).map((day) => ({
      day,
      before: DEFAULT_SYNC_TIMES[day as keyof SyncTimes],
      after: data.schedule[day as keyof SyncTimes],
      changed:
        DEFAULT_SYNC_TIMES[day as keyof SyncTimes] !==
        data.schedule[day as keyof SyncTimes]
    }))
  };
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

  const res = await fetch(`${API_BASE_URL}/sync-times`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
      // Later Admin Portal integration:
      // Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      connector,
      environment,
      syncTimes,
      reason,
      triggerMode
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Failed to update SyncTimes");
  }

  return data as UpdateSyncTimesResponse;
}

/**
 * Compatibility export for your existing components.
 * This fixes:
 * Module '../api/syncTimeApi' has no exported member 'syncTimeApi'
 */
export const syncTimeApi = {
  getConnectors,
  getSchedule,
  preview,
  updateSyncTimes,

  /**
   * Older code may call syncTimeApi.update({ schedule }).
   * Keep it as local-only compatibility.
   */
  update: async (data: { schedule: SyncTimes }) => {
    return updateSyncTimes(
      "ob",
      "dev03",
      data.schedule,
      "Updated from legacy update() call",
      "none"
    );
  }
};