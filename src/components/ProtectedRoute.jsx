// src/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function ProtectedRoute({ requiredRole }) {
  const { user, loading } = useAuth()

  // 1. Enquanto carrega o estado de autenticação
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <CSpinner />
      </div>
    )
  }

  // 2. Se não estiver autenticado, vai para login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 3. Se estiver pendente, redireciona para /pending
  if (user.role === 'pending') {
    return <Navigate to="/pending" replace />
  }

  // 4. Se tiver requiredRole e não bater, volta ao login
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />
  }

  // 5. Tudo ok, renderiza a rota aninhada via <Outlet/>
  return <Outlet />
}
