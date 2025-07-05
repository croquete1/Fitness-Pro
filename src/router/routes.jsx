// src/router/routes.jsx

import { Route, Routes, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

import Login from '../pages/Login'
import NotFound from '../pages/NotFound'

import AdminDashboard from '../pages/AdminDashboard'
import ClientDashboard from '../pages/ClientDashboard'
import TrainerDashboard from '../pages/TrainerDashboard'

import AdminOnly from '../pages/ProtectedRoutes/AdminOnly'
import ClienteOnly from '../pages/ProtectedRoutes/ClienteOnly'
import TrainerOnly from '../pages/ProtectedRoutes/TrainerOnly'

function RedirectByRole() {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>
  if (!user || !user.role) return <Navigate to="/login" replace />

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />
    case 'cliente':
      return <Navigate to="/cliente/dashboard" replace />
    case 'trainer':
      return <Navigate to="/trainer/dashboard" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RedirectByRole />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin/dashboard"
        element={
          <AdminOnly>
            <AdminDashboard />
          </AdminOnly>
        }
      />

      <Route
        path="/cliente/dashboard"
        element={
          <ClienteOnly>
            <ClientDashboard />
          </ClienteOnly>
        }
      />

      <Route
        path="/trainer/dashboard"
        element={
          <TrainerOnly>
            <TrainerDashboard />
          </TrainerOnly>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
