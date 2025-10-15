// src/app/api/anthropometry/[clientId]/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import {
  insertAnthropometryRow,
  normalizeDate,
  selectAnthropometryRows,
  toNullableNumber,
  type AnthropometryApiRow,
} from '../_helpers';

type Ctx = { params: Promise<{ clientId: string }> };

async function ensureCanAccess(clientId: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, code: 401 as const };

  const role = toAppRole((user as any).role); // 'ADMIN' | 'TRAINER' | 'CLIENT'
  if (role === 'ADMIN' || user.id === clientId) return { ok: true as const, user };

  // PT com vínculo ao cliente (trainer_clients)
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('trainer_clients')
    .select('id')
    .eq('trainer_id', user.id)
    .eq('client_id', clientId)
    .limit(1)
    .maybeSingle();

  if (error) {
    // não rebentar por erro de leitura; tratar como sem acesso
    return { ok: false as const, code: 403 as const };
  }

  return data ? { ok: true as const, user } : { ok: false as const, code: 403 as const };
}

/** GET: lista últimas medições do cliente */
export async function GET(_: Request, ctx: Ctx) {
  const { clientId } = await ctx.params;
  const access = await ensureCanAccess(clientId);
  if (!access.ok) {
    return new NextResponse(access.code === 401 ? 'Unauthorized' : 'Forbidden', { status: access.code });
  }

  const supabase = createServerClient();
  const { rows, error } = await selectAnthropometryRows(supabase, clientId);

  if (error) return new NextResponse(error.message, { status: 500 });

  return NextResponse.json(rows satisfies AnthropometryApiRow[]);
}

/** POST: cria uma medição para o cliente (ADMIN, TRAINER com vínculo, ou o próprio CLIENT) */
export async function POST(req: Request, ctx: Ctx) {
  const { clientId } = await ctx.params;
  const access = await ensureCanAccess(clientId);
  if (!access.ok) {
    return new NextResponse(access.code === 401 ? 'Unauthorized' : 'Forbidden', { status: access.code });
  }

  const rawBody = (await req.json().catch(() => null)) as (Partial<AnthropometryApiRow> & {
    date?: string;
  }) | null;

  const supabase = createServerClient();

  const measuredAt = normalizeDate(rawBody?.measured_at ?? rawBody?.date ?? null);

  const { row, error } = await insertAnthropometryRow(supabase, {
    clientId,
    measuredAt,
    weightKg: toNullableNumber(rawBody?.weight_kg ?? (rawBody as any)?.weight ?? null),
    heightCm: toNullableNumber(rawBody?.height_cm ?? (rawBody as any)?.height ?? null),
    bodyFatPct: toNullableNumber(rawBody?.body_fat_pct ?? null),
    chestCm: toNullableNumber(rawBody?.chest_cm ?? null),
    waistCm: toNullableNumber(rawBody?.waist_cm ?? null),
    hipCm: toNullableNumber(rawBody?.hip_cm ?? null),
    thighCm: toNullableNumber(rawBody?.thigh_cm ?? null),
    armCm: toNullableNumber(rawBody?.arm_cm ?? null),
    calfCm: toNullableNumber(rawBody?.calf_cm ?? null),
    shouldersCm: toNullableNumber(rawBody?.shoulders_cm ?? null),
    neckCm: toNullableNumber(rawBody?.neck_cm ?? null),
    bmi: toNullableNumber(rawBody?.bmi ?? null),
    notes: typeof rawBody?.notes === 'string' ? rawBody.notes : null,
    createdById: access.user?.id,
  });

  if (error || !row) {
    return new NextResponse(error?.message ?? 'Failed to insert measurement', { status: 500 });
  }

  return NextResponse.json(row satisfies AnthropometryApiRow, { status: 201 });
}
