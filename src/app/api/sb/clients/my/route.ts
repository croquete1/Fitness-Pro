// src/app/api/sb/clients/my/route.ts
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/authz';
import { Role } from '@prisma/client';
import { getSBC } from '@/lib/supabase/server'; // usa o helper de server-side Supabase

export const dynamic = 'force-dynamic';

type ClientRow = {
  id: string;
  name: string | null;
  email: string;
  status: string | null;
  created_at: string | null;
};

export async function GET() {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER]);
  if ('error' in guard) return guard.error;
  const { user } = guard;

  const supabase = getSBC();

  // ADMIN → todos os clientes
  if (user.role === Role.ADMIN) {
    const { data, error } = await supabase
      .from('users')
      .select('id,name,email,status,created_at')
      .eq('role', 'CLIENT')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[sb/clients/my] ADMIN list error:', error);
      return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 });
    }

    const clients = (data ?? []).map((r: ClientRow) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      status: r.status,
      createdAt: r.created_at, // ISO string; a UI já trata com new Date(...)
    }));

    return NextResponse.json({ data: clients });
  }

  // TRAINER → apenas clientes associados
  // 1) pega os ids de clientes na trainer_clients
  const { data: links, error: linkErr } = await supabase
    .from('trainer_clients')
    .select('client_id, created_at')
    .eq('trainer_id', user.id!)
    .order('created_at', { ascending: false });

  if (linkErr) {
    console.error('[sb/clients/my] trainer link error:', linkErr);
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 });
  }

  const clientIds = (links ?? []).map((l) => l.client_id);
  if (clientIds.length === 0) return NextResponse.json({ data: [] });

  // 2) busca os utilizadores
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .select('id,name,email,status,created_at')
    .in('id', clientIds);

  if (usersErr) {
    console.error('[sb/clients/my] users fetch error:', usersErr);
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 });
  }

  // manter ordem pela ligação mais recente
  const orderMap = new Map<string, string>(
    (links ?? []).map((l) => [l.client_id, l.created_at as string])
  );

  const result = (users ?? [])
    .map((u: ClientRow) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      createdAt: u.created_at,
      _linkCreatedAt: orderMap.get(u.id) ?? u.created_at ?? '',
    }))
    .sort((a, b) => (a._linkCreatedAt < b._linkCreatedAt ? 1 : -1))
    .map(({ _linkCreatedAt, ...rest }) => rest);

  return NextResponse.json({ data: result });
}
