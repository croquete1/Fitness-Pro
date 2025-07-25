// src/components/ClientesTable.jsx
export default function ClientesTable({ clientes }) {
  return (
    <CTable hover responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Cliente</CTableHeaderCell>
          <CTableHeaderCell>País</CTableHeaderCell>
          <CTableHeaderCell>Atividade</CTableHeaderCell>
          <CTableHeaderCell>Último Treino</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {clientes.map((c) => (
          <CTableRow key={c.id}>
            <CTableDataCell>
              <div className="d-flex align-items-center">
                <CAvatar size="md" src={c.avatar} className="me-2" />
                <div>
                  <div>{c.name}</div>
                  <small className="text-medium-emphasis">
                    Registado em {c.registered}
                  </small>
                </div>
              </div>
            </CTableDataCell>
            <CTableDataCell>
              <img src={c.countryFlag} alt="" style={{ width: '24px' }} />
            </CTableDataCell>
            <CTableDataCell>
              <div>{c.activity}</div>
            </CTableDataCell>
            <CTableDataCell>
              <strong>{c.lastWorkout}</strong>
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  )
}
