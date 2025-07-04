import { Navigate } from "react-router-dom";
import { useAuthRole } from '../contexts/authRoleContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthRole()

  if (loading) return <div>Carregando...</div>
  if (!user) return <Navigate to="/login" />
  if (!user.role || user.role === 'client') return <div>Conta pendente de aprovação.</div>

  return children
}
export function AdminOnly({ children }) {
  const { isAdmin, loading } = useAuthRole()
  if (loading) return <div className="p-4">Verificando...</div>
  return isAdmin ? children : <Navigate to="/login" replace />
}

export function TrainerOnly({ children }) {
  const { isTrainer, loading } = useAuthRole();
  if (loading) return <div className="p-4">Verificando...</div>;
  return isTrainer ? children : <Navigate to="/login" replace />;
}

export function ClienteOnly({ children }) {
  const { isClient, loading } = useAuthRole();
  if (loading) return <div className="p-4">Verificando...</div>;
  return isClient ? children : <Navigate to="/login" replace />;
}
