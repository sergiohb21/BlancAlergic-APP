import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import InputSearch from "./components/InputSearch.tsx";
import TableView from "./TableView.tsx";
import EmergencyView from "./EmergencyView.tsx";
import Layout from "./Layout.tsx";
import MedicalDashboardFirebase from "./components/medical/MedicalDashboardFirebase.tsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.tsx";
import "./index.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AppInitializer } from "./components/AppInitializer";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="blancalergic-theme">
      <AppProvider>
        <AuthProvider>
          <AppInitializer>
            <Router basename="/BlancAlergic-APP/">
              <Routes>
                {/* Rutas públicas - usan Layout */}
                <Route path="/" element={<Layout><Outlet /></Layout>}>
                  <Route index element={<div />} />
                  <Route path="buscarAlergias" element={<InputSearch />} />
                  <Route path="emergencias" element={<EmergencyView />} />
                  <Route path="tablaAlergias" element={<TableView />} />
                </Route>

                {/* Rutas premium - protegidas, sin Layout */}
                <Route path="/historial-medico" element={
                  <ProtectedRoute>
                    <MedicalDashboardFirebase />
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </AppInitializer>
        </AuthProvider>
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>
);
