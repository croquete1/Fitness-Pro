// src/pages/AdminClients.jsx
import React, { useEffect, useState } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CSpinner,
} from '@coreui/react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase.js'
import ClientesTable from '../components/ClientesTable.jsx'

export default function AdminClients() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const q = query(collection(db, 'users'), where('role', '==', 'client'))
      const snap = await getDocs(q)
      const data = snap.docs.map((doc) => {
        const u = doc.data()
        return {
          id: doc.id,
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
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <AppLayout>
      <CContainer fluid className="mt-4">
        <h2 className="mb-4">Gestão de Clientes</h2>
        <CRow>
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardHeader>Lista de Clientes</CCardHeader>
              <CCardBody>
                {loading ? (
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
