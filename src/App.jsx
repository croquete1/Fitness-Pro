import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Pending from './pages/Pending.jsx'
import Home from './pages/Home.jsx'
import DashboardCliente from './pages/DashboardCliente.jsx'
import DashboardTrainer from './pages/DashboardTrainer.jsx'
import DashboardAdmin from './pages/DashboardAdmin.jsx'
import AdminRegistrationRequests from './pages/AdminRegistrationRequests.jsx'
import UsersManagement from './pages/UsersManagement.jsx'
import AdminAssignClients from './pages/AdminAssignClients.jsx'
import AdminActivity from './pages/AdminActivity.jsx'
import AdminSecurity from './pages/AdminSecurity.jsx'
import AdminLogs from './pages/AdminLogs.jsx'
import AdminAccess from './pages/AdminAccess.jsx'
import AdminSignupGraph from './pages/reports/SignupGraph.jsx'
import AdminTrainerActivity from './pages/reports/TrainerActivity.jsx'
import AdminIndicators from './pages/reports/GlobalIndicators.jsx'
import AdminExport from './pages/reports/ExportReports.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pending" element={<Pending />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<DashboardCliente />} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="trainer" />}>
        <Route path="/trainer" element={<DashboardTrainer />} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/requests" element={<AdminRegistrationRequests />} />
        <Route path="/admin/users" element={<UsersManagement />} />
        <Route path="/admin/assign-clients" element={<AdminAssignClients />} />
        <Route path="/admin/activity" element={<AdminActivity />} />
        <Route path="/admin/security" element={<AdminSecurity />} />
        <Route path="/admin/logs" element={<AdminLogs />} />
        <Route path="/admin/access" element={<AdminAccess />} />
        <Route path="/admin/reports/signup-graph" element={<AdminSignupGraph />} />
        <Route path="/admin/reports/trainer-activity" element={<AdminTrainerActivity />} />
        <Route path="/admin/reports/indicators" element={<AdminIndicators />} />
        <Route path="/admin/reports/export" element={<AdminExport />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
