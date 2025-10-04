import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

const Body = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  if (!url || !service) {
    return NextResponse.json({ error: 'Missing service role key' }, { status: 500 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: parsed.data.email,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // opcionalmente podes enviar o link por email; aqui apenas devolvemos
  return NextResponse.json({ ok: true, link: data.properties?.action_link ?? null });
}
