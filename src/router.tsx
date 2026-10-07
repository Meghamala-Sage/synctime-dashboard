import React from "react";
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import ConnectorPage from "./pages/ConnectorPage";

export interface AppRouterProps {
  basename?: string;
  embedded?: boolean;
}

const AppRouter: React.FC<AppRouterProps> = ({ basename = "", embedded = false }) => {
  console.log("[SyncTime Dashboard] Router rendered", { basename });

  const Router = embedded ? MemoryRouter : BrowserRouter;
  return (
    <Router basename={embedded ? undefined : basename || undefined}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/connector/:id" element={<ConnectorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
