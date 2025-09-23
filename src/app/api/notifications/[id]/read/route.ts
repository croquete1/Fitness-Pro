// src/app/api/notifications/[id]/read/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { touchNotifications } from '@/lib/revalidate';

export async function PATCH(_req: Request, ctx: { params: { id: string } }) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

  const id = ctx.params?.id;
  if (!id) return NextResponse.json({ ok: false, error: 'MISSING_ID' }, { status: 400 });

  const { error } = await sb.from('notifications').update({ read: true }).eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  touchNotifications();
  return NextResponse.json({ ok: true });
}
