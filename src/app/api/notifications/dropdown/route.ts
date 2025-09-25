import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const sb = createServerClient();
  try {
    const { data: { user } } = await sb.auth.getUser();
    const uid = user?.id ?? null;

    // mostra notificações ativas dirigidas ao utilizador OU broadcast (user_id null)
    const { data, error } = await sb
      .from('notifications')
      .select('id, title, body, user_id, created_at')
      .eq('active', true)
      .or(`user_id.is.null, user_id.eq.${uid}`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    const items = (data ?? []).map(n => ({ id: String(n.id), title: n.title, href: undefined }));
    return Response.json({ items });
  } catch {
    return Response.json({ items: [] });
  }
}
