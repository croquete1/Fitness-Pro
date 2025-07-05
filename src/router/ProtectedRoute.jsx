import { Navigate } from "react-router-dom"
import { useAuthRole } from "../contexts/authRoleContext"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthRole()

  if (loading) return <p>A verificar permissões...</p>

  if (!user) return <Navigate to="/login" replace />

  return children
}
