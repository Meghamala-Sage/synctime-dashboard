import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import type { ConnectorId, SyncTimes } from "../shared/types";
import { localConnectors, getSyncTimes, updateSyncTimes } from "../api/syncTimeApi";
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