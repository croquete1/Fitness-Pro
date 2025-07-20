import React, { useState, useEffect } from 'react'
import AppLayout from '../layouts/AppLayout.jsx'
import { db } from '../firebase.js'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormSelect,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
} from '@coreui/react'

export default function UsersManagement() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
  })

  const fetchUsers = async () => {
    setLoading(true)
    let q
    const conds = []
    if (filters.type !== 'all') conds.push(where('role', '==', filters.type))
    if (filters.status !== 'all') conds.push(where('status', '==', filters.status))
    if (filters.startDate)
      conds.push(where('createdAt', '>=', new Date(filters.startDate)))
    if (filters.endDate) {
      const end = new Date(filters.endDate)
      end.setHours(23, 59, 59)
      conds.push(where('createdAt', '<=', end))
    }
    if (conds.length > 0) q = query(collection(db, 'users'), ...conds, orderBy('createdAt', 'desc'))
    else q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const handleFilter = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  return (
    <AppLayout>
      <h2 className="mb-4">Gestão de Utilizadores</h2>
      <CCard className="mb-4">
        <CCardHeader className="d-flex align-items-center gap-2 flex-wrap">
          <CFormSelect
            name="type"
            value={filters.type}
            onChange={handleFilter}
            style={{ minWidth: '150px' }}
          >
            <option value="all">Todos os Tipos</option>
            <option value="client">Cliente</option>
            <option value="trainer">Trainer</option>
          </CFormSelect>
          <CFormSelect
            name="status"
            value={filters.status}
            onChange={handleFilter}
            style={{ minWidth: '150px' }}
          >
            <option value="all">Todos os Estados</option>
            <option value="pending">Pendente</option>
            <option value="active">Ativo</option>
            <option value="rejected">Rejeitado</option>
          </CFormSelect>
          <CFormInput
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilter}
            style={{ maxWidth: '180px' }}
          />
          <CFormInput
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilter}
            style={{ maxWidth: '180px' }}
          />
          <CButton color="secondary" onClick={() => setFilters({
            type:'all', status:'all', startDate:'', endDate:''
          })}>
            Limpar Filtros
          </CButton>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center">
              <CSpinner />
            </div>
          ) : (
            <div className="table-responsive">
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                    <CTableHeaderCell>Registo</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.map((u) => (
                    <CTableRow key={u.id}>
                      <CTableDataCell>{u.email}</CTableDataCell>
                      <CTableDataCell>{u.role}</CTableDataCell>
                      <CTableDataCell>{u.status}</CTableDataCell>
                      <CTableHeaderCell>
                        {u.createdAt?.toDate().toLocaleDateString()}
                      </CTableHeaderCell>
                    </CTableRow>
                  ))}
                  {users.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan={4} className="text-center">
                        Sem utilizadores
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CCardBody>
      </CCard>
    </AppLayout>
  )
}
