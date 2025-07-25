// src/pages/Pending.jsx
import React from 'react'
import { CButton, CContainer, CRow, CCol, CAlert } from '@coreui/react'
import { Link } from 'react-router-dom'

export default function Pending() {
  return (
    <CContainer className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CAlert color="warning" className="text-center">
            <h4 className="alert-heading">Conta Pendente de Aprovação</h4>
            <p>
              A sua conta ainda está a aguardar aprovação de um administrador.
              Algumas funcionalidades não estão disponíveis até que a sua conta
              seja aprovada.
            </p>
            <hr />
            <p className="mb-0">
              Por favor, aguarde. Receberá um alerta assim que a aprovação
              for concedida.
            </p>
          </CAlert>
          <div className="text-center mt-4">
            <Link to="/login">
              <CButton color="primary">Voltar ao Login</CButton>
            </Link>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  )
}
