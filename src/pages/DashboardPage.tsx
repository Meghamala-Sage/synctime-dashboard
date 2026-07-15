import ConnectorList from "../components/ConnectorList";

export default function DashboardPage() {
  return (
    <>
      <h1>SyncTime Dashboard</h1>
      <p>Manage weekly UTC sync start times across connectors.</p>
      <ConnectorList />
    </>
  );
}