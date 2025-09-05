// src/app/(app)/dashboard/search/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { UrlObject } from 'url';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';
import Empty from '@/components/ui/Empty';

/* ========= tipos & helpers ========= */

type RoleFilter = 'all' | 'ADMIN' | 'PT' | 'CLIENT';
type UserStatusFilter = 'all' | 'PENDING' | 'ACTIVE' | 'SUSPENDED';
type PlanStatusFilter = 'all' | 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
type PackageStatusFilter = 'all' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
type PeriodFilter = 'any' | '7d' | '30d' | '90d' | '365d';

// ordenações
type UserSort = 'name' | 'created_desc' | 'created_asc';
type PlanSort = 'updated_desc' | 'updated_asc' | 'title';
type PackageSort = 'start_desc' | 'start_asc' | 'end_desc';

type FiltersState = {
  q: string;
  role: RoleFilter;
  ustatus: UserStatusFilter;
  created: PeriodFilter;
  pstatus: PlanStatusFilter;
  pupdated: PeriodFilter;
  pkgstatus: PackageStatusFilter;
  pkgperiod: PeriodFilter;

  usort: UserSort;
  psort: PlanSort;
  pkgsort: PackageSort;
};

function like(q: string) {
  return `%${q.replace(/[%_]/g, (m) => '\\' + m)}%`;
}
function onlyDigits(q: string) {
  return q.replace(/\D/g, '');
}
function toDbRole(r: RoleFilter | undefined) {
  if (!r || r === 'all') return null;
  return r === 'PT' ? 'TRAINER' : r;
}
function fromPeriod(p: PeriodFilter) {
  if (!p || p === 'any') return null;
  const days = p === '7d' ? 7 : p === '30d' ? 30 : p === '90d' ? 90 : 365;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function normalizeForSuggestion(q: string) {
  const noDiacritics = q.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  return noDiacritics.replace(/\s+/g, ' ').trim();
}
function queryTokens(q: string) {
  return Array.from(
    new Set(
      q
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2)
    )
  );
}

function userHref(id: string, isAdmin: boolean): Route | UrlObject {
  if (isAdmin) return (`/dashboard/admin/users/${id}` as Route);
  return { pathname: '/dashboard/pt/clients', query: { focus: id } } satisfies UrlObject;
}

function buildUrl(state: FiltersState, updates?: Partial<FiltersState>): UrlObject {
  const s = { ...state, ...(updates ?? {}) };
  const query: Record<string, string> = {};
  if (s.q?.trim()) query.q = s.q.trim();
  if (s.role !== 'all') query.role = s.role;
  if (s.ustatus !== 'all') query.ustatus = s.ustatus;
  if (s.created !== 'any') query.created = s.created;
  if (s.pstatus !== 'all') query.pstatus = s.pstatus;
  if (s.pupdated !== 'any') query.pupdated = s.pupdated;
  if (s.pkgstatus !== 'all') query.pkgstatus = s.pkgstatus;
  if (s.pkgperiod !== 'any') query.pkgperiod = s.pkgperiod;
  if (s.usort !== 'name') query.usort = s.usort;
  if (s.psort !== 'updated_desc') query.psort = s.psort;
  if (s.pkgsort !== 'start_desc') query.pkgsort = s.pkgsort;
  return { pathname: '/dashboard/search', query };
}

/* ========= UI helpers: badges coloridas ========= */

