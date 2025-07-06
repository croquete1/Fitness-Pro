import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function RedirectByRole() {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>
  if (!user || !user.role) return <Navigate to="/login" replace />

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />
    case 'cliente':
      return <Navigate to="/cliente/dashboard" replace />
    case 'trainer':
      return <Navigate to="/trainer/dashboard" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

export default RedirectByRole
