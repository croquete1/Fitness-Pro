// src/pages/ProtectedRoutes/ClienteOnly.jsx
import { Navigate } from 'react-router-dom'
import { useAuthRole } from '../../contexts/authRoleContext'

export default function ClienteOnly({ children }) {
  const { user, loading } = useAuthRole()

  if (loading) return null
  if (!user || user.role !== 'cliente') return <Navigate to="/unauthorized" />

  return children
}
