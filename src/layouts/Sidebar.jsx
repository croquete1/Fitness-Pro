// src/layouts/Sidebar.jsx
import React from 'react'
import {
  CSidebarNav,
  CNavItem,
  CNavTitle,
  CNavGroup,
  CNavLink,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilHome,
  cilUser,
  cilLockLocked,
  cilSettings,
} from '@coreui/icons'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Sidebar() {
  const { role } = useAuth()

  return (
    <CSidebarNav>
      <CNavItem component={NavLink} to="/home">
        <CIcon icon={cilHome} className="me-2" />
        Home
      </CNavItem>

      {role === 'client' && (
        <>
          <CNavTitle>Cliente</CNavTitle>
          <CNavItem component={NavLink} to="/dashboard/workouts">
            <CIcon icon={cilUser} className="me-2" />
            Meus Treinos
          </CNavItem>
        </>
      )}

      {role === 'trainer' && (
        <>
          <CNavTitle>Personal Trainer</CNavTitle>
          <CNavItem component={NavLink} to="/trainer/clients">
            <CIcon icon={cilUser} className="me-2" />
            Meus Clientes
          </CNavItem>
        </>
      )}

      {role === 'admin' && (
        <>
          <CNavTitle>Administração</CNavTitle>
          <CNavItem component={NavLink} to="/admin">
            <CIcon icon={cilHome} className="me-2" />
            Visão Geral
          </CNavItem>
          <CNavGroup toggler={<><CIcon icon={cilUser} className="me-2" /> Utilizadores</>}>
            <CNavLink component={NavLink} to="/admin/requests">
              Pedidos Pendentes
            </CNavLink>
            <CNavLink component={NavLink} to="/admin/users">
              Todos Utilizadores
            </CNavLink>
          </CNavGroup>
          <CNavItem component={NavLink} to="/admin/logs">
            <CIcon icon={cilLockLocked} className="me-2" />
            Logs de Auditoria
          </CNavItem>
          <CNavItem component={NavLink} to="/admin/access">
            <CIcon icon={cilSettings} className="me-2" />
            Gestão de Acesso
          </CNavItem>
        </>
      )}
    </CSidebarNav>
  )
}
