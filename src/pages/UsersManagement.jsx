// src/pages/UsersManagement.jsx
import React, { useState, useEffect } from 'react'
import Layout from '../layouts/AppLayout'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
} from '@coreui/react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function UsersManagement() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers]     = useState([])

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, 'users'))
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }
    load()
  }, [])

  if (loading)
    return (
      <Layout>
        <div className="text-center mt-5">
          <CSpinner />
        </div>
      </Layout>
    )

  return (
    <Layout>
      <h2 className="mb-4">Gestão de Utilizadores</h2>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Email</CTableHeaderCell>
            <CTableHeaderCell>Role</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {users.map((u) => (
            <CTableRow key={u.id}>
              <CTableDataCell>{u.id}</CTableDataCell>
              <CTableDataCell>{u.email || '-'}</CTableDataCell>
              <CTableDataCell>{u.role}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </Layout>
  )
}
