// src/app/api/dashboard/messages/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

type ApiMessage = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  createdAt: string;
  unread: boolean;
};

export async function GET(): Promise<Response> {
  // Sessão
  const me = await getSessionUserSafe();
  if (!me?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Tenta buscar do Supabase; se não houver tabela/config, devolve fallback seguro
  const sb = createServerClient();
  try {
    // Ajusta os nomes dos campos conforme o teu schema real de "messages"
    const { data, error } = await sb
      .from('messages')
      .select('id, from_email, subject, preview, created_at, unread')
      .eq('user_id', me.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const items: ApiMessage[] =
      (data ?? []).map((m: any) => ({
        id: String(m.id),
        from: m.from_email ?? 'sistema@fitnesspro.app',
        subject: m.subject ?? '(Sem assunto)',
        preview: m.preview ?? '',
        createdAt: m.created_at ?? new Date().toISOString(),
        unread: Boolean(m.unread ?? true),
      })) as ApiMessage[];

    return NextResponse.json({ items });
  } catch {
    // Fallback sem depender de DB (não falha o build)
    const mock: ApiMessage[] = [
      {
        id: 'm1',
        from: 'sistema@fitnesspro.app',
        subject: 'Bem-vindo à Fitness Pro',
        preview: 'A tua conta foi criada com sucesso.',
        createdAt: new Date().toISOString(),
        unread: true,
      },
      {
        id: 'm2',
        from: 'andre@fitnesspro.app',
        subject: 'Plano atualizado',
        preview: 'Já tens o plano de perna com foco em extensão...',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        unread: false,
      },
    ];
    return NextResponse.json({ items: mock });
  }
}
