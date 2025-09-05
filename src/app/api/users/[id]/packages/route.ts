import { mem, json } from '@/app/api/_memdb';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: { userId: string } }) {
  const { userId } = ctx.params;
  const data = mem.packages.get(userId) ?? { current: null, history: [] };
  return json(data);
}
