// src/App.jsx

import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import {
  CSidebar,
  CSidebarNav,
  CSidebarNavItem,
  CSidebarNavLink,
  CContainer,
  CHeader,
  CHeaderNav,
  CNavItem,
  CNavLink,
  CSpinner,
} from '@coreui/react'

// rotas lazy
const DashboardAdmin   = React.lazy(() => import('./pages/DashboardAdmin'))
const DashboardCliente = React.lazy(() => import('./pages/DashboardCliente'))
const Login            = React.lazy(() => import('./pages/Login'))
const Register         = React.lazy(() => import('./pages/Register'))

export default function App() {
  return (
    <>
      <CSidebar unfoldable>
        <CSidebarNav>
          <CSidebarNavItem>
            <CSidebarNavLink component={Link} to="/dashboard">
              Dashboard Cliente
            </CSidebarNavLink>
          </CSidebarNavItem>
          <CSidebarNavItem>
            <CSidebarNavLink component={Link} to="/admin">
              Dashboard Admin
            </CSidebarNavLink>
          </CSidebarNavItem>
        </CSidebarNav>
      </CSidebar>

      <div className="c-wrapper">
        <CHeader>
          <CHeaderNav>
            <CNavItem>
              <CNavLink component={Link} to="/login">
                Login
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink component={Link} to="/register">
                Registar
              </CNavLink>
            </CNavItem>
          </CHeaderNav>
        </CHeader>

        <CContainer lg className="mt-4">
          <Suspense fallback={<CSpinner color="primary" size="xl" />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<DashboardCliente />} />
              <Route path="/admin" element={<DashboardAdmin />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </CContainer>
      </div>
    </>
  )
}
