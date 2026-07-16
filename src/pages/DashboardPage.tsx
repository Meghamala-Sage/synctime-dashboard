import React from "react";
import ConnectorList from "../components/ConnectorList";

export default function DashboardPage() {
  return (
    <section style={{ padding: 24 }}>
      <h1>SyncTime Dashboard</h1>
      <ConnectorList />
    </section>
  );
}