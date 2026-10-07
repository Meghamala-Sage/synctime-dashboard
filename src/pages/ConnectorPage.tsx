import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getConnectorState, getHistory, saveSchedule, setRuleState, ConnectorState, HistoryEvent } from "../api/syncTimeApi";
import type { ConnectorId, SyncTimes } from "../shared/types";
import SyncTimeEditor from "../components/SyncTimeEditor";
import PreviewModal from "../components/PreviewModal";

export default function ConnectorPage() {
  const { id = "" } = useParams();
  const connector = id as ConnectorId;
  const { claims } = useAuth();
  const canManage = (claims.roles || []).includes("SyncTimeManage");
  const [state, setState] = useState<ConnectorState | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState<{ syncTimes: SyncTimes; reason: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [nextToken, setNextToken] = useState<string | undefined>();

  const refresh = () => getConnectorState(connector).then(setState).catch((e) => setError(e.message));
  useEffect(() => { setState(null); setError(""); void refresh(); }, [id]);

  async function loadHistory(token?: string) {
    try {
      const result = await getHistory(connector, token);
      setHistory(token ? [...history, ...result.events] : result.events);
      setNextToken(result.nextToken);
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "History unavailable"); }
  }

  async function confirmSave() {
    if (!pending || !state || !canManage) return;
    setBusy(true); setError("");
    try {
      const result = await saveSchedule(connector, pending.syncTimes, pending.reason, state.version);
      setState(result); setPending(null);
      if (showHistory) await loadHistory();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
    finally { setBusy(false); }
  }

  async function changeRule() {
    if (!state?.eventBridge || !canManage || !reason.trim()) {
      setError("Enter a reason before changing the rule state."); return;
    }
    const enabled = !state.eventBridge.isEnabled;
    if (!window.confirm(`${enabled ? "Enable" : "Disable"} sync for ${connector}?`)) return;
    setBusy(true); setError("");
    try {
      setState(await setRuleState(connector, enabled, reason.trim()));
      setReason("");
      if (showHistory) await loadHistory();
    } catch (e) { setError(e instanceof Error ? e.message : "Rule change failed"); }
    finally { setBusy(false); }
  }

  return <section style={{ maxWidth: 780, padding: 24 }}>
    <Link to="/">Back to connectors</Link>
    <h2>{id} sync schedule</h2>
    {error && <p role="alert" style={{ color: "#b00020" }}>{error}</p>}
    {!state ? <p>Loading current AWS state...</p> : <>
      <p>Environment: {state.environment} · Parameter: <code>{state.parameterName}</code> · Version: {state.version}</p>
      <button onClick={() => { setShowHistory(!showHistory); if (!showHistory) void loadHistory(); }}>
        {showHistory ? "Hide history" : "Show history"}
      </button>
      {showHistory && <section><h3>Change history</h3>
        <table><thead><tr><th>UTC time</th><th>Actor</th><th>Action</th><th>Result</th><th>Reason</th><th>Change ID</th></tr></thead>
          <tbody>{history.map((event, i) => <tr key={`${event.changeId}-${event.status}-${i}`}>
            <td>{event.timestampUtc}</td><td>{event.actorEmail}</td><td>{event.action}</td>
            <td>{event.status}</td><td>{event.reason}</td><td><details><summary>{event.changeId}</summary>
              <pre>Before: {JSON.stringify(event.before)}</pre><pre>After: {JSON.stringify(event.after)}</pre>
            </details></td>
          </tr>)}</tbody></table>
        {nextToken && <button onClick={() => void loadHistory(nextToken)}>More</button>}
      </section>}
      <h3>EventBridge rule</h3>
      <p>{state.eventBridge ? `${state.eventBridge.eventRuleName}: ${state.eventBridge.isEnabled ? "Enabled" : "Disabled"}` : "No rule configured"}</p>
      {canManage && state.eventBridge && <><label>Reason for rule change <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} /></label>
        <button disabled={busy} onClick={() => void changeRule()}>{state.eventBridge.isEnabled ? "Disable sync" : "Enable sync"}</button></>}
      {canManage ? <>
        <SyncTimeEditor schedule={state.syncTimes} disabled={busy} onPreview={(syncTimes, changeReason) => setPending({ syncTimes, reason: changeReason })} />
        <PreviewModal preview={pending ? { changes: Object.keys(pending.syncTimes).map((day) => ({
          day, before: state.syncTimes[day as keyof SyncTimes], after: pending.syncTimes[day as keyof SyncTimes],
          changed: state.syncTimes[day as keyof SyncTimes] !== pending.syncTimes[day as keyof SyncTimes]
        })) } : null} onConfirm={() => void confirmSave()} onCancel={() => setPending(null)} />
      </> : <p>You have read-only access.</p>}
    </>}
  </section>;
}
