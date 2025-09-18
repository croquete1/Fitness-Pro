// src/app/api/admin/approvals/[id]/reject/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });
  const sb = createServerClient();
  const uid = params.id;

  try {
    try { await sb.from('users').update({ approved: false, status: 'REJECTED' }).eq('id', uid); } catch {}
    try {
      await sb.from('notifications').insert({
        user_id: uid,
        title: 'Conta rejeitada',
        body: 'O teu registo foi rejeitado. Contacta o suporte para mais detalhes.',
        read: false,
      });
    } catch {}
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
