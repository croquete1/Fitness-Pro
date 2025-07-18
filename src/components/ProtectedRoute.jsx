// src/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CSpinner } from '@coreui/react'

export default function ProtectedRoute({ requiredRole }) {
  const { user, role, loading } = useAuth()

  // Enquanto valida o estado de autenticação
  if (loading) {
    return (
      <div className="text-center mt-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  // Se não estiver logado, redireciona para /login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Se for necessária uma role específica e o user não tiver, redireciona para /
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  // Caso tudo esteja OK, renderiza as rotas filhas
  return <Outlet />
}
