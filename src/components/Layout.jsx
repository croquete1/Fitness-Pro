import React from 'react'
import {
  CSidebar,
  CSidebarNav,
  CNavItem,
  CHeader,
  CContainer,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilUser,
  cilCalendar,
} from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Link, useNavigate } from 'react-router-dom'

export default function Layout({ children }) {
  const { role, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="d-flex">
      <CSidebar unfoldable>
        <CSidebarNav>
          {role === 'admin' && (
            <>
              <CNavItem component={Link} to="/admin">
                <CIcon icon={cilSpeedometer} /> Dashboard Admin
              </CNavItem>
              <CNavItem component={Link} to="/admin/users">
                <CIcon icon={cilUser} /> Utilizadores
              </CNavItem>
            </>
          )}
          {role === 'trainer' && (
            <>
              <CNavItem component={Link} to="/trainer">
                <CIcon icon={cilSpeedometer} /> Dashboard Trainer
              </CNavItem>
              <CNavItem component={Link} to="/trainer/schedule">
                <CIcon icon={cilCalendar} /> Agenda
              </CNavItem>
            </>
          )}
          {role === 'client' && (
            <CNavItem component={Link} to="/dashboard">
              <CIcon icon={cilSpeedometer} /> Meu Dashboard
            </CNavItem>
          )}
        </CSidebarNav>
      </CSidebar>

      <div className="flex-grow-1">
        <CHeader className="px-3 d-flex justify-content-between align-items-center">
          <h4>Fitness Pro</h4>
          <CButton color="secondary" size="sm" onClick={handleLogout}>
            Logout
          </CButton>
        </CHeader>

        <CContainer className="mt-4">{children}</CContainer>
      </div>
    </div>
  )
}
