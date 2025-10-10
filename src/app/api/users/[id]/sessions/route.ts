import { mem, json } from '@/app/api/_memdb';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return json(mem.sessions.get(id) ?? []);
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const form = await req.formData();
  const session = {
    id: `s_${Date.now()}`,
    title: String(form.get('title') || 'Sessão'),
    startsAt: String(form.get('startsAt') || new Date().toISOString()),
    durationMin: Number(form.get('durationMin') || 60),
    location: (form.get('location') as string) || null,
  };
  const list = mem.sessions.get(id) ?? [];
  mem.sessions.set(id, [session, ...list]);
  // TODO: opcional — disparar criação na agenda (admin/PT/cliente)
  return json(session, { status: 201 });
}
