// src/router/routes.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthRole } from '../contexts/authRoleContext'
import LoginForm from '../pages/LoginForm'
import RegisterForm from '../pages/RegisterForm'
import AdminDashboard from '../pages/AdminDashboard'
import DashboardTrainer from '../pages/DashboardTrainer'
import DashboardCliente from '../pages/DashboardCliente'
import RoleBasedPages from '../pages/RoleBasedPages'
import Chat from '../pages/Chat'
import Settings from '../pages/Settings'
import NotFound from '../pages/NotFound' // opcional, se quiseres uma página 404

function ProtectedRoute({ children }) {
  const { user } = useAuthRole()
  if (!user) return <Navigate to="/login" />
  return children
}

export default function AppRoutes() {
  const { user } = useAuthRole()

  const renderDashboard = () => {
    if (!user) return <Navigate to="/login" />
    if (user.role === 'admin') return <AdminDashboard />
    if (user.role === 'trainer') return <DashboardTrainer />
    if (user.role === 'cliente') return <DashboardCliente />
    return <Navigate to="/login" />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedRoute>{renderDashboard()}</ProtectedRoute>} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        <Route path="/painel" element={<ProtectedRoute><RoleBasedPages /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}
