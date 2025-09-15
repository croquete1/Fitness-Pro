import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type SessionUser = { id?: string; role?: string | null };
type SessionLike = { user?: SessionUser } | null;
type Body = { email: string };

export async function POST(req: Request) {
  const session = (await getSessionUserSafe()) as SessionLike;
  const me = session?.user;
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const payload = (await req.json().catch(() => null)) as Body | null;
  if (!payload?.email) return new NextResponse('Bad request', { status: 400 });

  const sb = createServerClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/login/reset`;

  // Tenta via admin API (requer chave service role). Se falhar, tenta a pública.
  const adminRes = await sb.auth.admin.generateLink({
    type: 'recovery',
    email: payload.email,
    options: { redirectTo },
  });

  if (adminRes.error) {
    // fallback
    const alt = await sb.auth.resetPasswordForEmail(payload.email, { redirectTo });
    if (alt.error) return new NextResponse(alt.error.message, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
