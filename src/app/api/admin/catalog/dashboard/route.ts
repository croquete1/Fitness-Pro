import { NextResponse } from 'next/server';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { loadAdminExercisesDashboard } from '@/lib/admin/exercises/server';
import { type AdminExercisesDashboardParams } from '@/lib/admin/exercises/types';

const RANGE_OPTIONS = new Set(['30d', '90d', '180d', '365d']);

function clampRange(value?: string | null): AdminExercisesDashboardParams['range'] {
  if (value && RANGE_OPTIONS.has(value)) return value as any;
  return '180d';
}

function clampScope(value?: string | null): AdminExercisesDashboardParams['scope'] {
  if (value === 'all' || value === 'personal' || value === 'global') return value;
  return 'global';
}

function clampPublished(value?: string | null): AdminExercisesDashboardParams['published'] {
  if (value === 'all' || value === 'draft' || value === 'published') return value;
  return 'published';
}

function clampSort(value?: string | null): NonNullable<AdminExercisesDashboardParams['sort']> {
  if (value === 'created_desc' || value === 'updated_desc' || value === 'name_asc') return value;
  return 'updated_desc';
}

export async function GET(request: Request) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  const search = url.searchParams;

  const params: AdminExercisesDashboardParams = {
    q: search.get('q') ?? undefined,
    scope: clampScope(search.get('scope')),
    published: clampPublished(search.get('published')),
    difficulty: search.get('difficulty') ?? undefined,
    equipment: search.get('equipment') ?? undefined,
    muscle: search.get('muscle') ?? undefined,
    range: clampRange(search.get('range')),
    page: search.get('page') ? Number(search.get('page')) || 0 : 0,
    pageSize: search.get('pageSize') ? Number(search.get('pageSize')) || 25 : 25,
    sort: clampSort(search.get('sort')),
  };

  const result = await loadAdminExercisesDashboard(params);
  if (!result.ok) {
    const message = 'error' in result ? result.error : null;
    return NextResponse.json({ ok: false, error: message ?? 'Falha ao gerar catálogo' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: result.data });
}
