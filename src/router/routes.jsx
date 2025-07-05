// src/router/routes.jsx
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthRole } from '../contexts/authRoleContext'

import DashboardCliente from '../pages/DashboardCliente'
import DashboardTrainer from '../pages/DashboardTrainer'
import Chat from '../pages/Chat'
import Settings from '../pages/Settings'
import Profile from '../pages/Profile'
import Login from '../pages/Login'
import ProtectedRoute from './ProtectedRoute'
import AdminPage from '../pages/AdminPage'
import AdminLogsPage from '../pages/AdminLogsPage'

function RoleRedirect() {
  const { user, loading } = useAuthRole()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin')
          break
        case 'cliente':
          navigate('/cliente')
          break
        case 'personal_trainer':
          navigate('/trainer')
          break
        default:
          navigate('/login')
      }
    }
  }, [user, loading, navigate])

  return <p>Redirecionando...</p>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cliente" element={<ProtectedRoute><DashboardCliente /></ProtectedRoute>} />
      <Route path="/trainer" element={<ProtectedRoute><DashboardTrainer /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="/admin/logs" element={<ProtectedRoute><AdminLogsPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/redirect" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/redirect" />} />
    </Routes>
  )
}

export default AppRoutes
