import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const s = await getSessionUserSafe();
  if (!s?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json();

  const sb = createServerClient();
  const { error } = await sb.from('onboarding_notes').insert({
    onboarding_id: body.onboarding_id,
    author_id: s.user.id,
    visibility: body.visibility === 'shared' ? 'shared' : 'private',
    content: String(body.content ?? '').slice(0, 5000),
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
