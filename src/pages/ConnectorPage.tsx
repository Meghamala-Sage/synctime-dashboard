import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { syncTimeApi } from "../api/syncTimeApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSchedule, setPreview } from "../store/syncTimesSlice";

import SyncTimeEditor from "../components/SyncTimeEditor";
import PreviewModal from "../components/PreviewModal";
import StatusPanel from "../components/StatusPanel";

const ConnectorPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const { schedule, preview } = useAppSelector(
    (state) => state.syncTimes
  );

  useEffect(() => {
    const load = async () => {
      const data = await syncTimeApi.getSchedule();
      dispatch(setSchedule(data.schedule));
    };
    load();
  }, [dispatch]);

  const handlePreview = async (schedule: any, reason: string) => {
    const data = await syncTimeApi.preview({ schedule, reason });
    dispatch(setPreview(data));
  };

  const handleConfirm = async () => {
    await syncTimeApi.update({ schedule });
    alert("✅ SyncTime updated");
  };

  return (
    <div>
      <h2>Connector: {id}</h2>

      <StatusPanel />

      {schedule && (
        <SyncTimeEditor schedule={schedule} onPreview={handlePreview} />
      )}

      <PreviewModal
        preview={preview}
        onConfirm={handleConfirm}
        onCancel={() => dispatch(setPreview(null))}
      />
    </div>
  );
};

export default ConnectorPage;