// src/app/api/notifications/mark-read/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json().catch(() => ({})) as { ids?: string[]; all?: boolean; status?: 'all'|'unread'|'read' };
  const sb = createServerClient();

  if (body.all) {
    let q = sb.from('notifications').update({ read: true }).eq('user_id', userId);
    if (body.status === 'unread' || !body.status) q = q.eq('read', false); // por padrão só marca por ler
    const { error } = await q;
    if (error) return new NextResponse(error.message, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const ids = (body.ids ?? []).filter(Boolean);
  if (ids.length === 0) return new NextResponse('Bad Request', { status: 400 });

  const { error } = await sb.from('notifications').update({ read: true }).in('id', ids).eq('user_id', userId);
  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json({ ok: true, updated: ids.length });
}
