import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

type Profile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
};

export async function GET() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string } | undefined;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();

  const { data: profile, error: pErr } = await sb
    .from('profiles')
    .select('id,name,avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  // pequenos contadores úteis para a conta do cliente
  const [{ count: plans = 0 }, { count: sessions = 0 }] = await Promise.all([
    sb.from('training_plans').select('*', { head: true, count: 'exact' }).eq('client_id', user.id),
    sb.from('sessions').select('*', { head: true, count: 'exact' }).eq('client_id', user.id),
  ]);

  const payload: { profile: Profile | null; counters: { plans: number; sessions: number } } = {
    profile: (profile as Profile | null) ?? null,
    counters: { plans, sessions },
  };

  return NextResponse.json(payload, { status: 200 });
}
