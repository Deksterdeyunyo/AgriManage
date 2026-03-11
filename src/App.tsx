/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import SeedsInventory from "./pages/SeedsInventory";
import FertilizersInventory from "./pages/FertilizersInventory";
import VetChemicals from "./pages/VetChemicals";
import PesticidesInventory from "./pages/PesticidesInventory";
import Recipients from "./pages/Recipients";
import Distribution from "./pages/Distribution";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Login from "./pages/Login";

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('agri_user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="seeds" element={<SeedsInventory />} />
          <Route path="fertilizers" element={<FertilizersInventory />} />
          <Route path="vet-chemicals" element={<VetChemicals />} />
          <Route path="pesticides" element={<PesticidesInventory />} />
          <Route path="recipients" element={<Recipients />} />
          <Route path="distribution" element={<Distribution />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
