import React from "react";
import { createRoot, Root } from "react-dom/client";
import Dashboard from "./Root";
import { configureApi } from "./api/syncTimeApi";
import "./styles.css";

export interface PortalProps {
  apiBaseUrl: string;
  environment: string;
  roles: string[];
}

let mounted: Root | undefined;

export function mount(element: HTMLElement, props: PortalProps): void {
  if (!element || mounted) throw new Error("Sync Dashboard mount target is unavailable");
  if (!props.apiBaseUrl.startsWith("/api/v1/")) throw new Error("Same-origin API is required");
  configureApi(props.apiBaseUrl, props.environment);
  mounted = createRoot(element);
  mounted.render(<Dashboard embedded authContext={{
    isAuthenticated: true,
    claims: { roles: props.roles }
  }} />);
}

export function unmount(): void {
  mounted?.unmount();
  mounted = undefined;
}
