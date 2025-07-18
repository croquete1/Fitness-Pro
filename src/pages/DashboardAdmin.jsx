// src/pages/DashboardAdmin.jsx
import React from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CWidgetStatsA,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import Layout from '../components/Layout'
import { useAdminStats } from '../hooks/useAdminStats'

export default function DashboardAdmin() {
  const { stats, monthly, loading, error } = useAdminStats()

  if (loading) return <div>Carregando dados...</div>
  if (error)   return <div>Erro: {error.message}</div>

  return (
    <Layout menu="admin">
      <h2 className="mb-4">Admin Dashboard</h2>

      <CRow className="mb-4">
        <CCol sm={6} md={4}>
          <CWidgetStatsA
            className="mb-3"
            color="primary"
            title="Utilizadores"
            value={stats.usersCount}
          />
        </CCol>
        <CCol sm={6} md={4}>
          <CWidgetStatsA
            className="mb-3"
            color="info"
            title="Trainers"
            value={stats.trainersCount}
          />
        </CCol>
        <CCol sm={6} md={4}>
          <CWidgetStatsA
            className="mb-3"
            color="warning"
            title="Sessões"
            value={stats.sessionsCount}
          />
        </CCol>
      </CRow>

      <CCard>
        <CCardBody>
          <h5>Sessões (últimos 6 meses)</h5>
          <CChartLine
            data={{
              labels: monthly.labels,
              datasets: [{
                label:           'Sessões',
                backgroundColor: 'rgba(13,110,253,0.1)',
                borderColor:     'rgba(13,110,253,1)',
                data:            monthly.data,
                fill:            true,
                tension:         0.4,
              }],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales:  { y: { beginAtZero: true, stepSize: 10 } },
            }}
          />
        </CCardBody>
      </CCard>
    </Layout>
  )
}
