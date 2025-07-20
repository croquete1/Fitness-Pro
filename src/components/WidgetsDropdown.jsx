// src/components/WidgetsDropdown.jsx
import React from 'react'
import {
  CRow,
  CCol,
  CWidgetStatsA,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilDollar,
  cilUser,
  cilChart,
} from '@coreui/icons'
import { CChartLine } from '@coreui/react-chartjs'
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

// Regista os plugins do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
)

export default function WidgetsDropdown({ stats, monthly }) {
  const { usersCount, revenue, trainersCount, conversionRate } = stats
  const { labels, data } = monthly

  // Função para mini‐charts de linha
  const miniLine = (borderColor, bgColor, value) => (
    <CChartLine
      style={{ height: '70px' }}
      data={{
        labels,
        datasets: [
          {
            backgroundColor: bgColor,
            borderColor,
            data: labels.map((_, i) => Math.round((value / 6) * (i + 1))),
            fill: true,
            tension: 0.4,
          },
        ],
      }}
      options={{
        elements: { point: { radius: 0 } },
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } },
      }}
    />
  )

  return (
    <CRow className="mb-4">
      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          color="primary"
          title="Utilizadores"
          value={usersCount.toLocaleString()}
          icon={<CIcon icon={cilPeople} size="lg" />}
          chart={miniLine('#0d6efd', 'rgba(13,110,253,0.1)', usersCount)}
        />
      </CCol>

      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          color="success"
          title="Receita"
          value={`$${revenue.toLocaleString()}`}
          icon={<CIcon icon={cilDollar} size="lg" />}
          chart={miniLine('#198754', 'rgba(25,135,84,0.1)', revenue)}
        />
      </CCol>

      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          color="warning"
          title="Trainers"
          value={trainersCount.toLocaleString()}
          icon={<CIcon icon={cilUser} size="lg" />}
          chart={miniLine('#ffc107', 'rgba(255,193,7,0.1)', trainersCount)}
        />
      </CCol>

      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          color="info"
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={<CIcon icon={cilChart} size="lg" />}
          chart={miniLine('#0dcaf0', 'rgba(13,202,240,0.1)', conversionRate)}
        />
      </CCol>
    </CRow>
  )
}
