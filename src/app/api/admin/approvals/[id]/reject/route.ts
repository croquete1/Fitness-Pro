import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return NextResponse.json({ ok: false }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const reason: string | undefined = body?.reason;

  const sb = createServerClient();

  try {
    await sb.from('users').update({ approved: false, status: 'REJECTED' }).eq('id', params.id);

    try {
      await sb.from('notifications').insert({
        user_id: params.id,
        title: 'Conta recusada',
        body: 'O teu registo foi recusado por um administrador.',
        read: false,
        href: '/dashboard',
      });
    } catch {}

    try {
      await sb.from('audit_log').insert({
        actor_id: session.user.id,
        target_id: params.id,
        action: 'REJECT_USER',
        meta: { reason: reason ?? null },
      });
    } catch {}
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
