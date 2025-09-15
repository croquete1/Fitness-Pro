import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();
  const { error } = await sb
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
