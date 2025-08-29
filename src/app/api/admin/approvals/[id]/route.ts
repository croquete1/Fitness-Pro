// src/app/api/admin/approvals/[id]/route.ts
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { requireUser } from '@/lib/authz';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

async function approveUser(id: string) {
  const sb = createServerClient();
  // Ajusta o nome da coluna/enum se necessário
  const { data, error } = await sb
    .from('users')
    .update({ status: 'ACTIVE' })
    .eq('id', id)
    .select('id,status')
    .single();

  if (error) throw error;
  return data;
}

// Aceita PATCH (recomendado) e POST (compatibilidade)
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireUser([Role.ADMIN]);
  if ('error' in guard) return guard.error;

  try {
    const data = await approveUser(params.id);
    return NextResponse.json({ ok: true, user: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'update_failed' }, { status: 500 });
  }
}

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  return PATCH(_req, ctx);
}
