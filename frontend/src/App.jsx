import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./features/auth/Login";
import AuthCallback from "./features/auth/AuthCallback";
import Dashboard from "./features/dashboard/Dashboard";
import Home from "./features/dashboard/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import MyStandups from "./features/standups/MyStandups";
import ManageStandup from "./features/standups/ManageStandup";
import MyPolls from "./features/polls/MyPolls";
import ManagePoll from "./features/polls/ManagePoll";
import History from "./features/history/History";
import Settings from "./features/settings/Settings";
import MainLayout from "./components/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/standups" element={<MyStandups />} />
          <Route path="/standups/:id" element={<ManageStandup />} />
          <Route path="/polls" element={<MyPolls />} />
          <Route path="/polls/:id" element={<ManagePoll />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
