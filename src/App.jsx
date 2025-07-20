// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login                     from './pages/Login.jsx'
import Register                  from './pages/Register.jsx'
import Pending                   from './pages/Pending.jsx'
import Home                      from './pages/Home.jsx'
import DashboardCliente          from './pages/DashboardCliente.jsx'
import DashboardTrainer          from './pages/DashboardTrainer.jsx'
import DashboardAdmin            from './pages/DashboardAdmin.jsx'
import AdminRegistrationRequests from './pages/AdminRegistrationRequests.jsx'
import UsersManagement           from './pages/UsersManagement.jsx'
import AdminAssignClients        from './pages/AdminAssignClients.jsx'
import AdminLogs                 from './pages/AdminLogs.jsx'
import AdminAccess               from './pages/AdminAccess.jsx'
import ProtectedRoute            from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      {/* raiz agora aponta para o login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pending" element={<Pending />} />

      {/* rotas protegidas para qualquer utilizador autenticado */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<DashboardCliente />} />
      </Route>

      {/* apenas trainer */}
      <Route element={<ProtectedRoute requiredRole="trainer" />}>
        <Route path="/trainer" element={<DashboardTrainer />} />
      </Route>

      {/* apenas admin */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/requests" element={<AdminRegistrationRequests />} />
        <Route path="/admin/users" element={<UsersManagement />} />
        <Route path="/admin/assign-clients" element={<AdminAssignClients />} />
        <Route path="/admin/logs" element={<AdminLogs />} />
        <Route path="/admin/access" element={<AdminAccess />} />
      </Route>

      {/* tudo o resto redireciona ao login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
