import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { ConnectorConfig } from "../shared/types";
import { getConnectors } from "../api/syncTimeApi";

export default function ConnectorList() {
  const [connectors, setConnectors] = useState<ConnectorConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadConnectors() {
      try {
        const result = await getConnectors();

        if (isMounted) {
          setConnectors(result);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load connectors");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadConnectors();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <p>Loading connectors...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <section>
      <h2>Connectors</h2>
      <p>Select a connector to edit its dev03 SyncTimes parameter.</p>

      <ul>
        {connectors.map((connector: ConnectorConfig) => (
          <li key={connector.id} style={{ marginBottom: 12 }}>
            <Link to={`/connector/${connector.id}`}>{connector.displayName}</Link>
            <br />
            <small>{connector.parameterName}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}