import { NextResponse } from 'next/server';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';
import { getSampleUsers } from '@/lib/fallback/users';

const TABLE_CANDIDATES = ['profiles', 'users', 'app_users', 'people'];

function mapRow(row: any) {
  return {
    id: String(row?.id ?? row?.user_id ?? ''),
    name: row?.name ?? row?.full_name ?? row?.fullName ?? null,
    email: row?.email ?? row?.contact_email ?? null,
    role: toAppRole(row?.role ?? null) ?? row?.role ?? 'TRAINER',
    status: String(row?.status ?? row?.state ?? 'ACTIVE').toUpperCase(),
  };
}

export async function GET(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) {
    return guard.response;
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim().toLowerCase();
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 10)));

  const sb = tryCreateServerClient();
  if (!sb) {
    const fallback = getSampleUsers({ page: 0, pageSize: limit, search: q, role: 'TRAINER' });
    return NextResponse.json({ data: fallback.rows });
  }

  for (const table of TABLE_CANDIDATES) {
    try {
      let builder: any = sb.from(table).select('*').limit(limit).in('role', ['TRAINER', 'PT']);
      if (q) {
        builder = builder.or(`name.ilike.%${q}%,full_name.ilike.%${q}%,email.ilike.%${q}%`);
      }
      const res = await builder;
      if (res.error) {
        const code = res.error.code ?? '';
        if (code === 'PGRST205' || code === 'PGRST301' || code === '42703') continue;
        return NextResponse.json({ error: res.error.message }, { status: 400 });
      }
      if (!res.data?.length) continue;
      const data = res.data.map(mapRow).filter((row) => row.id);
      if (!data.length) continue;
      return NextResponse.json({ data });
    } catch (error: any) {
      const code = error?.code ?? error?.message ?? '';
      if (code.includes('PGRST205') || code.includes('PGRST301')) continue;
      return NextResponse.json({ error: error?.message ?? 'REQUEST_FAILED' }, { status: 400 });
    }
  }

  const fallback = getSampleUsers({ page: 0, pageSize: limit, search: q, role: 'TRAINER' });
  return NextResponse.json({ data: fallback.rows });
}
