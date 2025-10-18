import { NextResponse } from 'next/server';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { loadAdminExercisesDashboard } from '@/lib/admin/exercises/server';

const RANGE_OPTIONS = new Set(['30d', '90d', '180d', '365d']);

export async function GET(request: Request) {
  const viewer = await getSessionUserSafe();
  if (!viewer?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Não autenticado.' }, { status: 401 });
  }

  const role = toAppRole(viewer.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'Sem permissões.' }, { status: 403 });
  }

  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());

  const range = RANGE_OPTIONS.has(params.range ?? '') ? (params.range as any) : '180d';
  const scope = params.scope === 'global' || params.scope === 'personal' ? params.scope : 'all';
  const published = params.published === 'published' || params.published === 'draft' ? params.published : 'all';
  const sort = params.sort === 'name_asc' || params.sort === 'updated_desc' ? params.sort : 'created_desc';

  const payload = await loadAdminExercisesDashboard({
    q: params.q ?? undefined,
    scope,
    published,
    difficulty: params.difficulty ?? undefined,
    equipment: params.equipment ?? undefined,
    muscle: params.muscle ?? undefined,
    range,
    page: params.page ? Number(params.page) || 0 : 0,
    pageSize: params.pageSize ? Number(params.pageSize) || undefined : undefined,
    sort,
  });

  return NextResponse.json(payload);
}
