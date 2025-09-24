import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  const sb = createServerClient();

  const form = await req.formData();
  const clientId = String(form.get('clientId') || '');
  const title = String(form.get('title') || '').trim();

  if (!clientId || !title) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }
  // opcional: obter user atual como trainerId
  const { data: { user } } = await sb.auth.getUser();
  const trainerId = user?.id ?? null;

  const { error } = await sb.from('plans').insert({
    client_id: clientId,
    trainer_id: trainerId,
    title,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  // redireciona para listagem de planos do PT (ajusta rota conforme o teu projeto)
  return NextResponse.redirect(new URL('/dashboard/pt', req.url));
}
