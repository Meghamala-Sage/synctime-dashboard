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

// ---- Error boundary so any render crash shows a visible message ----
interface EBState { error: Error | null }

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, EBState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[SyncTime Dashboard] Render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "monospace", color: "#b00020", background: "#fff3f3" }}>
          <h2>SyncTime Dashboard — render error</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#555" }}>{this.state.error.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
// --------------------------------------------------------------------

const Root: React.FC<RootProps> = ({
  basePath = "",
  authContext
}) => {
  console.log("[SyncTime Dashboard] Root rendered");

  return (
    <AppErrorBoundary>
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
    </AppErrorBoundary>
  );
};

export default Root;