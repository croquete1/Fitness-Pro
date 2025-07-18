// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login             from './pages/Login.jsx'
import Register          from './pages/Register.jsx'
import DashboardCliente  from './pages/DashboardCliente.jsx'
import DashboardAdmin    from './pages/DashboardAdmin.jsx'
import ProtectedRoute    from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
-     <Route path="/" element={<Navigate to="/login" replace />} />
+     <Route path="/" element={<Login />} />

      {/* ainda mantemos /login caso alguém use esse link */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rotas autenticadas para todos os users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardCliente />} />
      </Route>

      {/* Rotas só para Admin */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<DashboardAdmin />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div>Página não encontrada</div>} />
    </Routes>
  )
}
