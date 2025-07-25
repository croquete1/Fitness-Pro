// src/pages/DashboardAdmin.jsx
import React, { useEffect, useState } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import {
  CContainer,
  CRow,
  CCol,
  CWidgetStatsA,
  CSpinner,
  CCard,
  CCardHeader,
  CCardBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilUser, cilChart, cilBell } from '@coreui/icons'
import { useAdminStats } from '../hooks/useAdminStats.jsx'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase.js'
import ClientesTable from '../components/ClientesTable.jsx'

export default function DashboardAdmin() {
  const { stats, monthly, loading, error } = useAdminStats()
  const [clientes, setClientes] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)

  useEffect(() => {
    async function fetchClientes() {
      const q = query(collection(db, 'users'), where('role', '==', 'client'))
      const snap = await getDocs(q)
      const data = snap.docs.map((d) => {
        const u = d.data()
        return {
          id: d.id,
          avatar: u.photoURL,
          name: u.displayName || u.email,
          registered: u.createdAt
            ? new Date(u.createdAt.seconds * 1000).toLocaleDateString()
            : '-',
          country: u.country || 'BR',
          countryFlag: `/flags/${(u.country || 'BR').toLowerCase()}.svg`,
          lastWorkout: u.lastWorkoutDate
            ? new Date(u.lastWorkoutDate.seconds * 1000).toLocaleDateString()
            : '-',
        }
      })
      setClientes(data)
      setLoadingClients(false)
    }
    fetchClientes()
  }, [])

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

  return (
    <AppLayout>
      <CContainer fluid className="mt-4">
        <h2 className="mb-4">Visão Geral</h2>

        {/* Widgets de Estatísticas */}
        <CRow className="g-3 mb-4">
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="primary"
              title="Clientes"
              value={(stats.usersCount - stats.trainersCount).toLocaleString()}
              icon={<CIcon icon={cilPeople} size="lg" />}
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="success"
              title="Trainers"
              value={stats.trainersCount.toLocaleString()}
              icon={<CIcon icon={cilUser} size="lg" />}
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="warning"
              title="Sessões"
              value={stats.sessionsCount.toLocaleString()}
              icon={<CIcon icon={cilChart} size="lg" />}
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="danger"
              title="Pendentes"
              value={stats.pendingCount.toLocaleString()}
              icon={<CIcon icon={cilBell} size="lg" />}
            />
          </CCol>
        </CRow>

        {/* Gráficos Mensais (mantém seu código) */}
        {/* <CRow> … seu gráfico monthly … </CRow> */}

        {/* Tabela de Clientes */}
        <CRow>
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardHeader>Clientes</CCardHeader>
              <CCardBody>
                {loadingClients ? (
                  <div className="text-center py-4">
                    <CSpinner />
                  </div>
                ) : (
                  <ClientesTable
                    clientes={clientes}
                    onEdit={(id) => console.log('Editar', id)}
                    onDelete={(id) => console.log('Eliminar', id)}
                  />
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </AppLayout>
  )
}
