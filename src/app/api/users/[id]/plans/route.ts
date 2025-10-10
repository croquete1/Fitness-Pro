import { mem, json } from '@/app/api/_memdb';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const data = mem.plans.get(id) ?? [];
  return json(data);
}
