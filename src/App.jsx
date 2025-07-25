// src/App.jsx
import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './layouts/AppLayout.jsx'

// Páginas públicas
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Pending from './pages/Pending.jsx'

// Lazy-load das páginas protegidas
const Home                 = lazy(() => import('./pages/Home.jsx'))
const DashboardCliente     = lazy(() => import('./pages/DashboardCliente.jsx'))
const DashboardTrainer     = lazy(() => import('./pages/DashboardTrainer.jsx'))
const DashboardAdmin       = lazy(() => import('./pages/DashboardAdmin.jsx'))
const AdminClients         = lazy(() => import('./pages/AdminClients.jsx'))
const AdminRegistrationReq = lazy(() => import('./pages/AdminRegistrationRequests.jsx'))
const UsersManagement      = lazy(() => import('./pages/UsersManagement.jsx'))
const AdminAssignClients   = lazy(() => import('./pages/AdminAssignClients.jsx'))
const AdminActivity        = lazy(() => import('./pages/AdminActivity.jsx'))
const AdminSecurity        = lazy(() => import('./pages/AdminSecurity.jsx'))
const AdminLogs            = lazy(() => import('./pages/AdminLogs.jsx'))
const AdminAccess          = lazy(() => import('./pages/AdminAccess.jsx'))
const AdminSignupGraph     = lazy(() => import('./pages/reports/SignupGraph.jsx'))
const AdminTrainerActivity = lazy(() => import('./pages/reports/TrainerActivity.jsx'))
const AdminIndicators      = lazy(() => import('./pages/reports/GlobalIndicators.jsx'))
const AdminExport          = lazy(() => import('./pages/reports/ExportReports.jsx'))

export default function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="login"    element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="pending"  element={<Pending />} />

      {/* Rotas autenticadas (qualquer role exceto pending) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="home"
            element={
              <Suspense fallback={<div>Carregando...</div>}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<div>Carregando...</div>}>
                <DashboardCliente />
              </Suspense>
            }
          />
        </Route>
      </Route>

      {/* Rotas do Trainer */}
      <Route element={<ProtectedRoute requiredRole="trainer" />}>
        <Route element={<AppLayout />}>
          <Route
            path="trainer"
            element={
              <Suspense fallback={<div>Carregando...</div>}>
                <DashboardTrainer />
              </Suspense>
            }
          />
        </Route>
      </Route>

      {/* Rotas do Admin */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="admin" element={<AppLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<div>Carregando Admin...</div>}>
                <DashboardAdmin />
              </Suspense>
            }
          />
          <Route
            path="clients"
            element={
              <Suspense fallback={<div>Carregando Clientes...</div>}>
                <AdminClients />
              </Suspense>
            }
          />
          <Route
            path="requests"
            element={
              <Suspense fallback={<div>Carregando Pedidos...</div>}>
                <AdminRegistrationReq />
              </Suspense>
            }
          />
          <Route
            path="users"
            element={
              <Suspense fallback={<div>Carregando Contas...</div>}>
                <UsersManagement />
              </Suspense>
            }
          />
          <Route
            path="assign-clients"
            element={
              <Suspense fallback={<div>Carregando Atribuição...</div>}>
                <AdminAssignClients />
              </Suspense>
            }
          />
          <Route
            path="activity"
            element={
              <Suspense fallback={<div>Carregando Atividade...</div>}>
                <AdminActivity />
              </Suspense>
            }
          />
          <Route
            path="security"
            element={
              <Suspense fallback={<div>Carregando Segurança...</div>}>
                <AdminSecurity />
              </Suspense>
            }
          />
          <Route
            path="logs"
            element={
              <Suspense fallback={<div>Carregando Logs...</div>}>
                <AdminLogs />
              </Suspense>
            }
          />
          <Route
            path="access"
            element={
              <Suspense fallback={<div>Carregando Acesso...</div>}>
                <AdminAccess />
              </Suspense>
            }
          />
          <Route path="reports">
            <Route
              path="signup-graph"
              element={
                <Suspense fallback={<div>Carregando Gráfico de Adesão...</div>}>
                  <AdminSignupGraph />
                </Suspense>
              }
            />
            <Route
              path="trainer-activity"
              element={
                <Suspense fallback={<div>Carregando Atividade por Trainer...</div>}>
                  <AdminTrainerActivity />
                </Suspense>
              }
            />
            <Route
              path="indicators"
              element={
                <Suspense fallback={<div>Carregando Indicadores...</div>}>
                  <AdminIndicators />
                </Suspense>
              }
            />
            <Route
              path="export"
              element={
                <Suspense fallback={<div>Exportando Relatórios...</div>}>
                  <AdminExport />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
