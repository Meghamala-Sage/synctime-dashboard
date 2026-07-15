import React, { useState } from "react";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const SyncTimeEditor = ({ schedule, onPreview }: any) => {
  const [localSchedule, setLocalSchedule] = useState(schedule);
  const [reason, setReason] = useState("");

  const handleChange = (day: string, value: string) => {
    setLocalSchedule({
      ...localSchedule,
      [day]: value
    });
  };

  return (
    <div>
      <h3>Edit SyncTime</h3>

      {days.map((day) => (
        <div key={day}>
          <label>{day}</label>
          <input
            value={localSchedule[day]}
            onChange={(e) => handleChange(day, e.target.value)}
          />
        </div>
      ))}

      <textarea
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <button onClick={() => onPreview(localSchedule, reason)}>
        Preview
      </button>
    </div>
  );
};

export default SyncTimeEditor;