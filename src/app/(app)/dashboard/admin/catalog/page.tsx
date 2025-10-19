export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

import AdminCatalogClient from './AdminCatalogClient';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { loadAdminExercisesDashboard } from '@/lib/admin/exercises/server';

type SearchParams = {
  q?: string;
  scope?: 'all' | 'global' | 'personal';
  published?: 'all' | 'published' | 'draft';
  difficulty?: string;
  equipment?: string;
  muscle?: string;
  range?: '30d' | '90d' | '180d' | '365d';
  page?: string;
  pageSize?: string;
  sort?: 'created_desc' | 'updated_desc' | 'name_asc';
};

type PageProps = {
  searchParams?: SearchParams;
};

const RANGE_OPTIONS = new Set(['30d', '90d', '180d', '365d']);

function clampRange(value?: string | null): '30d' | '90d' | '180d' | '365d' {
  if (value && RANGE_OPTIONS.has(value)) return value as any;
  return '180d';
}

function clampScope(value?: string | null): 'all' | 'global' | 'personal' {
  if (value === 'all' || value === 'personal' || value === 'global') return value;
  return 'global';
}

function clampPublished(value?: string | null): 'all' | 'published' | 'draft' {
  if (value === 'all' || value === 'draft' || value === 'published') return value;
  return 'published';
}

function clampSort(value?: string | null): 'created_desc' | 'updated_desc' | 'name_asc' {
  if (value === 'created_desc' || value === 'updated_desc' || value === 'name_asc') return value;
  return 'updated_desc';
}

export default async function AdminCatalogPage({ searchParams }: PageProps) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  const params = {
    q: searchParams?.q ?? undefined,
    scope: clampScope(searchParams?.scope),
    published: clampPublished(searchParams?.published),
    difficulty: searchParams?.difficulty ?? undefined,
    equipment: searchParams?.equipment ?? undefined,
    muscle: searchParams?.muscle ?? undefined,
    range: clampRange(searchParams?.range),
    page: searchParams?.page ? Number(searchParams.page) || 0 : 0,
    pageSize: searchParams?.pageSize ? Number(searchParams.pageSize) || 25 : 25,
    sort: clampSort(searchParams?.sort),
  } as const;

  const initial = await loadAdminExercisesDashboard(params);
  if (!initial.ok) {
    const message = 'error' in initial ? initial.error : null;
    throw new Error(message ?? 'Falha ao carregar o catálogo administrativo');
  }

  return <AdminCatalogClient initialData={initial.data} initialParams={params} />;
}
