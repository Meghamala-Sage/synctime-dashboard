import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import Root from "./Root";

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  errorBoundary(err: Error) {
    return <div>Error: {err.message}</div>;
  }
});

export const { bootstrap, mount, unmount } = lifecycles;