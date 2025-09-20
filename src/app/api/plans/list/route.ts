import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';

export async function GET(req: Request) {
  const s = await getSessionUserSafe();
  if (!s?.user?.id) return NextResponse.json({ items: [], total: 0 }, { status: 401 });

  const u = new URL(req.url);
  const mode = (u.searchParams.get('mode') || 'client').toLowerCase(); // 'pt' | 'client'
  const page = Math.max(1, parseInt(u.searchParams.get('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(u.searchParams.get('pageSize') || '10', 10)));
  const q = (u.searchParams.get('q') || '').trim();
  const like = q ? `%${q.replace(/[%_]/g, '')}%` : null;

  const role = toAppRole(s.user.role) ?? 'CLIENT';
  const sb = createServerClient();

  let baseCount = sb.from('training_plans').select('*', { count: 'exact', head: true });
  let baseData = sb.from('training_plans')
    .select('id,name,client_id,trainer_id,updated_at,status')
    .order('updated_at', { ascending: false })
    .range((page - 1) * pageSize, (page - 1) * pageSize + pageSize - 1);

  if (mode === 'pt') {
    if (!(isPT(role) || isAdmin(role))) return NextResponse.json({ items: [], total: 0 }, { status: 403 });
    baseCount = baseCount.eq('trainer_id', s.user.id);
    baseData = baseData.eq('trainer_id', s.user.id);
  } else {
    // client
    baseCount = baseCount.eq('client_id', s.user.id);
    baseData = baseData.eq('client_id', s.user.id);
  }

  if (like) {
    baseCount = baseCount.ilike('name', like);
    baseData = baseData.ilike('name', like);
  }

  const [{ count }, { data }] = await Promise.all([baseCount, baseData]);
  const items = (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name ?? 'Sem nome',
    client_id: r.client_id ?? '',
    trainer_id: r.trainer_id ?? '',
    updated_at: r.updated_at,
    status: r.status ?? 'draft',
  }));
  return NextResponse.json({ items, total: count ?? 0 });
}
