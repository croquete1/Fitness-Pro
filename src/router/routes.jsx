// src/router/routes.jsx

import { Route, Routes } from 'react-router-dom'
import Login from '../pages/Login'
import NotFound from '../pages/NotFound'

import AdminDashboard from '../pages/AdminDashboard'
import DashboardCliente from '../pages/DashboardCliente'
import DashboardTrainer from '../pages/DashboardTrainer'

import AdminOnly from '../pages/ProtectedRoutes/AdminOnly'
import ClienteOnly from '../pages/ProtectedRoutes/ClienteOnly'
import TrainerOnly from '../pages/ProtectedRoutes/TrainerOnly'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin/dashboard"
        element={
          <AdminOnly>
            <AdminDashboard />
          </AdminOnly>
        }
      />

      <Route
        path="/cliente/dashboard"
        element={
          <ClienteOnly>
            <DashboardCliente />
          </ClienteOnly>
        }
      />

      <Route
        path="/trainer/dashboard"
        element={
          <TrainerOnly>
            <DashboardTrainer />
          </TrainerOnly>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
