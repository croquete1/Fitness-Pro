// src/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { CSpinner } from '@coreui/react'


export default function ProtectedRoute({ requiredRole }) {
  const { user, role, loading } = useAuth()
  console.log('ProtectedRoute:', { user, role, loading })

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <CSpinner />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />
  return <Outlet />
}
