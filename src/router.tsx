import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import ConnectorPage from "./pages/ConnectorPage";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/connector/:id" element={<ConnectorPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router; 