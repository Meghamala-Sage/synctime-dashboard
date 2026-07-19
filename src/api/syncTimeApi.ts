import type {
  ConnectorConfig,
  ConnectorId,
  EnvironmentId,
  SyncTimes,
  UpdateSyncTimesResponse
} from "../shared/types";

import { DEFAULT_SYNC_TIMES } from "../shared/validation";

const API_BASE_URL =
  process.env.REACT_APP_SYNC_TIME_API_BASE_URL || "";

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
  return localConnectors;
}

export async function updateSyncTimes(
  connector: ConnectorId,
  environment: EnvironmentId,
  syncTimes: SyncTimes,
  reason: string
): Promise<UpdateSyncTimesResponse> {
  if (!API_BASE_URL) {
    console.log("Mock update:", { connector, environment, syncTimes, reason });

    return {
      message: "Mock update success",
      connector,
      environment,
      parameterName: `/bnkc-${connector}-${environment}/SyncTimes`,
      currentValue: JSON.stringify(syncTimes),
      triggerMode: "none"
    };
  }

  const res = await fetch(`${API_BASE_URL}/sync-times`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      connector,
      environment,
      syncTimes,
      reason
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Update failed");
  }

  return data;
}