import React from "react";
import { useAppSelector } from "../store/hooks";

const StatusPanel = () => {
  const { schedule } = useAppSelector((state) => state.syncTimes);

  if (!schedule) return null;

  return (
    <div>
      <h3>Current Schedule</h3>
      {Object.entries(schedule).map(([day, value]) => (
        <div key={day}>
          {day}: {value as string}
        </div>
      ))}
    </div>
  );
};

export default StatusPanel;