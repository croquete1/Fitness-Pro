import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

function validateUsername(u: string) {
  if (!u) return { ok: false, reason: 'Obrigatório' };
  if (u.length < 3 || u.length > 30) return { ok: false, reason: '3–30 caracteres' };
  if (!/^[a-z0-9_]+$/i.test(u)) return { ok: false, reason: 'Apenas letras, números e _' };
  return { ok: true as const };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  const basic = validateUsername(q);
  if (!basic.ok) return NextResponse.json({ available: false, reason: basic.reason });

  const sb = createServerClient();

  // tenta em "profiles.username"; se o teu username estiver em "users", troca a tabela/coluna
  const { data, error } = await sb.from('profiles').select('id').ilike('username', q).limit(1);
  if (error) return NextResponse.json({ available: false, reason: error.message }, { status: 500 });

  return NextResponse.json({ available: (data?.length ?? 0) === 0 });
}
