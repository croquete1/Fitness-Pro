import { Navigate } from "react-router-dom";
import { useAuthRole } from "../contexts/authRoleContext";

export function AdminOnly({ children }) {
  const { isAdmin, loading } = useAuthRole();
  if (loading) return <div className="p-4">Verificando...</div>;
  return isAdmin ? children : <Navigate to="/login" replace />;
}

export function TrainerOnly({ children }) {
  const { isTrainer, loading } = useAuthRole();
  if (loading) return <div className="p-4">Verificando...</div>;
  return isTrainer ? children : <Navigate to="/login" replace />;
}

export function ClienteOnly({ children }) {
  const { isCliente, loading } = useAuthRole();
  if (loading) return <div className="p-4">Verificando...</div>;
  return isCliente ? children : <Navigate to="/login" replace />;
}
