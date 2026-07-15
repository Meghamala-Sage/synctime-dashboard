import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import Router from "./router";

const Root = () => {
  return (
    <Provider store={store}>
      <Router />
    </Provider>
  );
};

export default Root;