import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return NextResponse.json({ ok: false }, { status: 403 });

  const { role: newRole } = await req.json().catch(() => ({}));
  const sb = createServerClient();

  try {
    await sb.from('users').update({ approved: true, status: 'ACTIVE', role: newRole || 'CLIENT' }).eq('id', params.id);

    // notificação (se existir tabela)
    try {
      await sb.from('notifications').insert({
        user_id: params.id,
        title: 'Conta aprovada',
        body: 'A tua conta foi aprovada por um administrador.',
        read: false,
        href: '/dashboard',
      });
    } catch {}

    // audit log (se existir tabela)
    try {
      await sb.from('audit_log').insert({
        actor_id: session.user.id,
        target_id: params.id,
        action: 'APPROVE_USER',
        meta: { role: newRole || 'CLIENT' },
      });
    } catch {}
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
