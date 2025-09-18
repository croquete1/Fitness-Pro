// src/app/api/admin/approvals/[id]/approve/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });
  const sb = createServerClient();
  const uid = params.id;

  try {
    // tenta approved=true, se não existir cai para status
    try { await sb.from('users').update({ approved: true, status: 'ACTIVE' }).eq('id', uid); } catch {}
    try { await sb.from('users').update({ status: 'ACTIVE' }).eq('id', uid); } catch {}

    // notificação ao utilizador
    try {
      await sb.from('notifications').insert({
        user_id: uid,
        title: 'Conta aprovada',
        body: 'A tua conta foi aprovada por um administrador.',
        read: false,
      });
    } catch {}

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
