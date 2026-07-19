import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import ConnectorPage from "./pages/ConnectorPage";

export interface AppRouterProps {
  basename?: string;
}

const AppRouter: React.FC<AppRouterProps> = ({ basename = "" }) => {
  console.log("[SyncTime Dashboard] Router rendered", { basename });

  return (
    <BrowserRouter basename={basename || undefined}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/connector/:id" element={<ConnectorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;