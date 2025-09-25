import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const sb = createServerClient();
  try {
    const { data, error } = await sb.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch {
    // fallback seguro
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const b = await req.json().catch(()=>({}));
  const title = String(b.title || '').trim();
  const body = b.body ? String(b.body) : null;
  if (!title) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 });

  try {
    const { error } = await sb.from('notifications').insert({ title, body, user_id: null, active: true });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'Falha ao criar' }, { status: 400 });
  }
}
