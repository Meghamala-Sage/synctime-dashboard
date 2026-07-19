import React from "react";
import { Provider } from "react-redux";

import { store } from "./store/store";
import AppRouter from "./router";

export interface RootProps {
  basePath?: string;
  domElementId?: string;
  authContext?: unknown;
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