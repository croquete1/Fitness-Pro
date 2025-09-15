import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

type SessionUser = { id?: string };
type SessionLike = { user?: SessionUser } | null;

export async function GET() {
  const session = (await getSessionUserSafe()) as SessionLike;
  const user = session?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('profiles')
    .select('name, phone, birth_date, avatar_url')
    .eq('id', user.id)
    .maybeSingle();
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data ?? {});
}
