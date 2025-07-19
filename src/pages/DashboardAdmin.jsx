import React, { useState } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import {
  CRow,
  CCol,
  CWidgetStatsA,
  CSpinner,
  CCard,
  CCardBody,
  CAlert,
  CButton,
  CIcon,
} from '@coreui/react'
import { cilUser, cilDollar, cilCalendar, cilPeople, cilCloudDownload } from '@coreui/icons'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useAdminStats } from '../hooks/useAdminStats.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
)

export default function DashboardAdmin() {
  const { stats, monthly, loading, error } = useAdminStats()
  const [theme, setTheme] = useState('light')

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

  const { usersCount, sessionsCount, trainersCount, revenue } = stats
  const { labels, data } = monthly

  const exportCSV = () => {
    const csv = `Mês,Sessões\n${labels.map((l, i) => `${l},${data[i]}`).join('\n')}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'sessões.csv'
    link.click()
  }

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next)
    setTheme(next)
  }

  return (
    <AppLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4">Painel de Administração</h1>
        <div>
          <CButton color="secondary" variant="outline" onClick={toggleTheme} className="me-2">
            {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
          </CButton>
          <CButton color="primary" onClick={exportCSV}>
            <CIcon icon={cilCloudDownload} className="me-2" /> Exportar CSV
          </CButton>
        </div>
      </div>

      {(sessionsCount === 0 || revenue === 0) && (
        <CAlert color="warning" className="mb-4">
          Atenção: Existem sessões ou receitas a zero. Verifique os dados.
        </CAlert>
      )}

      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            icon={<CIcon icon={cilPeople} height={36} />}
            color="gradient-primary"
            title="Utilizadores"
            value={usersCount ? usersCount.toLocaleString() : '—'}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            icon={<CIcon icon={cilUser} height={36} />}
            color="gradient-info"
            title="Trainers"
            value={trainersCount ? trainersCount.toLocaleString() : '—'}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            icon={<CIcon icon={cilDollar} height={36} />}
            color="gradient-success"
            title="Receita"
            value={revenue ? `$${revenue.toLocaleString()}` : '—'}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            icon={<CIcon icon={cilCalendar} height={36} />}
            color="gradient-warning"
            title="Sessões"
            value={sessionsCount ? sessionsCount.toLocaleString() : '—'}
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
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => `${ctx.raw} sessões`,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 10 },
                },
              },
            }}
          />
        </CCardBody>
      </CCard>
    </AppLayout>
  )
}