import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import InputSearch from "./components/InputSearch.tsx";
import "beercss";
import "material-dynamic-colors";
import Layout from "./Layaout.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Outlet />}/>
          <Route path="/buscarAlergias" element={<InputSearch />} />
          <Route path="/emergencias" element={<InputSearch />} />
          <Route path="/tablaAlergias" element={<InputSearch />} />
        </Routes>
      </Layout>
    </Router>
  </React.StrictMode>
);
