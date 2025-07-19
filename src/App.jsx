// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login              from './pages/Login.jsx'
import Register           from './pages/Register.jsx'
import DashboardCliente   from './pages/DashboardCliente.jsx'
import DashboardAdmin     from './pages/DashboardAdmin.jsx'
import DashboardTrainer   from './pages/DashboardTrainer.jsx'
import ProtectedRoute     from './components/ProtectedRoute.jsx'
import UsersManagement from './pages/UsersManagement.jsx'
import AppLayout       from './layouts/AppLayout.jsx'
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardCliente />} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="trainer" />}>
        <Route path="/trainer" element={<DashboardTrainer />} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin"   element={<DashboardAdmin />} />
      </Route>
  <Route element={<ProtectedRoute requiredRole="admin" />}>
    <Route
      path="/admin"
      element={
        <AppLayout>
          <DashboardAdmin />
        </AppLayout>
      }
    />
  </Route>
  <Route
    path="/admin/users"
    element={
      <AppLayout>
        <UsersManagement />
      </AppLayout>
    }
  />
    </Routes>
  )
}

export default App
