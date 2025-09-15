// src/app/api/notifications/send/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type Body = {
  userId?: string;        // destinatário (opcional: se não vier, envia para o próprio)
  title: string;          // título da notificação
  body?: string | null;   // texto opcional
  url?: string | null;    // URL opcional para deep-link
};

export async function POST(req: Request): Promise<Response> {
  // Sessão “flat”, sem .user
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = toAppRole(me.role) ?? 'CLIENT';

  let payload: Body;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const targetId = (payload.userId && payload.userId.trim()) || me.id;

  // Regra básica de segurança:
  // - CLIENT só pode enviar para si próprio
  // - PT/ADMIN podem enviar para qualquer utilizador
  if (role === 'CLIENT' && targetId !== me.id) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!payload.title || payload.title.trim().length === 0) {
    return NextResponse.json({ ok: false, error: 'title_required' }, { status: 400 });
  }

  const sb = createServerClient();

  try {
    // Guarda a notificação
    const { data, error } = await sb
      .from('notifications')
      .insert({
        user_id: targetId,
        title: payload.title.trim(),
        body: payload.body?.trim() ?? null,
        url: payload.url?.trim() ?? null,
        read: false,
      })
      .select('id')
      .maybeSingle();

    if (error) throw error;

    // (Opcional) Aqui podemos adicionar envio web-push no futuro
    // ex.: ler `push_subscriptions` e enviar via webpush

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'insert_failed' },
      { status: 500 }
    );
  }
}
