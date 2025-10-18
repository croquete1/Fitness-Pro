export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

import AdminExercisesClient from './exercises.client';
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
  if (!value) return '180d';
  if (RANGE_OPTIONS.has(value)) return value as any;
  return '180d';
}

function clampScope(value?: string | null): 'all' | 'global' | 'personal' {
  if (value === 'global' || value === 'personal') return value;
  return 'all';
}

function clampPublished(value?: string | null): 'all' | 'published' | 'draft' {
  if (value === 'published' || value === 'draft') return value;
  return 'all';
}

function clampSort(value?: string | null): 'created_desc' | 'updated_desc' | 'name_asc' {
  if (value === 'updated_desc' || value === 'name_asc') return value;
  return 'created_desc';
}

export default async function AdminExercisesPage({ searchParams }: PageProps) {
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
    pageSize: searchParams?.pageSize ? Number(searchParams.pageSize) || undefined : undefined,
    sort: clampSort(searchParams?.sort),
  } as const;

  const initial = await loadAdminExercisesDashboard(params);
  if (!initial.ok) {
    const message = 'error' in initial ? initial.error : null;
    throw new Error(message ?? 'Falha ao carregar catálogo de exercícios');
  }

  return <AdminExercisesClient initialData={initial.data} initialParams={params} />;
}
