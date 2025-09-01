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

export async function GET(
  _req: Request,
  { params }: { params: { clientId: string } }
) {
  const clientId = params.clientId;

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = toAppRole((user as any).role); // 'admin' | 'pt' | 'client'

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
