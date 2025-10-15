// src/app/api/anthropometry/route.ts
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
} from './_helpers';

// Verifica se o utilizador pode aceder aos dados do clientId
async function ensureAccess(user: { id: string; role?: unknown }, clientId: string) {
  const role = toAppRole((user as any).role); // 'ADMIN' | 'TRAINER' | 'CLIENT'
  if (role === 'ADMIN' || user.id === clientId) return { ok: true as const, role };

  // Se for TRAINER precisa de vínculo em trainer_clients
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('trainer_clients')
    .select('id')
    .eq('trainer_id', user.id)
    .eq('client_id', clientId)
    .limit(1)
    .maybeSingle();

  if (error) return { ok: false as const, code: 500 as const, msg: error.message };
  return data ? { ok: true as const, role } : { ok: false as const, code: 403 as const, msg: 'Forbidden' };
}

/**
 * GET /api/anthropometry?client=<clientId>
 * - ADMIN pode ler qualquer cliente
 * - TRAINER precisa de vínculo ao cliente
 * - CLIENT só lê os seus próprios registos (se ?client ausente, usa o próprio id)
 */
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const queryClient =
    url.searchParams.get('client') ||
    url.searchParams.get('clientId') ||
    undefined;

  const role = toAppRole((user as any).role);
  const clientId = queryClient ?? (role === 'CLIENT' ? user.id : undefined);
  if (!clientId) return new NextResponse('Missing client id', { status: 400 });

  const access = await ensureAccess(user, clientId);
  if (!access.ok) return new NextResponse(access.msg ?? 'Forbidden', { status: access.code ?? 403 });

  const supabase = createServerClient();
  const { rows, error } = await selectAnthropometryRows(supabase, clientId);

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(rows satisfies AnthropometryApiRow[]);
}

/**
 * POST /api/anthropometry
 * body: { clientId?: string, measured_at/date?: string, ... }
 * - ADMIN pode criar para qualquer cliente (clientId obrigatório)
 * - TRAINER precisa de vínculo ao clientId
 * - CLIENT pode criar para si (clientId opcional; assume o próprio)
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const rawBody = (await req.json().catch(() => null)) as (Partial<AnthropometryApiRow> & {
    clientId?: string;
    date?: string;
  }) | null;

  const role = toAppRole((user as any).role);

  const clientId =
    rawBody?.clientId ??
    (rawBody as any)?.client_id ??
    (role === 'CLIENT' ? user.id : undefined);
  if (!clientId) return new NextResponse('Missing client id', { status: 400 });

  const access = await ensureAccess(user, clientId);
  if (!access.ok) return new NextResponse(access.msg ?? 'Forbidden', { status: access.code ?? 403 });

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
    createdById: user.id,
  });

  if (error || !row) {
    return new NextResponse(error?.message ?? 'Failed to insert measurement', { status: 500 });
  }

  return NextResponse.json(row satisfies AnthropometryApiRow, { status: 201 });
}
