import React from "react";
import { Link } from "react-router-dom";
import { localConnectors } from "../api/syncTimeApi";

export default function ConnectorList() {
  return (
    <div>
      <h2>Connectors</h2>

      {localConnectors.map((c) => (
        <div key={c.id}>
          <Link to={`/connector/${c.id}`}>
            {c.displayName}
          </Link>
        </div>
      ))}
    </div>
  );
}