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
  const newRole: string | undefined = body?.role;
  const reason: string | undefined = body?.reason;

  const sb = createServerClient();

  try {
    const { data: before } = await sb.from('users').select('id,role,approved,status').eq('id', params.id).maybeSingle();
    await sb.from('users').update({ approved: true, status: 'ACTIVE', role: newRole || before?.role || 'CLIENT' }).eq('id', params.id);

    // notificação
    try {
      await sb.from('notifications').insert({
        user_id: params.id,
        title: 'Conta aprovada',
        body: 'A tua conta foi aprovada por um administrador.',
        read: false,
        href: '/dashboard',
      });
    } catch {}

    // audit log
    try {
      await sb.from('audit_log').insert({
        actor_id: session.user.id,
        target_id: params.id,
        action: 'APPROVE_USER',
        meta: { fromRole: before?.role ?? null, toRole: newRole || before?.role || 'CLIENT', reason: reason ?? null },
      });
    } catch {}
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
