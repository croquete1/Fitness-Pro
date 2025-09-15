import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Check = {
  id: string;
  label: string;
  ok: boolean;
  info?: unknown;
  error?: string;
};

export async function GET(): Promise<Response> {
  const results: Check[] = [];
  const push = (c: Check) => results.push(c);

  // 1) API viva
  push({ id: 'api', label: 'API em execução', ok: true, info: { ts: new Date().toISOString() } });

  // 2) Ligação à BD (ping simples a uma tabela consistente, p.ex. profiles)
  try {
    const sb = createServerClient();
    const { error } = await sb.from('profiles').select('id', { count: 'exact', head: true });
    push({
      id: 'db',
      label: 'Ligação à Base de Dados',
      ok: !error,
      info: error ? undefined : 'OK',
      error: error?.message,
    });
  } catch (e: any) {
    push({ id: 'db', label: 'Ligação à Base de Dados', ok: false, error: String(e) });
  }

  // 3) Storage (opcional: tenta listar um bucket público, ignora se não tiveres storage)
  try {
    const sb = createServerClient();
    // isto só valida autenticação/SDK; sem permissões de bucket não deve falhar o health:
    await sb.auth.getUser();
    push({ id: 'auth', label: 'Auth Supabase', ok: true });
  } catch (e: any) {
    push({ id: 'auth', label: 'Auth Supabase', ok: false, error: String(e) });
  }

  const allOk = results.every(r => r.ok);
  return NextResponse.json({ ok: allOk, checks: results }, { status: allOk ? 200 : 503 });
}
