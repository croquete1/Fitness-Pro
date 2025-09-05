import { mem, json } from '@/app/api/_memdb';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: { userId: string } }) {
  const { userId } = ctx.params;
  return json(mem.sessions.get(userId) ?? []);
}

export async function POST(req: Request, ctx: { params: { userId: string } }) {
  const { userId } = ctx.params;
  const form = await req.formData();
  const session = {
    id: `s_${Date.now()}`,
    title: String(form.get('title') || 'Sessão'),
    startsAt: String(form.get('startsAt') || new Date().toISOString()),
    durationMin: Number(form.get('durationMin') || 60),
    location: (form.get('location') as string) || null,
  };
  const list = mem.sessions.get(userId) ?? [];
  mem.sessions.set(userId, [session, ...list]);
  // TODO: opcional — disparar criação na agenda (admin/PT/cliente)
  return json(session, { status: 201 });
}
