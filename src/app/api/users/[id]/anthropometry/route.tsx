// src/app/api/users/[id]/anthropometry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSessionUser } from '@/lib/sessions';
import { Role } from '@prisma/client';

const SUPABASE_URL  = process.env.SUPABASE_URL!;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!; // ⚠️ server only

function sb() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const clientId = params.id;
  const { data, error } = await sb()
    .from('anthropometry')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false });

  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me) return new NextResponse('Unauthorized', { status: 401 });

  if (me.role !== Role.ADMIN && me.role !== Role.TRAINER) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const clientId = params.id;
  const body = await req.json();

  const payload = {
    client_id: clientId,
    created_by_id: me.id,
    date: body.date ?? new Date().toISOString(),
    height_cm: body.heightCm ?? null,
    weight_kg: body.weightKg ?? null,
    body_fat_pct: body.bodyFatPct ?? null,
    chest_cm: body.chestCm ?? null,
    waist_cm: body.waistCm ?? null,
    hip_cm: body.hipCm ?? null,
    thigh_cm: body.thighCm ?? null,
    arm_cm: body.armCm ?? null,
    calf_cm: body.calfCm ?? null,
    shoulders_cm: body.shouldersCm ?? null,
    neck_cm: body.neckCm ?? null,
    notes: body.notes ?? null,
  };

  const { data, error } = await sb().from('anthropometry').insert(payload).select().single();
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
