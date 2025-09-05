import { mem, json, AnthropometryEntry } from '@/app/api/_memdb';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: { userId: string } }) {
  const { userId } = ctx.params;
  const rows = mem.anthrop.get(userId) ?? [];
  const sorted = [...rows].sort((a, b) => (a.takenAt > b.takenAt ? -1 : 1));
  return json(sorted);
}

export async function POST(req: Request, ctx: { params: { userId: string } }) {
  const { userId } = ctx.params;
  const form = await req.formData();
  const nowId = `anth_${Date.now()}`;
  const entry: AnthropometryEntry = {
    id: nowId,
    takenAt: (form.get('takenAt') as string) || new Date().toISOString(),
    weightKg: toNum(form.get('weightKg')),
    bodyFatPct: toNum(form.get('bodyFatPct')),
    heightCm: toNum(form.get('heightCm')),
    chestCm: toNum(form.get('chestCm')),
    waistCm: toNum(form.get('waistCm')),
    hipCm: toNum(form.get('hipCm')),
    thighCm: toNum(form.get('thighCm')),
    armCm: toNum(form.get('armCm')),
    notes: (form.get('notes') as string) || null,
  };
  const list = mem.anthrop.get(userId) ?? [];
  mem.anthrop.set(userId, [entry, ...list]);
  return json(entry, { status: 201 });
}

function toNum(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
