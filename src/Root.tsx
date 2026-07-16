import React from "react";
import { Provider } from "react-redux";

import { store } from "./store/store";
import AppRouter from "./router";

export interface RootProps {
  /**
   * Admin Portal can pass this later.
   * Local dev should leave it empty.
   *
   * Example future Admin Portal route:
   * /admin/connectors/sync-times
   */
  basePath?: string;

  /**
   * Optional DOM element id if host wants to mount somewhere other than #root.
   */
  domElementId?: string;

  /**
   * Placeholder for future host auth context.
   */
  authContext?: unknown;

  /**
   * Placeholder for future API base URL from host.
   */
  apiBaseUrl?: string;
}

const Root: React.FC<RootProps> = ({ basePath = "" }) => {
  console.log("[SyncTime Dashboard] Root rendered");

  return (
    <Provider store={store}>
      <div className="synctime-dashboard-shell">
        <header className="synctime-dashboard-header">
          <h1>SyncTime Dashboard</h1>
          <p>Local Dev Mode</p>
        </header>

        <main className="synctime-dashboard-main">
          <AppRouter basename={basePath} />
        </main>
      </div>
    </Provider>
  );
};

export default Root;