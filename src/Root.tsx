import React from "react";
import { Provider } from "react-redux";

import { store } from "./store/store";
import AppRouter from "./router";
import { AuthProvider } from "./auth/AuthContext";
import type { HostAuth } from "./shared/types";

export interface RootProps {
  basePath?: string;
  domElementId?: string;
  authContext?: HostAuth;
  apiBaseUrl?: string;
}

const Root: React.FC<RootProps> = ({
  basePath = "",
  authContext
}) => {
  console.log("[SyncTime Dashboard] Root rendered");

  return (
    <Provider store={store}>
      <AuthProvider auth={authContext}>
        <div className="synctime-dashboard-shell">
          <header className="synctime-dashboard-header">
            <h1>SyncTime Dashboard</h1>
            <p>Local Dev Mode</p>
          </header>

          <main className="synctime-dashboard-main">
            <AppRouter basename={basePath} />
          </main>
        </div>
      </AuthProvider>
    </Provider>
  );
};

export default Root;