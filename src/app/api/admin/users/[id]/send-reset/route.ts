// src/app/api/admin/users/[id]/send-reset/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(
  _req: Request,
  ctx: Ctx
) {
  const sb = getSupabaseServer();
  const { id } = await ctx.params;

  const { data: u, error } = await sb
    .from('users')
    .select('email')
    .eq('id', id)
    .single();

  if (error || !u?.email) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'http://localhost:3000';

  // Envia email de recuperação via provider do Supabase
  const { error: e2 } = await sb.auth.resetPasswordForEmail(u.email, {
    redirectTo: `${site}/auth/update-password`,
  });

  if (e2) {
    return NextResponse.json({ error: e2.message }, { status: 400 });
  }

  // 204: sem body
  return new NextResponse(null, { status: 204 });
}
