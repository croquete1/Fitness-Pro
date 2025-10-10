import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']).optional(),
  sessionsUsed: z.number().int().min(0).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string; role?: string | null } | undefined;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();
  const role = toAppRole(user.role) ?? 'CLIENT';

  const { data, error } =
    role === 'ADMIN'
      ? await sb.from('packages').select('*').eq('id', id).maybeSingle()
      : await sb.from('packages').select('*').eq('id', id).eq('user_id', user.id).maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return new NextResponse('Not Found', { status: 404 });

  return NextResponse.json(data, { status: 200 });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string; role?: string | null } | undefined;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(user.role) ?? 'CLIENT';
  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const sb = createServerClient();

  // Dono pode editar nome/consumo; ADMIN/PT pode administrar tudo
  const filter = role === 'ADMIN' || role === 'PT' ? { id } : { id, user_id: user.id };

  const patch: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;
  if (parsed.data.sessionsUsed !== undefined) patch.sessions_used = parsed.data.sessionsUsed;

  const { error } = await sb.from('packages').update(patch).match(filter).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
