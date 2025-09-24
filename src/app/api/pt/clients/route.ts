// src/app/api/pt/clients/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';

export async function GET() {
  const session = await getServerSession(authOptions);
  const me = session?.user;
  if (!me?.id) return NextResponse.json({ ok: false, error: 'UNAUTH' }, { status: 401 });

  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const sb = createServerClient();

  // Estratégia robusta: procurar clientes atribuídos ao PT
  const ids = new Set<string>();

  // 1) Por planos (preferido)
  try {
    const { data } = await sb
      .from('training_plans' as any)
      .select('client_id')
      .eq('trainer_id', me.id);
    (data ?? []).forEach((r: any) => r?.client_id && ids.add(r.client_id));
  } catch {}

  // 2) Por sessões (fallback)
  if (!ids.size) {
    try {
      const { data } = await sb
        .from('sessions' as any)
        .select('client_id')
        .eq('trainer_id', me.id);
      (data ?? []).forEach((r: any) => r?.client_id && ids.add(r.client_id));
    } catch {}
  }

  if (!ids.size) return NextResponse.json({ ok: true, clients: [] });

  // Tentar obter nome/email dos clientes
  // 1) tabela users
  const list: { id: string; label: string; email?: string }[] = [];
  try {
    const { data } = await sb.from('users').select('id,name,email').in('id', Array.from(ids));
    (data ?? []).forEach((u: any) =>
      list.push({ id: u.id, label: u.name ?? u.email ?? u.id, email: u.email ?? undefined })
    );
  } catch {}

  // 2) completar com profiles (caso faltem nomes)
  const missing = Array.from(ids).filter((id) => !list.some((i) => i.id === id));
  if (missing.length) {
    try {
      const { data } = await sb.from('profiles').select('id,name').in('id', missing);
      (data ?? []).forEach((p: any) =>
        list.push({ id: p.id, label: p.name ?? p.id })
      );
    } catch {}
  }

  // Ordenar alfabeticamente
  list.sort((a, b) => a.label.localeCompare(b.label, 'pt'));

  return NextResponse.json({ ok: true, clients: list });
}
