export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/ui/PageHeader';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Clientes do Personal Trainer · ${brand.name}`,
  description: 'Consulta os clientes associados aos teus planos e sessões.',
};

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  status?: string | null;
};

type Metric = {
  label: string;
  value: number;
  hint?: string;
  tone?: 'primary' | 'info' | 'success' | 'warning' | 'violet';
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  PAUSED: 'Em pausa',
  PENDING: 'Pendente',
};

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'down'> = {
  ACTIVE: 'ok',
  PENDING: 'warn',
  PAUSED: 'warn',
  INACTIVE: 'down',
};

function toClientRow(row: any): ClientRow {
  return {
    id: String(row?.id ?? ''),
    name: row?.name ?? row?.email ?? String(row?.id ?? ''),
    email: row?.email ?? null,
    status: row?.status ?? row?.role ?? null,
  } satisfies ClientRow;
}

function formatStatus(value: string | null | undefined) {
  if (!value) return '—';
  const normalized = value.toString().trim().toUpperCase();
  return STATUS_LABELS[normalized] ?? value;
}

function statusTone(value: string | null | undefined): 'ok' | 'warn' | 'down' {
  if (!value) return 'warn';
  const normalized = value.toString().trim().toUpperCase();
  return STATUS_TONE[normalized] ?? 'warn';
}

export default async function PtClientsPage() {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect('/login');
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const ids = new Set<string>();
  try {
    const { data: plans } = await sb.from('training_plans').select('client_id,status').eq('trainer_id', me.id);
    (plans ?? []).forEach((row: any) => {
      if (row?.client_id) ids.add(row.client_id);
    });
  } catch (error) {
    console.warn('[pt clients] falha ao carregar planos', error);
  }
  try {
    const { data: sessions } = await sb.from('sessions').select('client_id').eq('trainer_id', me.id);
    (sessions ?? []).forEach((row: any) => {
      if (row?.client_id) ids.add(row.client_id);
    });
  } catch (error) {
    console.warn('[pt clients] falha ao carregar sessões', error);
  }

  let rows: ClientRow[] = [];
  if (ids.size) {
    try {
      const { data } = await sb
        .from('users')
        .select('id,name,email,status,role')
        .in('id', Array.from(ids));
      rows = Array.isArray(data) ? data.map(toClientRow) : [];
    } catch (error) {
      console.warn('[pt clients] falha ao carregar perfis', error);
      rows = [];
    }
  }

  const statusCount = rows.reduce<Record<string, number>>((acc, row) => {
    const key = (row.status ?? 'UNKNOWN').toString().toUpperCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const total = rows.length;
  const active = statusCount.ACTIVE ?? 0;
  const pending = (statusCount.PENDING ?? 0) + (statusCount.UNKNOWN ?? 0);
  const inactive = (statusCount.INACTIVE ?? 0) + (statusCount.PAUSED ?? 0);

  const metrics: Metric[] = [
    { label: 'Total na carteira', value: total, hint: 'Clientes associados ao teu perfil', tone: 'primary' },
    { label: 'Activos', value: active, hint: 'Com plano ou sessões em curso', tone: 'success' },
    { label: 'A acompanhar', value: pending, hint: 'A aguardar plano ou activação', tone: 'warning' },
    { label: 'Em pausa', value: inactive, hint: 'Sem actividade recente', tone: 'violet' },
  ];

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <PageHeader
        title="Carteira de clientes"
        subtitle="Uma visão consolidada dos clientes que confiam no teu acompanhamento."
        actions={
          <div className="neo-quick-actions">
            <Link href="/register" prefetch={false} className="btn primary">
              Adicionar novo cliente
            </Link>
            <Link href="/dashboard/pt/plans" prefetch={false} className="btn ghost">
              Criar plano personalizado
            </Link>
          </div>
        }
      />

      <section className="neo-panel space-y-4" aria-label="Resumo de clientes">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="neo-panel__title">Panorama rápido</h2>
            <p className="neo-panel__subtitle">Indicadores para priorizares onboarding e acompanhamento.</p>
          </div>
          <span className="status-pill" data-state={total > 0 ? 'ok' : 'warn'}>
            {total > 0 ? `${total} cliente(s)` : 'Sem clientes ainda'}
          </span>
        </div>
        <div className="neo-grid auto-fit min-[320px]:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="neo-surface neo-surface--interactive space-y-3 p-4" data-variant={metric.tone}>
              <div className="space-y-1">
                <span className="neo-surface__hint uppercase tracking-wide">{metric.label}</span>
                <span className="neo-surface__value text-2xl font-semibold text-fg">{metric.value}</span>
              </div>
              {metric.hint && <p className="text-xs text-muted">{metric.hint}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel space-y-4" aria-label="Lista de clientes">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="neo-panel__title">Clientes associados</h2>
            <p className="neo-panel__subtitle">Contactos e estados actualizados em tempo real.</p>
          </div>
          <Link href="/dashboard/pt/messages" prefetch={false} className="btn ghost">
            Enviar mensagem
          </Link>
        </div>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Email</th>
                <th scope="col">Estado</th>
                <th scope="col" className="text-right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="space-y-1">
                      <span className="font-semibold text-fg">{row.name}</span>
                      {row.email && <span className="text-xs text-muted">ID #{row.id}</span>}
                    </div>
                  </td>
                  <td>{row.email ?? '—'}</td>
                  <td>
                    <span className="status-pill" data-state={statusTone(row.status)}>
                      {formatStatus(row.status ?? null)}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link href={`/dashboard/users/${row.id}`} prefetch={false} className="link-arrow inline-flex items-center gap-1 text-sm">
                      Ver perfil
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="rounded-2xl border border-dashed border-white/40 bg-white/40 p-6 text-center text-sm text-muted dark:border-slate-700/60 dark:bg-slate-900/30">
                      Ainda não tens clientes atribuídos. Usa as acções acima para convidar o primeiro atleta.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