function chipStyle(kind: 'role' | 'userStatus' | 'planStatus' | 'pkgStatus', v: string): React.CSSProperties {
  const map: Record<string, { bg: string; fg: string; br?: string }> = {
    ACTIVE:   { bg: '#D1FAE5', fg: '#065F46', br: '#A7F3D0' },
    PENDING:  { bg: '#FEF3C7', fg: '#92400E', br: '#FDE68A' },
    SUSPENDED:{ bg: '#FEE2E2', fg: '#991B1B', br: '#FCA5A5' },
    DRAFT:    { bg: '#E5E7EB', fg: '#374151', br: '#D1D5DB' },
    ARCHIVED: { bg: '#E5E7EB', fg: '#374151', br: '#D1D5DB' },
    EXPIRED:  { bg: '#FFE4E6', fg: '#9F1239', br: '#FECDD3' },
    CANCELLED:{ bg: '#FEE2E2', fg: '#991B1B', br: '#FCA5A5' },
    ADMIN:    { bg: '#EDE9FE', fg: '#5B21B6', br: '#DDD6FE' },
    TRAINER:  { bg: '#DBEAFE', fg: '#1E40AF', br: '#BFDBFE' },
    CLIENT:   { bg: '#F3F4F6', fg: '#111827', br: '#E5E7EB' },
  };
  const key = v.toUpperCase();
  const c = map[key] || { bg: '#F3F4F6', fg: '#111827', br: '#E5E7EB' };
  return {
    background: `color-mix(in srgb, ${c.bg} 88%, white)`,
    color: c.fg,
    border: `1px solid ${c.br || c.bg}`,
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '.2px',
  };
}
function roleLabel(dbRole: string) {
  return dbRole === 'TRAINER' ? 'PT' : dbRole;
}

/* ========= helpers de OR dinâmico para Supabase ========= */

function buildUsersOr(qLike: string, tokens: string[], digits: string) {
  const parts: string[] = [
    `name.ilike.${qLike}`,
    `email.ilike.${qLike}`,
    ...tokens.map((t) => `name.ilike.%${t}%`),
    ...tokens.map((t) => `email.ilike.%${t}%`),
  ];
  if (digits) {
    parts.push(`phone.ilike.%${digits}%`);
    parts.push(`phone_number.ilike.%${digits}%`);
  }
  return parts.join(',');
}
function buildPlansOr(qLike: string, tokens: string[]) {
  const parts: string[] = [
    `title.ilike.${qLike}`,
    `notes.ilike.${qLike}`,
    ...tokens.map((t) => `title.ilike.%${t}%`),
    ...tokens.map((t) => `notes.ilike.%${t}%`),
  ];
  return parts.join(',');
}
function buildPackagesOr(qLike: string, tokens: string[]) {
  const parts: string[] = [
    `package_name.ilike.${qLike}`,
    `notes.ilike.${qLike}`,
    ...tokens.map((t) => `package_name.ilike.%${t}%`),
    ...tokens.map((t) => `notes.ilike.%${t}%`),
  ];
  return parts.join(',');
}

/* ========= queries ========= */

async function searchAdmin(sb: ReturnType<typeof createServerClient>, s: FiltersState) {
  const qLike = like(s.q);
  const tokens = queryTokens(s.q);
  const digits = onlyDigits(s.q);

  // USERS
  const uq = sb
    .from('users')
    .select('id,name,email,role,phone,phone_number,status,created_at')
    .or(buildUsersOr(qLike, tokens, digits))
    .limit(20);

  const dbRole = toDbRole(s.role);
  if (dbRole) uq.eq('role', dbRole);
  if (s.ustatus !== 'all') uq.eq('status', s.ustatus);
  const createdFrom = fromPeriod(s.created);
  if (createdFrom) uq.gte('created_at', createdFrom);

  // ordenação users
  if (s.usort === 'name') uq.order('name', { ascending: true, nullsFirst: false });
  else if (s.usort === 'created_desc') uq.order('created_at', { ascending: false });
  else uq.order('created_at', { ascending: true });

  // PLANS
  const pq = sb
    .from('training_plans')
    .select('id,title,notes,status,updated_at,trainer_id,client_id')
    .or(buildPlansOr(qLike, tokens))
    .limit(15);
  if (s.pstatus !== 'all') pq.eq('status', s.pstatus);
  const updFrom = fromPeriod(s.pupdated);
  if (updFrom) pq.gte('updated_at', updFrom);
  if (s.psort === 'updated_desc') pq.order('updated_at', { ascending: false });
  else if (s.psort === 'updated_asc') pq.order('updated_at', { ascending: true });
  else pq.order('title', { ascending: true });

  // PACKAGES
  const kq = sb
    .from('client_packages')
    .select('id,package_name,notes,status,client_id,trainer_id,start_date,end_date')
    .or(buildPackagesOr(qLike, tokens))
    .limit(15);
  if (s.pkgstatus !== 'all') kq.eq('status', s.pkgstatus);
  const pkgFrom = fromPeriod(s.pkgperiod);
  if (pkgFrom) kq.gte('start_date', pkgFrom);
  if (s.pkgsort === 'start_desc') kq.order('start_date', { ascending: false });
  else if (s.pkgsort === 'start_asc') kq.order('start_date', { ascending: true });
  else kq.order('end_date', { ascending: false, nullsFirst: false });

  const [plans, users, packages] = await Promise.all([pq, uq, kq]);

  return {
    plans: plans.data ?? [],
    users: users.data ?? [],
    packages: packages.data ?? [],
  };
}

