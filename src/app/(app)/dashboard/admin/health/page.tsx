// src/app/(app)/dashboard/admin/health/page.tsx
export default async function Page() {
  return (
    <div className="card" style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Saúde do sistema</h1>
      <p style={{ marginBottom: 12 }}>Visão geral de serviços críticos.</p>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="card" style={{ padding: 12 }}>
          <h3>API</h3>
          <p>✅ Operacional</p>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <h3>Base de dados</h3>
          <p>✅ Ligada</p>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <h3>Envio de emails</h3>
          <p>✅ OK</p>
        </div>
      </div>
    </div>
  );
}
