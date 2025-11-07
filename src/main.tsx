import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import InputSearch from "./components/InputSearch.tsx";
import TableView from "./TableView.tsx";
import EmergencyView from "./EmergencyView.tsx";
import Layout from "./Layout.tsx";
import MedicalHistoryView from "./components/medical/MedicalHistoryView.tsx";
import { SimpleProfileEdit } from "./components/medical/SimpleProfileEdit.tsx";
import { AllergyManager } from "./components/medical/AllergyManager.tsx";
import { MedicationManager } from "./components/medical/MedicationManager.tsx";
import { VaccinationManager } from "./components/medical/VaccinationManager.tsx";
import { LabResultsManager } from "./components/medical/LabResultsManager.tsx";
import { MedicalRecordsManager } from "./components/medical/MedicalRecordsManager.tsx";
import { DocumentManager } from "./components/medical/DocumentManager.tsx";
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

                {/* Rutas médicas - protegidas, usan Layout principal */}
                <Route path="/" element={<Layout><Outlet /></Layout>}>
                  <Route path="historial-medico" element={
                    <ProtectedRoute>
                      <MedicalHistoryView />
                    </ProtectedRoute>
                  } />

                  <Route path="perfil-medico" element={
                    <ProtectedRoute>
                      <SimpleProfileEdit />
                    </ProtectedRoute>
                  } />

                  <Route path="mis-alergias" element={
                    <ProtectedRoute>
                      <AllergyManager />
                    </ProtectedRoute>
                  } />

                  <Route path="medicamentos" element={
                    <ProtectedRoute>
                      <MedicationManager />
                    </ProtectedRoute>
                  } />

                  <Route path="visitas-medicas" element={
                    <ProtectedRoute>
                      <MedicalRecordsManager />
                    </ProtectedRoute>
                  } />

                  <Route path="vacunas" element={
                    <ProtectedRoute>
                      <VaccinationManager />
                    </ProtectedRoute>
                  } />

                  <Route path="resultados-laboratorio" element={
                    <ProtectedRoute>
                      <LabResultsManager />
                    </ProtectedRoute>
                  } />

                  <Route path="informes-medicos" element={
                    <ProtectedRoute>
                      <DocumentManager />
                    </ProtectedRoute>
                  } />
                </Route>
              </Routes>
            </Router>
          </AppInitializer>
        </AuthProvider>
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>
);
