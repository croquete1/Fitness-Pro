// Lista de planos (ADMIN vê todos; TRAINER vê os seus)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';
import PlanListResponsive from '@/components/plan/PlanListResponsive';

type Me = { id: string; role: Role };

export type PlanRow = {
  id: string;
  title: string | null;
  status: string | null;
  updated_at: string | null;
  trainer_id: string | null;
  client_id: string | null;
};

async function listPlans(me: Me): Promise<PlanRow[]> {
  const sb = createServerClient();
  const q = sb
    .from('training_plans')
    .select('id,title,status,updated_at,trainer_id,client_id')
    .order('updated_at', { ascending: false });

  if (me.role === Role.TRAINER) q.eq('trainer_id', me.id);

  const { data, error } = await q.limit(100); // um pouco mais generoso, continua leve
  return error ? [] : (data ?? []);
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const me = session?.user as unknown as Me;
  if (!me?.id) redirect('/login');
  if (me.role !== Role.ADMIN && me.role !== Role.TRAINER) redirect('/dashboard');

  const rows = await listPlans(me);

  return (
    <div style={{ padding: 12, display: 'grid', gap: 12 }}>
      {/* Header */}
      <div
        className="card"
        style={{
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          position: 'sticky',
          top: 0,
          zIndex: 2,
          backdropFilter: 'saturate(180%) blur(6px)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 18 }}>Planos de treino</h1>

        {/* Desktop button */}
        <Link href="/dashboard/pt/plans/new" className="btn primary hide-sm">
          Novo plano
        </Link>
      </div>

      {/* Lista responsiva */}
      <div className="card" style={{ padding: 8 }}>
        <PlanListResponsive rows={rows} />
      </div>

      {/* Mobile CTA fixo (grande e touch-friendly) */}
      <div className="show-sm" style={{ height: 56 }} />
      <Link
        href="/dashboard/pt/plans/new"
        className="btn primary show-sm"
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          borderRadius: 999,
          padding: '12px 18px',
          boxShadow: '0 8px 24px rgba(0,0,0,.16)',
          zIndex: 3,
        }}
      >
        Novo plano
      </Link>

      {/* estilos responsivos rápidos */}
      <style jsx>{`
        .show-sm {
          display: none;
        }
        .hide-sm {
          display: inline-flex;
        }
        @media (max-width: 768px) {
          .show-sm {
            display: inline-flex;
          }
          .hide-sm {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}