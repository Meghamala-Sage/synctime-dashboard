import React from "react";

const PreviewModal = ({ preview, onConfirm, onCancel }: any) => {
  if (!preview) return null;

  return (
    <div style={{ border: "1px solid black", padding: 20 }}>
      <h3>Preview Changes</h3>

      {preview.changes.map((c: any) => (
        <div key={c.day}>
          {c.day}: {c.before} → {c.after}
        </div>
      ))}

      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default PreviewModal;