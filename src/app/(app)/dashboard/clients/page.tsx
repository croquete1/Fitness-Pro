import * as React from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ClientDashboardPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Painel do Cliente</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        <Link href="/dashboard/sessions" prefetch={false}>
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 16,
              background: 'var(--card-bg, #fff)',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Próximas sessões</div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>
              Consulta e gere as tuas marcações.
            </div>
          </div>
        </Link>

        <Link href="/dashboard/my-plan" prefetch={false}>
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 16,
              background: 'var(--card-bg, #fff)',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Os meus planos</div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>
              Planos de treino e nutrição atribuídos.
            </div>
          </div>
        </Link>

        <Link href="/dashboard/messages" prefetch={false}>
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 16,
              background: 'var(--card-bg, #fff)',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Mensagens</div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>
              Comunica com o teu PT.
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
