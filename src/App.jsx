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

// Import de um componente de exemplo do Horizon UI
import Card from "components/card";

function DashboardHome() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <Card extra="p-6 bg-white dark:bg-navy-700 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-navy-700 dark:text-white">
          Bem-vindo ao Fitness Pro
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Este é um exemplo de cartão usando Horizon UI.
        </p>
      </Card>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
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

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard/cliente" /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard/cliente" /> : <Register />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard/cliente/*"
          element={<ClienteLayout><DashboardHome /></ClienteLayout>}
        />
        <Route
          path="/dashboard/pt/*"
          element={<TrainerLayout><DashboardHome /></TrainerLayout>}
        />
        <Route
          path="/dashboard/admin/*"
          element={<AdminLayout><DashboardHome /></AdminLayout>}
        />
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
