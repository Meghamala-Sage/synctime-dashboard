import React from "react";
import * as ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./Root";
import "./styles.css";

declare global {
  interface Window {
    singleSpaNavigate?: unknown;
    __SYNC_TIME_DASHBOARD_ROOT__?: ReactDOMClient.Root;
  }
}

/**
 * single-spa lifecycle setup.
 *
 * React 18 + older single-spa-react typings may not accept `ReactDOMClient`.
 * So we pass the react-dom/client module through the legacy `ReactDOM` option
 * and explicitly set renderType to createRoot.
 */
const lifecycles = singleSpaReact({
  React,
  ReactDOM: ReactDOMClient as any,
  renderType: "createRoot",
  rootComponent: Root as any,

  errorBoundary(err: Error) {
    return (
      <div style={{ padding: 24, color: "red" }}>
        <h2>SyncTime Dashboard failed to load</h2>
        <pre>{err.message}</pre>
      </div>
    );
  }
});

export const { bootstrap, mount, unmount } = lifecycles;

/**
 * Local standalone rendering.
 *
 * In Admin Portal, single-spa owns mounting.
 * In local dev, there is no host root-config, so we render manually.
 */
if (!window.singleSpaNavigate) {
  const container = document.getElementById("root");

  if (!container) {
    throw new Error(
      "Local render failed: #root element was not found. Check src/index.ejs."
    );
  }

  if (!window.__SYNC_TIME_DASHBOARD_ROOT__) {
    window.__SYNC_TIME_DASHBOARD_ROOT__ =
      ReactDOMClient.createRoot(container);
  }

  window.__SYNC_TIME_DASHBOARD_ROOT__.render(<Root />);
}