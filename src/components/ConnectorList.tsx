import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ConnectorConfig } from "../shared/types";
import { getConnectors } from "../api/syncTimeApi";

export default function ConnectorList() {
  const [connectors, setConnectors] = useState<ConnectorConfig[]>([]);

  useEffect(() => {
    getConnectors().then(setConnectors);
  }, []);

  return (
    <section>
      <h2>Connectors</h2>
      <p>Select a connector to edit its dev03 SyncTimes parameter.</p>

      {connectors.length === 0 && <p>No connectors found.</p>}

      <ul>
        {connectors.map((connector) => (
          <li key={connector.id} style={{ marginBottom: 12 }}>
            <Link to={`/connector/${connector.id}`}>
              {connector.displayName}
            </Link>
            <br />
            <small>{connector.parameterName}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}