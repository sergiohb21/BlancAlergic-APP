import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import InputSearch from "./components/InputSearch.tsx";
import TableView from "./TableView.tsx";
import EmergencyView from "./EmergencyView.tsx";
import Layout from "./Layout.tsx";
import "./index.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";
import { AppInitializer } from "./components/AppInitializer";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="blancalergic-theme">
      <AppProvider>
        <AppInitializer>
          <Router basename="/BlancAlergic-APP/">
            <Layout>
              <Routes>
                <Route path="/" element={<Outlet />}/>
                <Route path="/buscarAlergias" element={<InputSearch />} />
                <Route path="/emergencias" element={<EmergencyView />} />
                <Route path="/tablaAlergias" element={<TableView />} />
              </Routes>
            </Layout>
          </Router>
        </AppInitializer>
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>
);
