// src/app/(app)/dashboard/admin/audit-log/page.tsx
export default async function Page() {
  return (
    <div className="card" style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Auditoria</h1>
      <p style={{ marginBottom: 12 }}>Registos de ações administrativas (em breve).</p>

      <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8 }}>Quando</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Utilizador</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Ação</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Alvo</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderTop: '1px solid var(--border)' }}>
            <td style={{ padding: 8 }} colSpan={4}>Sem registos ainda.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
