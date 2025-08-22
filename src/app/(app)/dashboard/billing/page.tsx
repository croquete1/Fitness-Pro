// src/app/(app)/dashboard/billing/page.tsx
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { normalizeRole, isBillingAllowedForPT } from '@/lib/roles';
import { getBillingForUser } from '@/lib/billingRepo';

export const dynamic = 'force-dynamic';

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('pt-PT'); } catch { return d; }
}
function currency(v: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v);
}

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const user = (session?.user as any) || {};
  const role = normalizeRole(user?.role);

  // Gate de acesso:
  if (role === 'pt' && !isBillingAllowedForPT(user)) {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Faturação</h1>
        <p style={{ color: 'var(--muted)' }}>Não tens permissões para aceder a esta área.</p>
      </div>
    );
  }

  // Admin e PT autorizado terão (a seguir) uma visão agregada; para já, mostramos
  // uma mensagem e mantemos o client-view para debug. O Cliente vê SEMPRE o seu resumo.
  const showClientView = role === 'client';

  if (!user?.id) {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Faturação</h1>
        <p style={{ color: 'var(--muted)' }}>Sessão inválida.</p>
      </div>
    );
  }

  const data = await getBillingForUser(user.id);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Faturação</h1>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {showClientView
              ? 'Resumo das tuas compras e subscrições'
              : role === 'admin'
              ? 'Visão de administrador (em breve: listagem e filtros globais)'
              : 'Visão de treinador autorizado (em breve: clientes atribuídos)'}
          </p>
        </div>
      </header>

      {/* CLIENT VIEW — cartões bonitos */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {/* Planos ativos/expirados */}
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>Planos</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {data.plans.map((p) => (
              <div
                key={p.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 12,
                  display: 'grid',
                  gap: 4,
                  background:
                    p.status === 'ACTIVE'
                      ? 'linear-gradient(180deg, rgba(34,197,94,.08), transparent)'
                      : 'transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>
                    {p.kind === 'TRAINING' ? '🏋️ ' : '🥗 '}
                    {p.title}
                  </strong>
                  <span
                    style={{
                      fontSize: 12,
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: '1px solid var(--border)',
                      color: 'var(--muted)',
                    }}
                  >
                    {p.durationMonths} {p.durationMonths === 1 ? 'mês' : 'meses'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {fmtDate(p.startDate)} → {fmtDate(p.endDate)}
                </div>
                <div style={{ fontSize: 12 }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: '1px solid var(--border)',
                      background:
                        p.status === 'ACTIVE'
                          ? 'rgba(34,197,94,.15)'
                          : p.status === 'PENDING'
                          ? 'rgba(234,179,8,.15)'
                          : 'rgba(148,163,184,.15)',
                    }}
                  >
                    {p.status === 'ACTIVE' ? 'Ativo' : p.status === 'PENDING' ? 'Pendente' : 'Expirado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extras (avaliações físicas) */}
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>Avaliações Físicas</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {data.extras.length === 0 && (
              <p style={{ color: 'var(--muted)', margin: 0 }}>Sem avaliações extra.</p>
            )}
            {data.extras.map((e) => (
              <div
                key={e.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div>
                  <strong>🩺 {e.label}</strong>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{fmtDate(e.date)}</div>
                </div>
                <div style={{ fontWeight: 700 }}>{currency(e.price)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagamentos */}
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 18 }}>Pagamentos</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {data.payments.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 10,
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{p.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {fmtDate(p.date)} · {p.method}
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>{currency(p.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA suave para “ver plano” */}
      <section
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Ver detalhes do teu plano</div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>
            Consulta treinos, nutrição e notas do treinador.
          </div>
        </div>
        <a
          href="/dashboard/my-plan"
          style={{
            textDecoration: 'none',
            border: '1px solid var(--border)',
            background: 'var(--btn-bg)',
            padding: '10px 14px',
            borderRadius: 10,
          }}
        >
          Abrir plano →
        </a>
      </section>
    </div>
  );
}
