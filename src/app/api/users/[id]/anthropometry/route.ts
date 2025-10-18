import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { assertCanViewClient } from '@/lib/acl';
import { toAppRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

type AnthropometryRow = {
  id: string;
  user_id: string | null;
  measured_at: string | null;
  weight_kg: number | null;
  body_fat_pct: number | null;
  height_cm: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  calf_cm: number | null;
  shoulders_cm: number | null;
  neck_cm: number | null;
  notes: string | null;
  bmi: number | null;
  created_at: string | null;
  updated_at: string | null;
  created_by_id?: string | null;
};

type AnthropometryPayload = {
  id: string;
  takenAt: string | null;
  weightKg: number | null;
  bodyFatPct: number | null;
  heightCm: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  thighCm: number | null;
  armCm: number | null;
  calfCm: number | null;
  shouldersCm: number | null;
  neckCm: number | null;
  notes: string | null;
  bmi: number | null;
};

const SELECT_COLUMNS = [
  'id',
  'measured_at',
  'weight_kg',
  'body_fat_pct',
  'height_cm',
  'chest_cm',
  'waist_cm',
  'hip_cm',
  'thigh_cm',
  'arm_cm',
  'calf_cm',
  'shoulders_cm',
  'neck_cm',
  'notes',
  'bmi',
];

function toPayload(row: AnthropometryRow): AnthropometryPayload {
  return {
    id: row.id,
    takenAt: row.measured_at,
    weightKg: row.weight_kg,
    bodyFatPct: row.body_fat_pct,
    heightCm: row.height_cm,
    chestCm: row.chest_cm,
    waistCm: row.waist_cm,
    hipCm: row.hip_cm,
    thighCm: row.thigh_cm,
    armCm: row.arm_cm,
    calfCm: row.calf_cm,
    shouldersCm: row.shoulders_cm,
    neckCm: row.neck_cm,
    notes: row.notes,
    bmi: row.bmi,
  };
}

function toNumber(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function computeBmi(weightKg: number | null, heightCm: number | null) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm >= 3 ? heightCm / 100 : heightCm;
  if (!heightM) return null;
  const bmi = weightKg / (heightM * heightM);
  return Number.isFinite(bmi) ? Math.round(bmi * 10) / 10 : null;
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const meId = session?.id ?? session?.user?.id ?? null;
  if (!meId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const role = toAppRole(session?.role ?? session?.user?.role) ?? null;
  const sb = createServerClient();

  try {
    await assertCanViewClient({ id: meId, role }, id, sb);
  } catch (error: any) {
    const status = error?.status === 403 ? 403 : 500;
    return NextResponse.json({ error: 'forbidden' }, { status });
  }

  const { data, error } = await sb
    .from('anthropometry')
    .select(SELECT_COLUMNS.join(','))
    .eq('user_id', id)
    .order('measured_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('[client-anthropometry] failed to list entries', error);
    return NextResponse.json({ error: 'failed_to_load_measurements' }, { status: 500 });
  }

  const rows = ((data ?? []) as unknown) as AnthropometryRow[];
  return NextResponse.json(rows.map((row) => toPayload(row)));
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const meId = session?.id ?? session?.user?.id ?? null;
  if (!meId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const role = toAppRole(session?.role ?? session?.user?.role) ?? null;
  const sb = createServerClient();

  try {
    await assertCanViewClient({ id: meId, role }, id, sb);
  } catch (error: any) {
    const status = error?.status === 403 ? 403 : 500;
    return NextResponse.json({ error: 'forbidden' }, { status });
  }

  const form = await req.formData();
  const measuredAt = (form.get('takenAt') as string | null) ?? new Date().toISOString();
  const weightKg = toNumber(form.get('weightKg'));
  const heightCm = toNumber(form.get('heightCm'));

  const insert = {
    user_id: id,
    measured_at: measuredAt,
    weight_kg: weightKg,
    body_fat_pct: toNumber(form.get('bodyFatPct')),
    height_cm: heightCm,
    chest_cm: toNumber(form.get('chestCm')),
    waist_cm: toNumber(form.get('waistCm')),
    hip_cm: toNumber(form.get('hipCm')),
    thigh_cm: toNumber(form.get('thighCm')),
    arm_cm: toNumber(form.get('armCm')),
    calf_cm: toNumber(form.get('calfCm')),
    shoulders_cm: toNumber(form.get('shouldersCm')),
    neck_cm: toNumber(form.get('neckCm')),
    notes: (form.get('notes') as string | null) ?? null,
    created_by_id: meId,
    bmi: computeBmi(weightKg, heightCm),
  } satisfies Partial<AnthropometryRow> & { user_id: string; measured_at: string | null };

  const { data, error } = await sb
    .from('anthropometry')
    .insert(insert)
    .select(SELECT_COLUMNS.join(','))
    .single();

  if (error) {
    console.error('[client-anthropometry] failed to insert measurement', error);
    return NextResponse.json({ error: 'failed_to_create_measurement' }, { status: 500 });
  }

  return NextResponse.json(toPayload((data as unknown) as AnthropometryRow), { status: 201 });
}
