// src/pages/reports/SignupGraph.jsx
import React from 'react'
import AppLayout from '../../layouts/AppLayout.jsx'
import { CContainer, CSpinner } from '@coreui/react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useSignupStats } from '../../hooks/useSignupStats.jsx'

// Regista os componentes do Chart.js uma vez
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

export default function SignupGraph() {
  const { data, loading, error } = useSignupStats()

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

  // Garante pelo menos um ponto no gráfico para evitar render vazio
  const labels = data.labels.length ? data.labels : ['Sem dados']
  const counts = data.counts.length ? data.counts : [0]

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Novos Registos',
        data: counts,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54,162,235,0.5)',
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Novos Registos por Período' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  }

  return (
    <AppLayout>
      <CContainer fluid className="mt-4">
        <h2 className="mb-4">Gráfico de Adesão</h2>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Line data={chartData} options={options} />
        </div>
      </CContainer>
    </AppLayout>
  )
}
