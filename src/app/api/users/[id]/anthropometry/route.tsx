import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';

type Row = {
  id: string;
  client_id: string;
  created_by_id: string | null;
  date: string;
  height_cm: number | null;
  weight_kg: number | null;
  body_fat_pct: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  calf_cm: number | null;
  shoulders_cm: number | null;
  neck_cm: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// GET: histórico do utilizador :id
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const clientId = params.id;

  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = toAppRole((me as any).role); // 'admin' | 'pt' | 'client'

  // Permissões: admin, o próprio cliente, ou PT com vínculo ao cliente
  if (role !== 'admin' && me.id !== clientId) {
    const link = await prisma.$queryRaw<{ ok: boolean }[]>`
      select true as ok
      from trainer_clients
      where trainer_id = ${me.id}::uuid and client_id = ${clientId}::uuid
      limit 1
    `;
    const allowed = Array.isArray(link) && link.length > 0;
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rows = await prisma.$queryRaw<Row[]>`
    select
      id,
      client_id,
      created_by_id,
      to_char(date, 'YYYY-MM-DD') as date,
      height_cm,
      weight_kg,
      body_fat_pct,
      chest_cm,
      waist_cm,
      hip_cm,
      thigh_cm,
      arm_cm,
      calf_cm,
      shoulders_cm,
      neck_cm,
      notes,
      to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at,
      to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at
    from anthropometry
    where client_id = ${clientId}::uuid
    order by date desc, created_at desc
    limit 200
  `;

  return NextResponse.json(rows ?? []);
}

// POST: cria nova avaliação para o utilizador :id
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const clientId = params.id;

  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = toAppRole((me as any).role); // 'admin' | 'pt' | 'client'
  const body = await req.json();

  const {
    date, // 'YYYY-MM-DD'
    height_cm,
    weight_kg,
    body_fat_pct,
    chest_cm,
    waist_cm,
    hip_cm,
    thigh_cm,
    arm_cm,
    calf_cm,
    shoulders_cm,
    neck_cm,
    notes,
  } = body ?? {};

  if (!date) {
    return NextResponse.json({ error: 'date é obrigatório (YYYY-MM-DD)' }, { status: 400 });
  }

  // Permissões: admin, o próprio cliente, ou PT com vínculo ao cliente
  if (role !== 'admin' && me.id !== clientId) {
    const link = await prisma.$queryRaw<{ ok: boolean }[]>`
      select true as ok
      from trainer_clients
      where trainer_id = ${me.id}::uuid and client_id = ${clientId}::uuid
      limit 1
    `;
    const allowed = Array.isArray(link) && link.length > 0;
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ins = await prisma.$queryRaw<{ id: string }[]>`
    insert into anthropometry (
      client_id, created_by_id, date,
      height_cm, weight_kg, body_fat_pct,
      chest_cm, waist_cm, hip_cm,
      thigh_cm, arm_cm, calf_cm,
      shoulders_cm, neck_cm, notes
    ) values (
      ${clientId}::uuid, ${me.id}::uuid, ${date}::date,
      ${height_cm}, ${weight_kg}, ${body_fat_pct},
      ${chest_cm}, ${waist_cm}, ${hip_cm},
      ${thigh_cm}, ${arm_cm}, ${calf_cm},
      ${shoulders_cm}, ${neck_cm}, ${notes}
    )
    returning id
  `;

  return NextResponse.json({ id: ins?.[0]?.id ?? null }, { status: 201 });
}
