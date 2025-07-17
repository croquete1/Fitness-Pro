// 📁 src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClienteLayout from "./layouts/ClienteLayout";
import TrainerLayout from "./layouts/TrainerLayout";
import AdminLayout from "./layouts/AdminLayout";
import TestChartPage from "./pages/TestChartPage";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  return (
    <Routes>
      {/* Rota root: redireciona conforme autenticação */}
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

      {/* Login e registo */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard/cliente" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard/cliente" replace /> : <Register />}
      />

      {/* Rota de teste para gráfico */}
      <Route path="/test-chart" element={<TestChartPage />} />

      {/* Rotas protegidas por utilizador autenticado */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/cliente/*" element={<ClienteLayout />} />
        <Route path="/dashboard/pt/*" element={<TrainerLayout />} />
        <Route path="/dashboard/admin/*" element={<AdminLayout />} />
      </Route>

      {/* Redirecionamento para root por defeito */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
