import React from "react";
import * as ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";

import Root, { RootProps } from "./Root";
import "./styles.css";

declare global {
  interface Window {
    singleSpaNavigate?: unknown;
    __SYNC_TIME_DASHBOARD_LOCAL_ROOT__?: ReactDOMClient.Root;
  }
}

console.log("[SyncTime Dashboard] entry loaded");

function domElementGetter(props?: RootProps & { domElementId?: string }): HTMLElement {
  const domElementId = props?.domElementId || "root";
  let element = document.getElementById(domElementId);

  if (!element) {
    element = document.createElement("div");
    element.id = domElementId;
    document.body.appendChild(element);
  }

  return element;
}

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  domElementGetter,
  errorBoundary(error: Error) {
    return (
      <div style={{ padding: 24, color: "#b00020" }}>
        <h2>SyncTime Dashboard failed to load</h2>
        <pre>{error.message}</pre>
      </div>
    );
  }
} as any);

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;

if (!window.singleSpaNavigate) {
  console.log("[SyncTime Dashboard] standalone local render started");

  const container = domElementGetter();

  if (!window.__SYNC_TIME_DASHBOARD_LOCAL_ROOT__) {
    window.__SYNC_TIME_DASHBOARD_LOCAL_ROOT__ =
      ReactDOMClient.createRoot(container);
  }

  window.__SYNC_TIME_DASHBOARD_LOCAL_ROOT__.render(<Root />);
}