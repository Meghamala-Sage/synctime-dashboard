import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import type { ConnectorId, SyncTimes, Weekday } from "../shared/types";
import {
  DEFAULT_SYNC_TIMES,
  WEEKDAYS,
  validateSyncTimes
} from "../shared/validation";
import { localConnectors, updateSyncTimes } from "../api/syncTimeApi";

const ENVIRONMENT = "dev03" as const;

function isConnectorId(value: string | undefined): value is ConnectorId {
  return value === "ob" || value === "obbarclays" || value === "nordigen";
}

export default function ConnectorPage() {
  const { id } = useParams();
  const connectorId: ConnectorId = isConnectorId(id) ? id : "ob";

  const connector = useMemo(
    () => localConnectors.find((c) => c.id === connectorId)!,
    [connectorId]
  );

  const [syncTimes, setSyncTimes] = useState<SyncTimes>(DEFAULT_SYNC_TIMES);
  const [reason, setReason] = useState("");
  const [triggerMode, setTriggerMode] =
    useState<"none" | "invoke-listener">("none");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateDay(day: Weekday, value: string) {
    setSyncTimes((current) => ({
      ...current,
      [day]: value
    }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");

    const errors = validateSyncTimes(syncTimes);
    if (!reason.trim()) errors.push("Reason is required");

    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    try {
      setSaving(true);

      const response = await updateSyncTimes(
        connectorId,
        ENVIRONMENT,
        syncTimes,
        reason,
        triggerMode
      );

      setMessage(
        `Updated ${response.parameterName}. Version: ${
          response.version ?? "local/mock"
        }`
      );
    } catch (e: any) {
      setError(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ padding: 24 }}>
      <Link to="/">← Back to connectors</Link>

      <h1>{connector.displayName}</h1>
      <p><strong>Environment:</strong> {ENVIRONMENT}</p>
      <p><strong>Parameter:</strong> {connector.parameterName}</p>

      <form onSubmit={onSubmit}>
        <fieldset disabled={saving}>
          <legend>Weekly SyncTimes</legend>

          {WEEKDAYS.map((day) => (
            <div key={day} style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontWeight: 600 }}>
                {day}
              </label>
              <input
                value={syncTimes[day]}
                onChange={(e) => updateDay(day, e.target.value)}
                placeholder="HH:mm:ss.SSS"
                style={{ padding: 8, width: 180 }}
              />
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", fontWeight: 600 }}>
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Example: Move sync due to bank downtime"
              rows={3}
              style={{ width: "100%", maxWidth: 640 }}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", fontWeight: 600 }}>
              Trigger mode
            </label>
            <select
              value={triggerMode}
              onChange={(e) =>
                setTriggerMode(e.target.value as "none" | "invoke-listener")
              }
            >
              <option value="none">
                none — rely on existing listener / cron
              </option>
              <option value="invoke-listener">
                invoke-listener — only if backend Lambda is configured
              </option>
            </select>
          </div>

          <button type="submit" style={{ marginTop: 24 }}>
            {saving ? "Saving..." : "Update SyncTimes"}
          </button>
        </fieldset>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Preview JSON written to Parameter Store</h3>
      <pre style={{ background: "#f4f4f4", padding: 16 }}>
        {JSON.stringify(syncTimes, null, 2)}
      </pre>
    </section>
  );
}