import React, { useState, useMemo } from 'react'
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormInput,
  CFormSelect,
  CButton,
  CAvatar,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'

export default function ClientesTable({
  clientes,
  onEdit = () => {},
  onDelete = () => {},
}) {
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')

  const countries = useMemo(() => {
    const setCodes = new Set(clientes.map((c) => c.country))
    return ['all', ...Array.from(setCodes)]
  }, [clientes])

  const filtered = useMemo(
    () =>
      clientes.filter((c) => {
        const matchName = c.name.toLowerCase().includes(search.toLowerCase())
        const matchCountry =
          countryFilter === 'all' || c.country === countryFilter
        return matchName && matchCountry
      }),
    [clientes, search, countryFilter],
  )

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <CFormInput
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <CFormSelect
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          {countries.map((code) => (
            <option key={code} value={code}>
              {code === 'all' ? 'Todos Países' : code}
            </option>
          ))}
        </CFormSelect>
      </div>

      <CTable hover responsive small>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Cliente</CTableHeaderCell>
            <CTableHeaderCell>País</CTableHeaderCell>
            <CTableHeaderCell>Data Registo</CTableHeaderCell>
            <CTableHeaderCell>Último Treino</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '120px' }}>
              Ações
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filtered.map((c) => (
            <CTableRow key={c.id}>
              <CTableDataCell>
                <div className="d-flex align-items-center">
                  <CAvatar src={c.avatar} className="me-2" />
                  <div>{c.name}</div>
                </div>
              </CTableDataCell>
              <CTableDataCell>
                <img
                  src={c.countryFlag}
                  alt={c.country}
                  style={{ width: '24px' }}
                />
              </CTableDataCell>
              <CTableDataCell>{c.registered}</CTableDataCell>
              <CTableDataCell>{c.lastWorkout}</CTableDataCell>
              <CTableDataCell>
                <div className="d-flex gap-2">
                  <CButton
                    color="secondary"
                    size="sm"
                    onClick={() => onEdit(c.id)}
                  >
                    <CIcon icon={cilPencil} />
                  </CButton>
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => onDelete(c.id)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </div>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </>
  )
}
