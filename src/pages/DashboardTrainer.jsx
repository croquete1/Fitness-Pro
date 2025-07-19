import React from 'react'
import Layout from '../components/Layout.jsx'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CWidgetStatsA,
  CSpinner,
} from '@coreui/react'
import { useState, useEffect } from 'react'
import { db } from '../firebase.js'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function DashboardTrainer() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [sessionsCount, setSessionsCount] = useState(0)
  const [clientsCount, setClientsCount]   = useState(0)

  useEffect(() => {
    async function load() {
      if (!user) return
      setLoading(true)
      // Conta sessões atribuídas ao trainer
      const sessionsSnap = await getDocs(
        query(collection(db, 'sessions'), where('trainerId', '==', user.uid))
      )
      setSessionsCount(sessionsSnap.size)
      // Conta clientes distintos
      const clients = new Set(
        sessionsSnap.docs.map(doc => doc.data().clientId)
      )
      setClientsCount(clients.size)
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-5">
          <CSpinner />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <h2 className="mb-4">Dashboard Trainer</h2>
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="gradient-primary"
            title="Sessões"
            value={sessionsCount}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="gradient-success"
            title="Clientes"
            value={clientsCount}
          />
        </CCol>
      </CRow>

      <CCard>
        <CCardBody>
          <h5 className="mb-3">Visão Geral</h5>
          <p>Mais funcionalidades de treino virão em breve.</p>
        </CCardBody>
      </CCard>
    </Layout>
  )
}
