import React from 'react'
import { CRow, CCol, CWidgetStatsA } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilDollar,
  cilUser,
  cilChart,
} from '@coreui/icons'

export default function WidgetsDropdown({ stats }) {
  const { usersCount, revenue, trainersCount, conversionRate } = stats

  return (
    <CRow className="g-3 mb-4">
      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          color="primary"
          title="Utilizadores"
          value={usersCount.toLocaleString()}
          icon={<CIcon icon={cilPeople} size="lg" />}
        />
      </CCol>
      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          color="success"
          title="Receita"
          value={`$${revenue.toLocaleString()}`}
          icon={<CIcon icon={cilDollar} size="lg" />}
        />
      </CCol>
      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          color="warning"
          title="Trainers"
          value={trainersCount.toLocaleString()}
          icon={<CIcon icon={cilUser} size="lg" />}
        />
      </CCol>
      <CCol sm={6} lg={3}>
        <CWidgetStatsA
          color="info"
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={<CIcon icon={cilChart} size="lg" />}
        />
      </CCol>
    </CRow>
  )
}
