import React from 'react'
import Layout from '../components/Layout.jsx'
import {
  CRow,
  CCol,
  CWidgetStatsA,
  CSpinner,
  CCard,
  CCardBody,
} from '@coreui/react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,           // ← importa
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// regista todos juntos
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,           // ← regista aqui
  Title,
  Tooltip,
  Legend,
)
import { useAdminStats } from '../hooks/useAdminStats.js'

// Regista componentes Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function DashboardAdmin() {
  const { stats, monthly, loading, error } = useAdminStats()

  if (loading || !stats) {
    return (
      <Layout>
        <div className="text-center mt-5">
          <CSpinner />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="text-danger text-center mt-5">
          Erro: {error.message}
        </div>
      </Layout>
    )
  }

  const { labels, data } = monthly

  return (
    <Layout>
      <h2 className="mb-4">Dashboard Admin</h2>

      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="gradient-primary"
            title="Utilizadores"
            value={stats.usersCount.toLocaleString()}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="gradient-info"
            title="Trainers"
            value={stats.trainersCount.toLocaleString()}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="gradient-success"
            title="Receita"
            value={`$${stats.revenue.toLocaleString()}`}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="gradient-warning"
            title="Sessões"
            value={stats.sessionsCount.toLocaleString()}
          />
        </CCol>
      </CRow>

      <CCard>
        <CCardBody>
          <h5 className="mb-3">Sessões (últimos 6 meses)</h5>
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: 'Sessões',
                  backgroundColor: 'rgba(13,110,253,0.1)',
                  borderColor: 'rgba(13,110,253,1)',
                  data,
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, stepSize: 10 } },
            }}
          />
        </CCardBody>
      </CCard>
    </Layout>
  )
}
