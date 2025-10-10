import { mem, json } from '@/app/api/_memdb';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return json(mem.notes.get(id) ?? []);
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const form = await req.formData();
  const text = String(form.get('text') || '').trim();
  if (!text) return json(null, { status: 204 });

  const note = {
    id: `n_${Date.now()}`,
    createdAt: new Date().toISOString(),
    author: 'PT', // TODO: usar utilizador autenticado
    text,
  };
  const list = mem.notes.get(id) ?? [];
  mem.notes.set(id, [note, ...list]);
  return json(note, { status: 201 });
}
