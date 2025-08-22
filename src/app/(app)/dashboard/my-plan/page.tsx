// src/app/(app)/dashboard/my-plan/page.tsx
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBillingForUser } from '@/lib/billingRepo';

export const dynamic = 'force-dynamic';

export default async function MyPlanPage() {
  const session = await getServerSession(authOptions);
  const user = (session?.user as any) || {};
  if (!user?.id) {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>O meu plano</h1>
        <p style={{ color: 'var(--muted)' }}>Sessão inválida.</p>
      </div>
    );
  }

  const data = await getBillingForUser(user.id);
  const active = data.plans.find((p) => p.status === 'ACTIVE') ?? data.plans[0];

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 28 }}>O meu plano</h1>
        <p style={{ margin: 0, color: 'var(--muted)' }}>
          {active
            ? `${active.title} (${active.durationMonths} ${active.durationMonths === 1 ? 'mês' : 'meses'})`
            : 'Sem plano ativo de momento.'}
        </p>
      </header>

      <section
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 16,
          display: 'grid',
          gap: 12,
        }}
      >
        {/* Estas secções serão trocadas por dados reais */}
        <div>
          <h3 style={{ margin: '0 0 6px 0' }}>Treino</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Peito & Tríceps — 3x/semana</li>
            <li>Costas & Bíceps — 2x/semana</li>
            <li>Pernas & Ombros — 2x/semana</li>
          </ul>
        </div>

        <div>
          <h3 style={{ margin: '0 0 6px 0' }}>Alimentação</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Proteína: 2.0 g/kg · Carbo: moderado · Gordura: baixa</li>
            <li>Plano diário: 5 refeições</li>
          </ul>
        </div>

        <div>
          <h3 style={{ margin: '0 0 6px 0' }}>Notas</h3>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Manter hidratação, sono ≥ 7h. Reavaliar cargas na 3ª semana.
          </p>
        </div>
      </section>
    </div>
  );
}
