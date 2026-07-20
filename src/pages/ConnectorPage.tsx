import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import type { ConnectorId, SyncTimes, EventBridgeState } from "../shared/types";
import { localConnectors, getSyncTimes, updateSyncTimes, getEventBridgeState, toggleEventBridge } from "../api/syncTimeApi";
import { DEFAULT_SYNC_TIMES } from "../shared/validation";
import SyncTimeEditor from "../components/SyncTimeEditor";
import PreviewModal from "../components/PreviewModal";

type ChangeItem = { day: string; before: string; after: string; changed: boolean };

export default function ConnectorPage() {
  const { id } = useParams<{ id: string }>();
  const connector = localConnectors.find((c) => c.id === id);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [schedule, setSchedule] = useState<SyncTimes>({ ...DEFAULT_SYNC_TIMES });
  const [pendingUpdate, setPendingUpdate] = useState<{ edited: SyncTimes; reason: string } | null>(null);
  const [preview, setPreview] = useState<{ changes: ChangeItem[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null);
  
  // EventBridge state
  const [eventBridgeState, setEventBridgeState] = useState<EventBridgeState | null>(null);
  const [ebToggling, setEbToggling] = useState(false);
  const [ebToggleResult, setEbToggleResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!connector) {
      setLoading(false);
      setLoadError("Unknown connector");
      return;
    }

    let isMounted = true;

    getSyncTimes(id as ConnectorId, "dev03")
      .then((times) => {
        if (isMounted) setSchedule(times);
      })
      .catch((err) => {
        if (isMounted) {
          setLoadError(err instanceof Error ? err.message : "Failed to load SyncTimes");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Load EventBridge state in parallel
    getEventBridgeState(id as ConnectorId, "dev03")
      .then((state) => {
        if (isMounted) setEventBridgeState(state);
      })
      .catch((err) => {
        console.warn("Failed to load EventBridge state:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [id, connector]);

  function handlePreview(edited: SyncTimes, reason: string) {
    const changes: ChangeItem[] = Object.keys(edited).map((day) => {
      const d = day as keyof SyncTimes;
      return {
        day,
        before: schedule[d],
        after: edited[d],
        changed: schedule[d] !== edited[d]
      };
    });

    setPendingUpdate({ edited, reason });
    setPreview({ changes });
    setSaveResult(null);
  }

  async function handleConfirm() {
    if (!pendingUpdate) return;

    const { edited, reason } = pendingUpdate;

    setSaving(true);
    setPreview(null);

    try {
      const result = await updateSyncTimes(id as ConnectorId, "dev03", edited, reason);
      setSchedule(edited);
      setPendingUpdate(null);
      setSaveResult({ ok: true, message: result.message });
    } catch (err) {
      setSaveResult({
        ok: false,
        message: err instanceof Error ? err.message : "Update failed"
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEventBridgeToggle() {
    if (!eventBridgeState) return;

    setEbToggling(true);
    setEbToggleResult(null);

    try {
      const newState = await toggleEventBridge(
        id as ConnectorId,
        "dev03",
        !eventBridgeState.isEnabled
      );
      setEventBridgeState(newState);
      setEbToggleResult({
        ok: true,
        message: newState.isEnabled ? "EventBridge rule enabled" : "EventBridge rule disabled"
      });
    } catch (err) {
      setEbToggleResult({
        ok: false,
        message: err instanceof Error ? err.message : "Failed to toggle EventBridge"
      });
    } finally {
      setEbToggling(false);
    }
  }

  if (loading) return <p style={{ padding: 24 }}>Loading SyncTimes from Parameter Store…</p>;

  if (!connector) {
    return (
      <p style={{ padding: 24, color: "red" }}>
        Connector &quot;{id}&quot; not found. <Link to="/">← Back</Link>
      </p>
    );
  }

  return (
    <section style={{ maxWidth: 620 }}>
      <p>
        <Link to="/">← Back to connectors</Link>
      </p>

      <h2 style={{ marginTop: 8 }}>{connector.displayName}</h2>
      <p style={{ color: "#697586", marginTop: 4 }}>
        Parameter Store key: <code>{connector.parameterName}</code>
      </p>

      {loadError && (
        <p style={{ color: "#b00020", background: "#fff3f3", padding: "8px 12px", borderRadius: 4 }}>
          {loadError}
        </p>
      )}

      {/* EventBridge Toggle Section */}
      <div style={{ background: "#f5f5f5", padding: 16, borderRadius: 8, marginTop: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0" }}>Skip Sync Schedule</h4>
            <p style={{ margin: 0, fontSize: 12, color: "#697586" }}>
              {!eventBridgeState ? "Loading EventBridge state..." : "Disable EventBridge to stop automated syncing"}
            </p>
          </div>
          <button
            onClick={handleEventBridgeToggle}
            disabled={ebToggling || !eventBridgeState}
            style={{
              padding: "8px 16px",
              border: "2px solid transparent",
              borderRadius: 4,
              background: eventBridgeState?.isEnabled ? "#ffc107" : "#4CAF50",
              color: "#000",
              cursor: ebToggling || !eventBridgeState ? "not-allowed" : "pointer",
              fontWeight: 600,
              opacity: ebToggling || !eventBridgeState ? 0.6 : 1
            }}
          >
            {ebToggling ? "Updating..." : eventBridgeState?.isEnabled ? "Disable Sync" : "Enable Sync"}
          </button>
        </div>
        {eventBridgeState && (
          <p style={{ fontSize: 12, color: "#555", marginTop: 8 }}>
            Status: <strong>{eventBridgeState.isEnabled ? "✓ Enabled" : "✗ Disabled"}</strong>
          </p>
        )}
        {ebToggleResult && (
          <p
            style={{
              color: ebToggleResult.ok ? "#1a7f37" : "#b00020",
              background: ebToggleResult.ok ? "#f0fff4" : "#fff3f3",
              padding: "6px 10px",
              borderRadius: 4,
              fontSize: 12,
              marginTop: 8
            }}
          >
            {ebToggleResult.message}
          </p>
        )}
      </div>

      {saveResult && (
        <p
          style={{
            color: saveResult.ok ? "#1a7f37" : "#b00020",
            background: saveResult.ok ? "#f0fff4" : "#fff3f3",
            padding: "8px 12px",
            borderRadius: 4
          }}
        >
          {saveResult.message}
        </p>
      )}

      {saving && <p style={{ color: "#697586" }}>Saving to Parameter Store…</p>}

      <SyncTimeEditor schedule={schedule} onPreview={handlePreview} disabled={saving} />

      <PreviewModal preview={preview} onConfirm={handleConfirm} onCancel={() => setPreview(null)} />
    </section>
  );
}