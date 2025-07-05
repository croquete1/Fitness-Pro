// src/pages/ProtectedRoutes/TrainerOnly.jsx
import { Navigate } from 'react-router-dom'
import { useAuthRole } from '../../contexts/authRoleContext'

export default function TrainerOnly({ children }) {
  const { user, loading } = useAuthRole()

  if (loading) return null
  if (!user || user.role !== 'trainer') return <Navigate to="/login" />

  return children
}
