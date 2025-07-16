// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ClienteLayout from "./layouts/ClienteLayout";
import TrainerLayout from "./layouts/TrainerLayout";
import AdminLayout from "./layouts/AdminLayout";

import DashboardCliente from "./pages/DashboardCliente";
import DashboardPT from "./pages/DashboardPT";
import DashboardAdmin from "./pages/DashboardAdmin";

function AppRoutes() {
  const { user, loading, role } = useAuth(); // pressupondo que o contexto disponibiliza "role"

  if (loading) return <div>Carregando...</div>;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/dashboard/${role}`} replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to={`/dashboard/${role}`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/dashboard/${role}`} /> : <Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/cliente" element={<ClienteLayout><DashboardCliente /></ClienteLayout>} />
        <Route path="/dashboard/pt" element={<TrainerLayout><DashboardPT /></TrainerLayout>} />
        <Route path="/dashboard/admin" element={<AdminLayout><DashboardAdmin /></AdminLayout>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
