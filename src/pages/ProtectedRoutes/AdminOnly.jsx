// src/pages/ProtectedRoutes/AdminOnly.jsx
import { Navigate } from 'react-router-dom'
import { useAuthRole } from '../../contexts/authRoleContext'

export default function AdminOnly({ children }) {
  const { user, loading } = useAuthRole()

  if (loading) return null

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />
  }

  return children
}
