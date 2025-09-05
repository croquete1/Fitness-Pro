import { mem, json } from '@/app/api/_memdb';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: { userId: string } }) {
  const { userId } = ctx.params;
  return json(mem.notes.get(userId) ?? []);
}

export async function POST(req: Request, ctx: { params: { userId: string } }) {
  const { userId } = ctx.params;
  const form = await req.formData();
  const text = String(form.get('text') || '').trim();
  if (!text) return json(null, { status: 204 });

  const note = {
    id: `n_${Date.now()}`,
    createdAt: new Date().toISOString(),
    author: 'PT', // TODO: usar utilizador autenticado
    text,
  };
  const list = mem.notes.get(userId) ?? [];
  mem.notes.set(userId, [note, ...list]);
  return json(note, { status: 201 });
}
