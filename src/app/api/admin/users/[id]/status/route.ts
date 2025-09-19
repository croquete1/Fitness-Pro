import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });
  const { status } = await req.json().catch(() => ({}));

  const sb = createServerClient();
  try {
    await sb.from('users').update({ status, approved: status === 'ACTIVE' ? true : null }).eq('id', params.id);
  } catch {}
  return NextResponse.json({ ok: true });
}
