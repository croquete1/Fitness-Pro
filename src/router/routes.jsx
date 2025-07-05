// src/router/routes.jsx

import { Route, Routes, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useAuth } from '../hooks/useAuth'

const Login = lazy(() => import('../pages/Login'))
const NotFound = lazy(() => import('../pages/NotFound'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const ClientDashboard = lazy(() => import('../pages/ClientDashboard'))
const TrainerDashboard = lazy(() => import('../pages/TrainerDashboard'))
const Chat = lazy(() => import('../pages/Chat'))
const Settings = lazy(() => import('../pages/Settings'))
const AdminNotificationCreate = lazy(() => import('../pages/AdminNotificationCreate'))

const AdminOnly = lazy(() => import('../pages/ProtectedRoutes/AdminOnly'))
const ClienteOnly = lazy(() => import('../pages/ProtectedRoutes/ClienteOnly'))
const TrainerOnly = lazy(() => import('../pages/ProtectedRoutes/TrainerOnly'))

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
    <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando...</div>}>
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
          path="/admin/notificacoes/criar"
          element={
            <AdminOnly>
              <AdminNotificationCreate />
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

        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
