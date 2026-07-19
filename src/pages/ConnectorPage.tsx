import React, { useState } from "react";
import { useParams } from "react-router-dom";

import type {
  ConnectorId,
  SyncTimes,
  Weekday
} from "../shared/types";

import {
  DEFAULT_SYNC_TIMES,
  WEEKDAYS,
  validateSyncTimes
} from "../shared/validation";

import {
  localConnectors,
  updateSyncTimes
} from "../api/syncTimeApi";

const ENV = "dev03";

export default function ConnectorPage() {
  const { id } = useParams();

  const connectorId = (id as ConnectorId) || "ob";

  const connector = localConnectors.find(
    (c) => c.id === connectorId
  )!;

  const [syncTimes, setSyncTimes] =
    useState<SyncTimes>(DEFAULT_SYNC_TIMES);

  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateDay(day: Weekday, value: string) {
    setSyncTimes((prev) => ({
      ...prev,
      [day]: value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    const errors = validateSyncTimes(syncTimes);

    if (!reason) {
      errors.push("Reason required");
    }

    if (errors.length) {
      setError(errors.join(", "));
      return;
    }

    try {
      const res = await updateSyncTimes(
        connectorId,
        ENV as any,
        syncTimes,
        reason
      );

      setMessage("✅ Updated successfully");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>{connector.displayName}</h2>

      <form onSubmit={handleSubmit}>
        {WEEKDAYS.map((day) => (
          <div key={day}>
            <label>{day}</label>
            <input
              value={syncTimes[day]}
              onChange={(e) =>
                updateDay(day, e.target.value)
              }
            />
          </div>
        ))}

        <textarea
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <button type="submit">Update</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}