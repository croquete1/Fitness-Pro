// src/pages/DashboardAdmin.jsx
import React from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import WidgetsDropdown from '../components/WidgetsDropdown.jsx'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CSpinner,
} from '@coreui/react'
import { CChartBar, CChartDoughnut } from '@coreui/react-chartjs'
import { useAdminStats } from '../hooks/useAdminStats.js'

export default function DashboardAdmin() {
  const { stats, monthly, loading, error } = useAdminStats()

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center mt-5">
          <CSpinner />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="text-danger text-center mt-5">
          Erro: {error.message}
        </div>
      </AppLayout>
    )
  }

  const { sessionsCount, trainersCount, usersCount } = stats
  const { labels, data } = monthly

  // Dados para doughnut (trainers vs clientes)
  const doughnutData = {
    labels: ['Trainers', 'Clientes'],
    datasets: [
      {
        data: [trainersCount, usersCount - trainersCount],
        backgroundColor: ['#0d6efd', '#198754'],
      },
    ],
  }

  return (
    <AppLayout>
      <h2 className="mb-4">Dashboard Admin</h2>

      {/* Widgets principais extraídos do template */}
      <WidgetsDropdown stats={stats} monthly={monthly} />

      {/* Gráficos secundários */}
      <CRow className="mb-4">
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardHeader>Sessões Mensais</CCardHeader>
            <CCardBody>
              <CChartBar
                style={{ height: '250px' }}
                data={{ labels, datasets: [{ data, backgroundColor: '#0d6efd' }] }}
                options={{
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardHeader>Treinadores vs Clientes</CCardHeader>
            <CCardBody>
              <CChartDoughnut
                style={{ height: '250px' }}
                data={doughnutData}
                options={{ plugins: { legend: { position: 'bottom' } } }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </AppLayout>
  )
}
