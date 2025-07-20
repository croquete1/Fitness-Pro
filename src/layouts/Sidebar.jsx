// src/layouts/Sidebar.jsx
import React from 'react'
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CNavItem,
  CNavTitle,
  CNavGroup,
  CNavLink,
  CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilHome,
  cilUser,
  cilCalendar,
  cilLockLocked,
  cilSettings,
} from '@coreui/icons'
import { NavLink as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Sidebar({ unfoldable, visible, onVisibleChange }) {
  const { role } = useAuth()

  return (
    <CSidebar
      unfoldable={unfoldable}
      visible={visible}
      onVisibleChange={onVisibleChange}
      colorScheme="light"
    >
      {/* Brand */}
      <CSidebarBrand to="/" className="d-flex align-items-center px-3 py-2">
        <CIcon icon={cilHome} className="me-2" />
        <span className="fs-5">Fitness Pro</span>
      </CSidebarBrand>

      {/* Search */}
      <CSidebarHeader className="px-3 py-2">
        <CFormInput size="sm" placeholder="Pesquisar..." />
      </CSidebarHeader>

      {/* Navegação */}
      <CSidebarNav className="px-2">
        {/* NOVA ABA HOME */}
        <CNavItem component={RouterLink} to="/home">
          <CIcon icon={cilHome} className="me-2" />
          Home
        </CNavItem>

        {role === 'client' && (
          <>
            <CNavTitle>Cliente</CNavTitle>
            <CNavItem component={RouterLink} to="/dashboard/workouts">
              <CIcon icon={cilCalendar} className="me-2" />
              Meus Treinos
            </CNavItem>
          </>
        )}

        {role === 'trainer' && (
          <>
            <CNavTitle>Personal Trainer</CNavTitle>
            <CNavItem component={RouterLink} to="/trainer/clients">
              <CIcon icon={cilUser} className="me-2" />
              Meus Clientes
            </CNavItem>
            <CNavItem component={RouterLink} to="/trainer/schedule">
              <CIcon icon={cilCalendar} className="me-2" />
              Agenda
            </CNavItem>
          </>
        )}

        {role === 'admin' && (
          <>
            <CNavTitle>Administração</CNavTitle>
            <CNavGroup toggler={<><CIcon icon={cilUser} className="me-2" /> Utilizadores</>}>
              <CNavLink component={RouterLink} to="/admin/requests">
                Pedidos Pendentes
              </CNavLink>
              <CNavLink component={RouterLink} to="/admin/users">
                Todos Utilizadores
              </CNavLink>
            </CNavGroup>
            <CNavItem component={RouterLink} to="/admin/logs">
              <CIcon icon={cilLockLocked} className="me-2" />
              Logs de Auditoria
            </CNavItem>
            <CNavItem component={RouterLink} to="/admin/access">
              <CIcon icon={cilSettings} className="me-2" />
              Gestão de Acesso
            </CNavItem>
          </>
        )}
      </CSidebarNav>

      {/* Footer com toggler */}
      <CSidebarFooter className="d-flex justify-content-center py-2">
        <CSidebarToggler className="border-0" />
      </CSidebarFooter>
    </CSidebar>
  )
}
