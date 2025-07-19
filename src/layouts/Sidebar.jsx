import React from 'react'
import { CSidebar, CSidebarNav, CNavItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilUser, cilCalendar } from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext.jsx'
import { NavLink as RouterLink } from 'react-router-dom'

export default function Sidebar({ visible = true }) {
  const { role } = useAuth()

  return (
    <CSidebar
      unfoldable
      visible={visible}
      className="vh-100"
    >
      <CSidebarNav className="ps-3">
        {role === 'client' && (
          <CNavItem component={RouterLink} to="/dashboard">
            <CIcon icon={cilSpeedometer} className="me-2" />
            Meu Dashboard
          </CNavItem>
        )}
        {role === 'trainer' && (
          <>
            <CNavItem component={RouterLink} to="/trainer">
              <CIcon icon={cilSpeedometer} className="me-2" />
              Dashboard Trainer
            </CNavItem>
            <CNavItem component={RouterLink} to="/trainer/schedule">
              <CIcon icon={cilCalendar} className="me-2" />
              Agenda
            </CNavItem>
          </>
        )}
        {role === 'admin' && (
          <>
            <CNavItem component={RouterLink} to="/admin">
              <CIcon icon={cilSpeedometer} className="me-2" />
              Dashboard Admin
            </CNavItem>
            <CNavItem component={RouterLink} to="/admin/users">
              <CIcon icon={cilUser} className="me-2" />
              Utilizadores
            </CNavItem>
          </>
        )}
      </CSidebarNav>
    </CSidebar>
  )
}
