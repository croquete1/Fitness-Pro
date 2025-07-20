import React from 'react'
import AppLayout from '../../layouts/AppLayout.jsx'
import {
  CContainer,
  CRow,
  CCol,
  CWidgetStatsA,
  CSpinner,
} from '@coreui/react'
import { useGlobalIndicators } from '../../hooks/useGlobalIndicators.jsx'

export default function GlobalIndicators() {
  const { indicators, loading, error } = useGlobalIndicators()
  if (loading) {
    return (
      <AppLayout>
        <CSpinner />
      </AppLayout>
    )
  }
  if (error) {
    return (
      <AppLayout>
        <div>Erro: {error.message}</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <CContainer fluid className="mt-4">
        <h2>Indicadores de Desempenho Global</h2>
        <CRow className="g-3 mb-4">
          <CCol sm={6} lg={4}>
            <CWidgetStatsA
              color="primary"
              title="% Concluídos vs Planeados"
              value={`${indicators.completedPct.toFixed(1)}%`}
            />
          </CCol>
          <CCol sm={6} lg={4}>
            <CWidgetStatsA
              color="success"
              title="Humor Médio"
              value={indicators.avgMood.toFixed(1)}
            />
          </CCol>
          <CCol sm={6} lg={4}>
            <CWidgetStatsA
              color="warning"
              title="Carga por Categoria"
              value={Object.entries(indicators.totalLoadByCategory)
                .map(([cat, v]) => `${cat}: ${v}`)
                .join(', ')}
            />
          </CCol>
        </CRow>
      </CContainer>
    </AppLayout>
  )
}
