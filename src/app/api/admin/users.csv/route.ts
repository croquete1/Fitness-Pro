// src/app/api/admin/users.csv/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  if (toAppRole((session.user as any).role) !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .select('id,name,email,role,status,created_at')
    .order('created_at', { ascending: false });

  if (error) return new NextResponse(error.message, { status: 500 });

  const header = 'id,name,email,role,status,createdAt';
  const body = (data ?? [])
    .map((u: any) => [
      u.id,
      String(u.name ?? '').replaceAll(',', ' '),
      u.email,
      String(u.role),
      String(u.status),
      new Date(u.created_at).toISOString(),
    ].join(','))
    .join('\n');

  const csv = `${header}\n${body}`;
  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="users.csv"',
    },
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  if (toAppRole((session.user as any).role) !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  let ids: string[] | undefined;
  try {
    const body = await req.json();
    ids = Array.isArray(body?.ids) ? body.ids : undefined;
  } catch {}

  const supabase = supabaseAdmin();
  const base = supabase.from('users').select('id,name,email,role,status,created_at').order('created_at', { ascending: false });
  const q = ids && ids.length ? base.in('id', ids) : base;
  const { data, error } = await q;
  if (error) return new NextResponse(error.message, { status: 500 });

  const header = 'id,name,email,role,status,createdAt';
  const body = (data ?? [])
    .map((u: any) => [
      u.id,
      String(u.name ?? '').replaceAll(',', ' '),
      u.email,
      String(u.role),
      String(u.status),
      new Date(u.created_at).toISOString(),
    ].join(','))
    .join('\n');

  const csv = `${header}\n${body}`;
  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="users_selected.csv"',
    },
  });
}
