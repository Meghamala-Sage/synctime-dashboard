import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setConnectors } from "../store/syncTimesSlice";
import { syncTimeApi  } from "../api/syncTimeApi";
import { useNavigate } from "react-router-dom";

const ConnectorList = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { connectors, loading, error } = useAppSelector(
    (state) => state.syncTimes
  );

  useEffect(() => {
    const load = async () => {
      const data = await syncTimeApi.getConnectors();
      dispatch(setConnectors(data));
    };
    load();
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading connectors</p>;

  return (
    <div>
      <h2>Connectors</h2>
      {connectors.map((c: any) => (
        <div key={c.id}>
          <button onClick={() => navigate(`/connector/${c.id}`)}>
            {c.displayName}
          </button>
        </div>
      ))}
    </div>
  );
};

export default ConnectorList;