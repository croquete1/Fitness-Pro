import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = toAppRole((user as any).role); // 'admin' | 'pt' | 'client'
  const body = await req.json();

  const {
    clientId,
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

  if (!clientId || !date) {
    return NextResponse.json({ error: 'clientId e date são obrigatórios' }, { status: 400 });
  }

  // Permissões: admin, o próprio cliente, ou PT com vínculo ao cliente
  if (role !== 'admin' && user.id !== clientId) {
    const link = await prisma.$queryRaw<{ ok: boolean }[]>`
      select true as ok
      from trainer_clients
      where trainer_id = ${user.id}::uuid and client_id = ${clientId}::uuid
      limit 1
    `;
    const allowed = Array.isArray(link) && link.length > 0;
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    insert into anthropometry (
      client_id, created_by_id, date,
      height_cm, weight_kg, body_fat_pct,
      chest_cm, waist_cm, hip_cm,
      thigh_cm, arm_cm, calf_cm,
      shoulders_cm, neck_cm, notes
    ) values (
      ${clientId}::uuid, ${user.id}::uuid, ${date}::date,
      ${height_cm}, ${weight_kg}, ${body_fat_pct},
      ${chest_cm}, ${waist_cm}, ${hip_cm},
      ${thigh_cm}, ${arm_cm}, ${calf_cm},
      ${shoulders_cm}, ${neck_cm}, ${notes}
    )
    returning id
  `;

  return NextResponse.json({ id: rows?.[0]?.id ?? null }, { status: 201 });
}
