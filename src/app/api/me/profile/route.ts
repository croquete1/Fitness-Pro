import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { syncUserProfile } from '@/lib/profileSync';

type SessionUser = { id?: string };
type SessionLike = { user?: SessionUser } | null;

type Body = {
  name?: string | null;
  phone?: string | null;
  birth_date?: string | null; // yyyy-mm-dd
};

export async function PUT(req: Request) {
  const session = (await getSessionUserSafe()) as SessionLike;
  const user = session?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const payload = (await req.json().catch(() => null)) as Body | null;
  if (!payload) return new NextResponse('Bad request', { status: 400 });

  const sb = createServerClient();
  const patch: Record<string, unknown> = {};
  if (payload.name !== undefined) patch.name = payload.name;
  if (payload.phone !== undefined) patch.phone = payload.phone;
  if (payload.birth_date !== undefined) patch.birth_date = payload.birth_date;

  if (!Object.keys(patch).length) return NextResponse.json({ ok: true, id: user.id });

  const result = await syncUserProfile(sb, user.id, patch);
  if (!result.ok) return new NextResponse(result.error, { status: 500 });

  return NextResponse.json({ ok: true, id: user.id });
}