async function searchTrainer(sb: ReturnType<typeof createServerClient>, meId: string, s: FiltersState) {
  const qLike = like(s.q);
  const tokens = queryTokens(s.q);
  const digits = onlyDigits(s.q);

  const cps = await sb.from('client_packages').select('client_id').eq('trainer_id', meId);
  const clientIds = Array.from(new Set((cps.data ?? []).map((r: any) => r.client_id))).filter(Boolean);

  // PLANS
  const pq = sb
    .from('training_plans')
    .select('id,title,notes,status,updated_at,trainer_id,client_id')
    .eq('trainer_id', meId)
    .or(buildPlansOr(qLike, tokens))
    .limit(15);
  if (s.pstatus !== 'all') pq.eq('status', s.pstatus);
  const updFrom = fromPeriod(s.pupdated);
  if (updFrom) pq.gte('updated_at', updFrom);
  if (s.psort === 'updated_desc') pq.order('updated_at', { ascending: false });
  else if (s.psort === 'updated_asc') pq.order('updated_at', { ascending: true });
  else pq.order('title', { ascending: true });

  // USERS (clientes do PT + o próprio)
  const uq =
    clientIds.length === 0
      ? { data: [] as any[] }
      : await sb
          .from('users')
          .select('id,name,email,role,phone,phone_number,status,created_at')
          .in('id', [...clientIds, meId])
          .or(buildUsersOr(qLike, tokens, digits))
          .limit(20)
          .order(s.usort === 'name' ? 'name' : 'created_at', {
            ascending: s.usort === 'created_asc',
            nullsFirst: false,
          });

  // PACKAGES
  const kq = sb
    .from('client_packages')
    .select('id,package_name,notes,status,client_id,trainer_id,start_date,end_date')
    .eq('trainer_id', meId)
    .or(buildPackagesOr(qLike, tokens))
    .limit(15);
  if (s.pkgstatus !== 'all') kq.eq('status', s.pkgstatus);
  const pkgFrom = fromPeriod(s.pkgperiod);
  if (pkgFrom) kq.gte('start_date', pkgFrom);
  if (s.pkgsort === 'start_desc') kq.order('start_date', { ascending: false });
  else if (s.pkgsort === 'start_asc') kq.order('start_date', { ascending: true });
  else kq.order('end_date', { ascending: false, nullsFirst: false });

  const [plans, packages] = await Promise.all([pq, kq]);

  return {
    plans: plans.data ?? [],
    users: (uq as any).data ?? [],
    packages: packages.data ?? [],
  };
}

/* ========= page ========= */

