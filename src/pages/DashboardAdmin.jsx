import React from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import WidgetsDropdown from '../components/WidgetsDropdown.jsx'
import {
  CContainer,
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

  const { usersCount, trainersCount } = stats
  const { labels, data } = monthly

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
      <CContainer fluid className="mt-4">
        <h2 className="mb-4">Dashboard Admin</h2>

        <WidgetsDropdown stats={stats} />

        <CRow className="g-3">
          <CCol md={6}>
            <CCard className="mb-4">
              <CCardHeader>Sessões Mensais</CCardHeader>
              <CCardBody>
                <CChartBar
                  style={{ height: '260px' }}
                  data={{
                    labels,
                    datasets: [
                      {
                        label: 'Sessões',
                        backgroundColor: '#0d6efd',
                        data,
                      },
                    ],
                  }}
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
              <CCardHeader>Trainers vs Clientes</CCardHeader>
              <CCardBody>
                <CChartDoughnut
                  style={{ height: '260px' }}
                  data={doughnutData}
                  options={{ plugins: { legend: { position: 'bottom' } } }}
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </AppLayout>
  )
}
