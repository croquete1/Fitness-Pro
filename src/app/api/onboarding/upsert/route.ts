// src/app/api/onboarding/upsert/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const s = await getSessionUserSafe();
  if (!s?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const payload = {
    user_id: s.user.id,
    status: body.status === 'submitted' ? 'submitted' : 'draft',
    goals: body.goals ?? null,
    injuries: body.injuries ?? null,
    medical: body.medical ?? null,
    activity_level: body.activity_level ?? null,
    experience: body.experience ?? null,
    availability: body.availability ?? null,
    updated_at: new Date().toISOString(),
  };

  const sb = createServerClient();

  // upsert por user_id
  const { error } = await sb
    .from('onboarding_forms')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Notificação (ignorar se falhar)
  const { error: _nerr } = await sb.from('notifications').insert({
    user_id: s.user.id,
    title: 'Onboarding atualizado',
    body: payload.status === 'submitted' ? 'O cliente submeteu a avaliação.' : 'Rascunho guardado.',
    href: '/dashboard/admin/onboarding',
    read: false,
  });

  // (_nerr é ignorado de propósito)

  return NextResponse.json({ ok: true });
}
