import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { tryGetSBC } from '@/lib/supabase/server';
import { supabaseFallbackJson } from '@/lib/supabase/responses';

const QuerySchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export async function GET(req: Request) {
  const me = await getSessionUserSafe();
  if (!me?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
  const role = toAppRole(me.user.role);
  if (role !== 'CLIENT' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const sb = await tryGetSBC();
  if (!sb) {
    return supabaseFallbackJson({ trainers: [] });
  }

  const url = new URL(req.url);
  const params = QuerySchema.safeParse({
    q: url.searchParams.get('q') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
  });
  if (!params.success) {
    return NextResponse.json({ error: 'INVALID_QUERY', details: params.error.message }, { status: 400 });
  }

  const { q, limit } = params.data;
  let query = sb
    .from('users' as any)
    .select('id, name, email, status')
    .eq('role', 'TRAINER')
    .order('name', { ascending: true })
    .limit(limit ?? 40);

  if (q && q.trim()) {
    const cleaned = q.trim().replace(/[*,]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleaned) {
      const pattern = `*${cleaned.replace(/[.*]/g, '')}*`;
      query = query.or(`name.ilike.${pattern},email.ilike.${pattern}`);
    }
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const trainers = (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name ?? null,
    email: row.email ?? null,
    status: row.status ?? null,
  }));

  return NextResponse.json({ trainers });
}
