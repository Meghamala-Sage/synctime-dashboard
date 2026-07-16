import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import AppRouter from "./router";

export interface RootProps {
  /**
   * Admin Portal can pass this later.
   * Local dev should keep it empty.
   */
  basePath?: string;
}

const Root: React.FC<RootProps> = ({ basePath = "" }) => {
  return (
    <Provider store={store}>
      <AppRouter basename={basePath} />
    </Provider>
  );
};

export default Root;