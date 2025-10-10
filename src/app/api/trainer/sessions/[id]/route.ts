import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requirePtOrAdminGuard, isGuardErr } from '@/lib/api-guards';

type SessionRow = {
  id: string;
  trainer_id: string | null;
  client_id: string | null;
  scheduled_at: string | null;
  duration_min: number | null;
  location: string | null;
  notes: string | null;
  created_at: string | null;
};

type Ctx = { params: Promise<{ id: string }> };

export async function GET(
  _req: Request,
  ctx: Ctx
): Promise<Response> {
  const { id } = await ctx.params;
  const guard = await requirePtOrAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = createServerClient();
  const { data, error } = await sb
    .from('sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

  // Se for PT, só pode ver a própria sessão
  if (guard.me.role === 'PT' && data.trainer_id !== guard.me.id) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.json({ ok: true, item: data as SessionRow }, { status: 200 });
}

// (Opcional) PATCH/DELETE seguem o mesmo padrão de guard + verificações:
// export async function PATCH(...) { ... }
// export async function DELETE(...) { ... }
