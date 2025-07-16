// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClienteLayout from "./layouts/ClienteLayout";
import TrainerLayout from "./layouts/TrainerLayout";
import AdminLayout from "./layouts/AdminLayout";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rota inicial */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard/cliente" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Rotas públicas */}
      <Route
        path="/login"
        element={
          user ? <Navigate to="/dashboard/cliente" replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          user ? <Navigate to="/dashboard/cliente" replace /> : <Register />
        }
      />

      {/* Rotas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/cliente/*" element={<ClienteLayout />} />
        <Route path="/dashboard/pt/*" element={<TrainerLayout />} />
        <Route path="/dashboard/admin/*" element={<AdminLayout />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