export default async function Page({
  searchParams,
}: {
  searchParams: {
    q?: string;
    role?: RoleFilter;
    ustatus?: UserStatusFilter;
    created?: PeriodFilter;
    pstatus?: PlanStatusFilter;
    pupdated?: PeriodFilter;
    pkgstatus?: PackageStatusFilter;
    pkgperiod?: PeriodFilter;
    usort?: UserSort;
    psort?: PlanSort;
    pkgsort?: PackageSort;
  };
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id) redirect('/login');

  const appRole = toAppRole((user as any).role) ?? 'CLIENT';
  const isAdmin = appRole === 'ADMIN';

  const sb = createServerClient();

  const state: FiltersState = {
    q: (searchParams?.q ?? '').trim(),
    role: (searchParams?.role ?? 'all') as RoleFilter,
    ustatus: (searchParams?.ustatus ?? 'all') as UserStatusFilter,
    created: (searchParams?.created ?? 'any') as PeriodFilter,
    pstatus: (searchParams?.pstatus ?? 'all') as PlanStatusFilter,
    pupdated: (searchParams?.pupdated ?? 'any') as PeriodFilter,
    pkgstatus: (searchParams?.pkgstatus ?? 'all') as PackageStatusFilter,
    pkgperiod: (searchParams?.pkgperiod ?? 'any') as PeriodFilter,
    usort: (searchParams?.usort ?? 'name') as UserSort,
    psort: (searchParams?.psort ?? 'updated_desc') as PlanSort,
    pkgsort: (searchParams?.pkgsort ?? 'start_desc') as PackageSort,
  };

  const hasQuery = state.q.length >= 2;

  const results = hasQuery
    ? isAdmin
      ? await searchAdmin(sb, state)
      : await searchTrainer(sb, String(user.id), state)
    : { plans: [], users: [], packages: [] };

  // ===== Sugestões (“did you mean”)
  let suggestion: string | null = null;
  let altTotals = 0;
  if (hasQuery) {
    const normalized = normalizeForSuggestion(state.q);
    const changed = normalized && normalized !== state.q;
    const total =
      (results.users?.length ?? 0) + (results.plans?.length ?? 0) + (results.packages?.length ?? 0);

    if (changed && total < 5) {
      const altState: FiltersState = { ...state, q: normalized };
      const altResults = isAdmin
        ? await searchAdmin(sb, altState)
        : await searchTrainer(sb, String(user.id), altState);
      altTotals =
        (altResults.users?.length ?? 0) +
        (altResults.plans?.length ?? 0) +
        (altResults.packages?.length ?? 0);
      if (altTotals > total) suggestion = normalized;
    }
  }

  /* ====== UI chips ====== */
  const roleChips = [
    { key: 'all' as RoleFilter, label: 'Todos', emoji: '🌐' },
    { key: 'CLIENT' as RoleFilter, label: 'Clientes', emoji: '🧑' },
    { key: 'PT' as RoleFilter, label: 'Treinadores', emoji: '💪' },
    { key: 'ADMIN' as RoleFilter, label: 'Admins', emoji: '🛡️' },
  ];
  const userStatusChips = [
    { key: 'all' as UserStatusFilter, label: 'Qualquer estado' },
    { key: 'ACTIVE' as UserStatusFilter, label: 'Ativos' },
    { key: 'PENDING' as UserStatusFilter, label: 'Pendentes' },
    { key: 'SUSPENDED' as UserStatusFilter, label: 'Suspensos' },
  ];
  const createdChips = [
    { key: 'any' as PeriodFilter, label: 'Qualquer data' },
    { key: '7d' as PeriodFilter, label: 'Últimos 7 dias' },
    { key: '30d' as PeriodFilter, label: 'Últimos 30 dias' },
    { key: '90d' as PeriodFilter, label: 'Últimos 90 dias' },
    { key: '365d' as PeriodFilter, label: 'Último ano' },
  ];
  const userSortChips: { key: UserSort; label: string }[] = [
    { key: 'name', label: 'Nome A–Z' },
    { key: 'created_desc', label: 'Criação (recente)' },
    { key: 'created_asc', label: 'Criação (antiga)' },
  ];
  const planSortChips: { key: PlanSort; label: string }[] = [
    { key: 'updated_desc', label: 'Atualização (recente)' },
    { key: 'updated_asc', label: 'Atualização (antiga)' },
    { key: 'title', label: 'Título A–Z' },
  ];
  const pkgSortChips: { key: PackageSort; label: string }[] = [
    { key: 'start_desc', label: 'Início (recente)' },
    { key: 'start_asc', label: 'Início (antiga)' },
    { key: 'end_desc', label: 'Fim (recente)' },
  ];

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Pesquisa</h1>

      {/* Barra de filtros */}
      <div className="card" style={{ padding: 12, display: 'grid', gap: 10 }}>
        <div className="text-muted small" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {hasQuery ? (
            <>
              Resultados para <strong>“{state.q}”</strong>
              {suggestion && (
                <span>
                  Sugestão:{' '}
                  <Link className="btn chip" href={buildUrl(state, { q: suggestion })} prefetch>
                    “{suggestion}”
                  </Link>
                  {!!altTotals && <span className="small text-muted"> (mais resultados)</span>}
                </span>
              )}
            </>
          ) : (
            <>Escreve pelo menos 2 caracteres para pesquisar por nome, email ou telefone.</>
          )}
        </div>

        {isAdmin && (
          <div style={{ display: 'grid', gap: 10 }}>
            {/* Utilizadores */}
            <div style={{ display: 'grid', gap: 6 }}>
              <div className="nav-section" style={{ margin: 0 }}>Utilizadores</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {roleChips.map((c) => (
                  <Link
                    key={c.key}
                    className="btn chip"
                    href={buildUrl(state, { role: c.key })}
                    prefetch
                    style={{
                      background: state.role === c.key ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.role === c.key ? 'var(--primary)' : undefined,
                    }}
                  >
                    <span aria-hidden>{c.emoji}</span> {c.label}
                  </Link>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {userStatusChips.map((c) => (
                  <Link
                    key={c.key}
                    className="btn chip"
                    href={buildUrl(state, { ustatus: c.key })}
                    prefetch
                    style={{
                      background: state.ustatus === c.key ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.ustatus === c.key ? 'var(--primary)' : undefined,
                    }}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {createdChips.map((c) => (
                  <Link
                    key={c.key}
                    className="btn chip"
                    href={buildUrl(state, { created: c.key })}
                    prefetch
                    style={{
                      background: state.created === c.key ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.created === c.key ? 'var(--primary)' : undefined,
                    }}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {userSortChips.map((c) => (
                  <Link
                    key={c.key}
                    className="btn chip"
                    href={buildUrl(state, { usort: c.key })}
                    prefetch
                    style={{
                      background: state.usort === c.key ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.usort === c.key ? 'var(--primary)' : undefined,
                    }}
                  >
                    Ordenar: {c.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Planos */}
            <div style={{ display: 'grid', gap: 6 }}>
              <div className="nav-section" style={{ margin: 0 }}>Planos</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['all','ACTIVE','DRAFT','ARCHIVED'] as const).map((k) => (
                  <Link
                    key={k}
                    className="btn chip"
                    href={buildUrl(state, { pstatus: k })}
                    prefetch
                    style={{
                      background: state.pstatus === k ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.pstatus === k ? 'var(--primary)' : undefined,
                    }}
                  >
                    {k === 'all' ? 'Todos' : k === 'ACTIVE' ? 'Ativos' : k === 'DRAFT' ? 'Rascunhos' : 'Arquivados'}
                  </Link>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {createdChips.map((c) => (
                  <Link
                    key={c.key}
                    className="btn chip"
                    href={buildUrl(state, { pupdated: c.key })}
                    prefetch
                    style={{
                      background: state.pupdated === c.key ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.pupdated === c.key ? 'var(--primary)' : undefined,
                    }}
                  >
                    Atualizados: {c.label}
                  </Link>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {planSortChips.map((c) => (
                  <Link
                    key={c.key}
                    className="btn chip"
                    href={buildUrl(state, { psort: c.key })}
                    prefetch
                    style={{
                      background: state.psort === c.key ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.psort === c.key ? 'var(--primary)' : undefined,
                    }}
                  >
                    Ordenar: {c.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Pacotes */}
            <div style={{ display: 'grid', gap: 6 }}>
              <div className="nav-section" style={{ margin: 0 }}>Pacotes</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['all','ACTIVE','EXPIRED','CANCELLED'] as const).map((k) => (
                  <Link
                    key={k}
                    className="btn chip"
                    href={buildUrl(state, { pkgstatus: k })}
                    prefetch
                    style={{
                      background: state.pkgstatus === k ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.pkgstatus === k ? 'var(--primary)' : undefined,
                    }}
                  >
                    {k === 'all' ? 'Todos' : k === 'ACTIVE' ? 'Ativos' : k === 'EXPIRED' ? 'Expirados' : 'Cancelados'}
                  </Link>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {createdChips.map((c) => (
                  <Link
                    key={c.key}
                    className="btn chip"
                    href={buildUrl(state, { pkgperiod: c.key })}
                    prefetch
                    style={{
                      background: state.pkgperiod === c.key ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.pkgperiod === c.key ? 'var(--primary)' : undefined,
                    }}
                  >
                    Início: {c.label}
                  </Link>
                ))}
              </div>
              {/* ✅ usar pkgSortChips (deixa de ser “unused”) */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {pkgSortChips.map((c) => (
                  <Link
                    key={c.key}
                    className="btn chip"
                    href={buildUrl(state, { pkgsort: c.key })}
                    prefetch
                    style={{
                      background: state.pkgsort === c.key ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.pkgsort === c.key ? 'var(--primary)' : undefined,
                    }}
                  >
                    Ordenar: {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {!!hasQuery && (
        <>
          {/* Pessoas */}
          <div className="card" style={{ padding: 12 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:8 }}>
              <h3 style={{ margin: 0 }}>Pessoas</h3>
              {isAdmin && (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {(['all','ACTIVE','PENDING','SUSPENDED'] as const).map((k) => (
                    <Link
                      key={k}
                      className="btn chip"
                      href={buildUrl(state, { ustatus: k })}
                      prefetch
                      style={{
                        background: state.ustatus === k ? 'var(--sidebar-active)' : undefined,
                        borderColor: state.ustatus === k ? 'var(--primary)' : undefined,
                      }}
                    >
                      {k === 'all' ? 'Todos' : k === 'ACTIVE' ? 'Ativos' : k === 'PENDING' ? 'Pendentes' : 'Suspensos'}
                    </Link>
                  ))}
                  {userSortChips.map((c) => (
                    <Link
                      key={c.key}
                      className="btn chip"
                      href={buildUrl(state, { usort: c.key })}
                      prefetch
                      style={{
                        background: state.usort === c.key ? 'var(--sidebar-active)' : undefined,
                        borderColor: state.usort === c.key ? 'var(--primary)' : undefined,
                      }}
                    >
                      Ordenar: {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {results.users.length === 0 ? (
              <Empty icon="🧑‍🤝‍🧑" title="Sem pessoas" desc="Não encontrámos ninguém com esse termo e filtros." />
            ) : (
              <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Telefone</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {results.users.map((u: any) => (
                    <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: 8 }}>
                        <Link className="link" href={userHref(u.id, isAdmin)} prefetch>
                          {u.name ?? '—'}
                        </Link>
                      </td>
                      <td style={{ padding: 8 }}>
                        <Link className="link" href={userHref(u.id, isAdmin)} prefetch>
                          {u.email ?? '—'}
                        </Link>
                      </td>
                      <td style={{ padding: 8 }}>{u.phone ?? u.phone_number ?? '—'}</td>
                      <td style={{ padding: 8 }}>
                        <span className="chip" style={chipStyle('role', u.role)}>{roleLabel(u.role)}</span>
                      </td>
                      <td style={{ padding: 8 }}>
                        <span className="chip" style={chipStyle('userStatus', u.status)}>{u.status}</span>
                      </td>
                      <td style={{ padding: 8 }}>
                        <Link className="btn" href={userHref(u.id, isAdmin)} prefetch>
                          Abrir ficha
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Planos */}
          <div className="card" style={{ padding: 12 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:8 }}>
              <h3 style={{ margin: 0 }}>Planos de treino</h3>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {(['all','ACTIVE','DRAFT','ARCHIVED'] as const).map((k) => (
                  <Link
                    key={k}
                    className="btn chip"
                    href={buildUrl(state, { pstatus: k })}
                    prefetch
                    style={{
                      background: state.pstatus === k ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.pstatus === k ? 'var(--primary)' : undefined,
                    }}
                  >
                    {k === 'all' ? 'Todos' : k === 'ACTIVE' ? 'Ativos' : k === 'DRAFT' ? 'Rascunhos' : 'Arquivados'}
                  </Link>
                ))}
                {planSortChips.map((c) => (
                  <Link
                    key={c.key}
                    className="btn chip"
                    href={buildUrl(state, { psort: c.key })}
                    prefetch
                    style={{
                      background: state.psort === c.key ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.psort === c.key ? 'var(--primary)' : undefined,
                    }}
                  >
                    Ordenar: {c.label}
                  </Link>
                ))}
              </div>
            </div>

            {results.plans.length === 0 ? (
              <Empty icon="📝" title="Sem planos" desc="Tenta outros termos ou ajusta os filtros." />
            ) : (
              <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Título</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Atualizado</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {results.plans.map((p: any) => (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: 8 }}>
                        <Link className="link" href={`/dashboard/pt/plans/${p.id}/edit` as Route} prefetch>
                          {p.title ?? `Plano #${p.id}`}
                        </Link>
                      </td>
                      <td style={{ padding: 8 }}>
                        <span className="chip" style={chipStyle('planStatus', p.status)}>{p.status}</span>
                      </td>
                      <td style={{ padding: 8 }}>
                        {p.updated_at ? new Date(p.updated_at).toLocaleString('pt-PT') : '—'}
                      </td>
                      <td style={{ padding: 8 }}>
                        <Link className="btn" href={`/dashboard/pt/plans/${p.id}/edit` as Route} prefetch>
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pacotes */}
          <div className="card" style={{ padding: 12 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:8 }}>
              <h3 style={{ margin: 0 }}>Clientes &amp; Pacotes</h3>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {(['all','ACTIVE','EXPIRED','CANCELLED'] as const).map((k) => (
                  <Link
                    key={k}
                    className="btn chip"
                    href={buildUrl(state, { pkgstatus: k })}
                    prefetch
                    style={{
                      background: state.pkgstatus === k ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.pkgstatus === k ? 'var(--primary)' : undefined,
                    }}
                  >
                    {k === 'all' ? 'Todos' : k === 'ACTIVE' ? 'Ativos' : k === 'EXPIRED' ? 'Expirados' : 'Cancelados'}
                  </Link>
                ))}
                {/* ✅ usar pkgSortChips aqui também */}
                {pkgSortChips.map((c) => (
                  <Link
                    key={c.key}
                    className="btn chip"
                    href={buildUrl(state, { pkgsort: c.key })}
                    prefetch
                    style={{
                      background: state.pkgsort === c.key ? 'var(--sidebar-active)' : undefined,
                      borderColor: state.pkgsort === c.key ? 'var(--primary)' : undefined,
                    }}
                  >
                    Ordenar: {c.label}
                  </Link>
                ))}
              </div>
            </div>

            {results.packages.length === 0 ? (
              <Empty icon="📦" title="Sem pacotes" desc="Pesquisa por nome do pacote, notas ou ajusta os filtros." />
            ) : (
              <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Pacote</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Período</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {results.packages.map((p: any) => (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: 8 }}>{p.package_name}</td>
                      <td style={{ padding: 8 }}>
                        <span className="chip" style={chipStyle('pkgStatus', p.status)}>{p.status}</span>
                      </td>
                      <td style={{ padding: 8 }}>
                        {p.start_date || '—'} {p.end_date ? <>→ {p.end_date}</> : null}
                      </td>
                      <td style={{ padding: 8 }}>
                        <div className="table-actions" style={{ display: 'flex', gap: 6 }}>
                          {p.client_id && (
                            <Link className="btn chip" href={userHref(p.client_id, isAdmin)} prefetch>
                              Cliente
                            </Link>
                          )}
                          {p.trainer_id && (
                            <Link className="btn chip" href={userHref(p.trainer_id, isAdmin)} prefetch>
                              Treinador
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
