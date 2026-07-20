import React from "react";

interface ChangeItem {
  day: string;
  before: string;
  after: string;
  changed: boolean;
}

interface PreviewModalProps {
  preview: { changes: ChangeItem[] } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ preview, onConfirm, onCancel }) => {
  if (!preview) return null;

  const hasChanges = preview.changes.some((c) => c.changed);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
      }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 8, padding: 28, width: 480,
          maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
        }}
      >
        <h3 style={{ marginTop: 0 }}>Preview Changes</h3>

        {!hasChanges && (
          <p style={{ color: "#697586" }}>No values were changed.</p>
        )}

        <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: 16 }}>
          <thead>
            <tr>
              <th style={thStyle}>Day</th>
              <th style={thStyle}>Before</th>
              <th style={thStyle}>After</th>
            </tr>
          </thead>
          <tbody>
            {preview.changes.map((c) => (
              <tr key={c.day} style={{ background: c.changed ? "#fffbea" : "transparent" }}>
                <td style={tdStyle}>{c.day}</td>
                <td style={{ ...tdStyle, color: c.changed ? "#b00020" : "inherit" }}>{c.before}</td>
                <td style={{ ...tdStyle, color: c.changed ? "#1a7f37" : "inherit", fontWeight: c.changed ? 600 : 400 }}>
                  {c.after}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{ padding: "8px 18px", border: "1px solid #cdd5df", borderRadius: 4, background: "#fff", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!hasChanges}
            style={{
              padding: "8px 18px", border: "none", borderRadius: 4, cursor: hasChanges ? "pointer" : "not-allowed",
              background: hasChanges ? "#0070f0" : "#aaa", color: "#fff"
            }}
          >
            Confirm &amp; Save
          </button>
        </div>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: "left", padding: "6px 10px", borderBottom: "2px solid #dde2e8", fontWeight: 600
};

const tdStyle: React.CSSProperties = {
  padding: "6px 10px", borderBottom: "1px solid #eef0f2"
};

export default PreviewModal;