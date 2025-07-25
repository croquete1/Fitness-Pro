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
  cilList,
  cilClock,
  cilShieldAlt,
  cilSettings,
  cilChartPie,
  cilGraph,
  cilBarChart,
  cilFile,
} from '@coreui/icons'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Sidebar() {
  const { role } = useAuth()

  return (
    <CSidebarNav>
      {/* Visão Geral / Home */}
      <CNavItem component={NavLink} to={role === 'admin' ? '/admin' : '/home'}>
        <CIcon icon={cilHome} className="me-2" />
        Visão Geral
      </CNavItem>

      {/* Cliente */}
      {role === 'client' && (
        <>
          <CNavTitle>Cliente</CNavTitle>
          <CNavItem component={NavLink} to="/dashboard/workouts">
            <CIcon icon={cilList} className="me-2" />
            Meus Treinos
          </CNavItem>
        </>
      )}

      {/* Trainer */}
      {role === 'trainer' && (
        <>
          <CNavTitle>Personal Trainer</CNavTitle>
          <CNavItem component={NavLink} to="/trainer/clients">
            <CIcon icon={cilUser} className="me-2" />
            Meus Clientes
          </CNavItem>
        </>
      )}

      {/* Administração */}
      {role === 'admin' && (
        <>
          <CNavTitle>Administração</CNavTitle>

          <CNavItem component={NavLink} to="/admin/users">
            <CIcon icon={cilUser} className="me-2" />
            Contas
          </CNavItem>

          <CNavItem component={NavLink} to="/admin/assign-clients">
            <CIcon icon={cilList} className="me-2" />
            Atribuição
          </CNavItem>

          <CNavItem component={NavLink} to="/admin/activity">
            <CIcon icon={cilClock} className="me-2" />
            Atividade
          </CNavItem>

          <CNavItem component={NavLink} to="/admin/security">
            <CIcon icon={cilShieldAlt} className="me-2" />
            Segurança
          </CNavItem>

          <CNavGroup
            toggler={
              <>
                <CIcon icon={cilGraph} className="me-2" />
                Estatísticas e Relatórios Gerais
              </>
            }
          >
            <CNavLink component={NavLink} to="/admin/reports/signup-graph">
              <CIcon icon={cilChartPie} className="me-2" />
              Gráfico de Adesão
            </CNavLink>
            <CNavLink component={NavLink} to="/admin/reports/trainer-activity">
              <CIcon icon={cilBarChart} className="me-2" />
              Atividade por Trainer
            </CNavLink>
            <CNavLink component={NavLink} to="/admin/reports/indicators">
              <CIcon icon={cilGraph} className="me-2" />
              Indicadores Globais
            </CNavLink>
            <CNavLink component={NavLink} to="/admin/reports/export">
              <CIcon icon={cilFile} className="me-2" />
              Exportar Relatórios
            </CNavLink>
          </CNavGroup>

          <CNavItem component={NavLink} to="/admin/logs">
            <CIcon icon={cilSettings} className="me-2" />
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
