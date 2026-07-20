import React, { useEffect, useState } from "react";

import type { SyncTimes } from "../shared/types";
import { WEEKDAYS, validateSyncTimes } from "../shared/validation";

interface SyncTimeEditorProps {
  schedule: SyncTimes;
  onPreview: (edited: SyncTimes, reason: string) => void;
  disabled?: boolean;
}

const SyncTimeEditor: React.FC<SyncTimeEditorProps> = ({ schedule, onPreview, disabled = false }) => {
  const [localSchedule, setLocalSchedule] = useState<SyncTimes>({ ...schedule });
  const [reason, setReason] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Sync incoming schedule (e.g. after a successful save)
  useEffect(() => {
    setLocalSchedule({ ...schedule });
  }, [schedule]);

  function handleChange(day: keyof SyncTimes, value: string) {
    setLocalSchedule((prev) => ({ ...prev, [day]: value }));
    setValidationErrors([]);
  }

  function handlePreviewClick() {
    const errors = validateSyncTimes(localSchedule);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (!reason.trim()) {
      setValidationErrors(["Please enter a reason for this change."]);
      return;
    }

    setValidationErrors([]);
    onPreview(localSchedule, reason.trim());
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ marginBottom: 12 }}>Edit SyncTimes</h3>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={thStyle}>Day</th>
            <th style={thStyle}>Time (HH:mm:ss.SSS)</th>
          </tr>
        </thead>
        <tbody>
          {WEEKDAYS.map((day) => (
            <tr key={day}>
              <td style={tdStyle}>{day}</td>
              <td style={tdStyle}>
                <input
                  type="text"
                  value={localSchedule[day]}
                  onChange={(e) => handleChange(day, e.target.value)}
                  disabled={disabled}
                  placeholder="07:00:00.000"
                  style={inputStyle}
                  aria-label={`SyncTime for ${day}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="reason" style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
          Reason for change *
        </label>
        <textarea
          id="reason"
          placeholder="Describe why you are updating this schedule…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={disabled}
          rows={3}
          style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: 4, border: "1px solid #cdd5df" }}
        />
      </div>

      {validationErrors.length > 0 && (
        <ul style={{ color: "#b00020", background: "#fff3f3", padding: "8px 12px", borderRadius: 4, listStyle: "disc inside", marginTop: 8 }}>
          {validationErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <button
        onClick={handlePreviewClick}
        disabled={disabled}
        style={{ marginTop: 16, padding: "8px 20px", background: "#0070f0", color: "#fff", border: "none", borderRadius: 4, cursor: disabled ? "not-allowed" : "pointer" }}
      >
        Preview Changes
      </button>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "6px 12px",
  borderBottom: "2px solid #dde2e8",
  fontWeight: 600
};

const tdStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderBottom: "1px solid #eef0f2"
};

const inputStyle: React.CSSProperties = {
  padding: "4px 8px",
  border: "1px solid #cdd5df",
  borderRadius: 4,
  width: 160
};

export default SyncTimeEditor;