import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import ConnectorPage from "./pages/ConnectorPage";

interface AppRouterProps {
  basename?: string;
}

const AppRouter: React.FC<AppRouterProps> = ({ basename = "" }) => {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/connector/:id" element={<ConnectorPage />} />

        {/* Prevent blank screen for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;