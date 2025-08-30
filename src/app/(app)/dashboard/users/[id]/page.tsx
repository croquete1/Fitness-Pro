export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Role } from '@prisma/client';
import EmptyState from '@/components/ui/EmptyState';
import { createServerClient } from '@/lib/supabaseServer';

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const me: any = session.user;
  const isAdminOrTrainer =
    me?.role === 'ADMIN' || me?.role === 'TRAINER' || me?.role === Role.ADMIN || me?.role === Role.TRAINER;

  const id = params.id;

  const u = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, phone: true, createdAt: true },
  });
  if (!u) {
    return (
      <div className="card" style={{ padding: 16 }}>
        <EmptyState emoji="🤷" title="Utilizador não encontrado" />
      </div>
    );
  }

  // Listas rápidas vindas do Supabase (best-effort)
  const sb = createServerClient();
  const plans =
    (
      await sb
        .from('training_plans')
        .select('id,title,status,updated_at,trainer_id,client_id')
        .or(`trainer_id.eq.${id},client_id.eq.${id}`)
        .order('updated_at', { ascending: false })
        .limit(10)
    ).data ?? [];

  const packages =
    (
      await sb
        .from('client_packages')
        .select('id,package_name,status,start_date,end_date,client_id,trainer_id')
        .or(`client_id.eq.${id},trainer_id.eq.${id}`)
        .order('start_date', { ascending: false })
        .limit(10)
    ).data ?? [];

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0 }}>{u.name || 'Utilizador'}</h1>
          <div className="chip">{u.role}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
          <div className="card" style={{ padding: 12, display: 'grid', gap: 6 }}>
            <div><strong>Email:</strong> {u.email}</div>
            <div><strong>Telefone:</strong> {u.phone ?? '—'}</div>
            <div><strong>Estado:</strong> <span className="chip">{String(u.status)}</span></div>
            <div><strong>Criado:</strong> {new Date(u.createdAt).toLocaleString()}</div>
          </div>

          <div className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
            <Link className="btn" href={`/dashboard/search?q=${encodeURIComponent(u.name || u.email)}`}>
              Pesquisar tudo sobre este utilizador
            </Link>
            {isAdminOrTrainer && (
              <Link className="btn" href={`/dashboard/pt/plans/new?clientId=${u.id}`}>
                Criar plano para este utilizador
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Planos</h3>
        {plans.length === 0 ? (
          <EmptyState
            emoji="📝"
            title="Sem planos"
            subtitle="Ainda não existem planos associados."
            actionHref={isAdminOrTrainer ? `/dashboard/pt/plans/new?clientId=${u.id}` : undefined}
            actionLabel={isAdminOrTrainer ? "Criar plano" : undefined}
          />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {plans.map((p: any) => (
              <li key={p.id} className="card" style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.title ?? `Plano #${p.id}`}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Atualizado {p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}
                  </div>
                </div>
                <Link className="btn" href={`/dashboard/pt/plans/${p.id}/edit`}>Abrir</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Pacotes</h3>
        {packages.length === 0 ? (
          <EmptyState emoji="🎟️" title="Sem pacotes" subtitle="Sem registos de pacotes para já." />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {packages.map((c: any) => (
              <li key={c.id} className="card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.package_name}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {c.start_date || '—'} {c.end_date ? `→ ${c.end_date}` : ''}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
