import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Item = {
  id: string;
  type: 'user'|'client'|'trainer'|'exercise'|'plan'|'session'|'trainer_info';
  title: string;
  subtitle?: string | null;
  href?: string;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || '8');
  if (!q) return NextResponse.json({ items: [] });

  const sb = createServerClient();

  // sessão + role
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ items: [] }, { status: 200 });

  let role: string = 'CLIENT';
  let assignedTrainerId: string | null = null;

  // tenta profiles primeiro
  try {
    const prof = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
    role = String((prof.data as any)?.role ?? role).toUpperCase();
  } catch {}
  // fallback users (tabela principal do teu schema)
  try {
    const u = await sb.from('users' as any).select('role, assigned_trainer_id').eq('id', user.id).maybeSingle();
    role = String((u.data as any)?.role ?? role).toUpperCase();
    assignedTrainerId = (u.data as any)?.assigned_trainer_id ?? assignedTrainerId;
  } catch {}

  const items: Item[] = [];
  const like = `%${q}%`;

  async function pushSafe<T>(fn: () => Promise<T | null> | T | null, map: (row: any) => Item) {
    try {
      const res: any = await fn();
      const arr = res?.data ?? res ?? [];
      if (Array.isArray(arr)) {
        for (const r of arr) items.push(map(r));
      }
    } catch {/* ignora */}
  }

  if (role === 'ADMIN') {
    // USERS
    await pushSafe(
      () => sb.from('users' as any)
        .select('id, name, email, role, status')
        .or(`name.ilike.${like},email.ilike.${like}`)
        .limit(limit),
      (r) => ({
        id: String(r.id),
        type: 'user',
        title: r.name ?? r.email ?? 'Utilizador',
        subtitle: `${r.role ?? ''}${r.status ? ` • ${r.status}` : ''}`,
        href: `/dashboard/admin/users?q=${encodeURIComponent(q)}`
      })
    );
    // EXERCISES
    await pushSafe(
      () => sb.from('exercises' as any)
        .select('id, name, bodypart')
        .or(`name.ilike.${like},bodypart.ilike.${like}`)
        .limit(limit),
      (r) => ({
        id: String(r.id),
        type: 'exercise',
        title: r.name ?? 'Exercício',
        subtitle: r.bodypart ?? null,
        href: `/dashboard/admin/exercises?q=${encodeURIComponent(q)}`
      })
    );
    // PLANS
    await pushSafe(
      () => sb.from('plans' as any)
        .select('id, title, created_by')
        .or(`title.ilike.${like}`)
        .limit(limit),
      (r) => ({
        id: String(r.id),
        type: 'plan',
        title: r.title ?? 'Plano',
        subtitle: r.created_by ? `autor: ${r.created_by}` : null,
        href: `/dashboard/admin/plans?q=${encodeURIComponent(q)}`
      })
    );
    // SESSIONS
    await pushSafe(
      () => sb.from('sessions' as any)
        .select('id, title, kind, status')
        .or(`title.ilike.${like},kind.ilike.${like},status.ilike.${like}`)
        .limit(limit),
      (r) => ({
        id: String(r.id),
        type: 'session',
        title: r.title ?? 'Sessão',
        subtitle: [r.kind, r.status].filter(Boolean).join(' • ') || null,
        href: `/dashboard/admin/pts-schedule?q=${encodeURIComponent(q)}`
      })
    );
  }

  if (role === 'TRAINER') {
    // CLIENTES atribuídos
    await pushSafe(
      () => sb.from('users' as any)
        .select('id, name, email')
        .eq('role', 'CLIENT')
        .eq('assigned_trainer_id', user.id)
        .or(`name.ilike.${like},email.ilike.${like}`)
        .limit(limit),
      (r) => ({
        id: String(r.id),
        type: 'client',
        title: r.name ?? r.email ?? 'Cliente',
        subtitle: r.email ?? null,
        href: `/dashboard/pt/clients?q=${encodeURIComponent(q)}`
      })
    );
    // EXERCISES criados por si
    await pushSafe(
      () => sb.from('exercises' as any)
        .select('id, name, bodypart, created_by')
        .eq('created_by', user.id)
        .or(`name.ilike.${like},bodypart.ilike.${like}`)
        .limit(limit),
      (r) => ({
        id: String(r.id),
        type: 'exercise',
        title: r.name ?? 'Exercício',
        subtitle: r.bodypart ?? null,
        href: `/dashboard/admin/exercises?q=${encodeURIComponent(q)}`
      })
    );
    // PLANS criados por si
    await pushSafe(
      () => sb.from('plans' as any)
        .select('id, title, created_by')
        .eq('created_by', user.id)
        .or(`title.ilike.${like}`)
        .limit(limit),
      (r) => ({
        id: String(r.id),
        type: 'plan',
        title: r.title ?? 'Plano',
        subtitle: 'meu',
        href: `/dashboard/pt/my-plan?q=${encodeURIComponent(q)}`
      })
    );
    // SESSIONS do PT
    await pushSafe(
      () => sb.from('sessions' as any)
        .select('id, title, kind, status')
        .eq('trainer_id', user.id)
        .or(`title.ilike.${like},kind.ilike.${like},status.ilike.${like}`)
        .limit(limit),
      (r) => ({
        id: String(r.id),
        type: 'session',
        title: r.title ?? 'Sessão',
        subtitle: [r.kind, r.status].filter(Boolean).join(' • ') || null,
        href: `/dashboard/pt/sessions?q=${encodeURIComponent(q)}`
      })
    );
  }

  if (role === 'CLIENT') {
    // obter sessão/planos do próprio
    let mySessionIds: string[] = [];
    await pushSafe(
      () => sb.from('sessions' as any).select('id, title, kind, status, trainer_id')
        .eq('client_id', user.id)
        .or(`title.ilike.${like},kind.ilike.${like},status.ilike.${like}`)
        .limit(limit),
      (r) => ({
        id: String(r.id),
        type: 'session',
        title: r.title ?? 'Sessão',
        subtitle: [r.kind, r.status].filter(Boolean).join(' • ') || null,
        href: `/dashboard/sessions?q=${encodeURIComponent(q)}`
      })
    );
    try {
      const ses = await sb.from('sessions' as any).select('id').eq('client_id', user.id).limit(200);
      if (!ses.error && Array.isArray(ses.data)) mySessionIds = ses.data.map((x: any) => String(x.id));
    } catch {}
    // exercícios do plano do cliente (via session_exercises)
    if (mySessionIds.length > 0) {
      await pushSafe(
        () => sb.from('session_exercises' as any)
          .select('exercise_id, exercises!inner(id, name, bodypart)')
          .in('session_id', mySessionIds)
          .limit(200),
        (r) => ({
          id: String(r.exercises?.id ?? r.exercise_id),
          type: 'exercise',
          title: r.exercises?.name ?? 'Exercício',
          subtitle: r.exercises?.bodypart ?? null,
          href: `/dashboard/my-plan?q=${encodeURIComponent(q)}`
        })
      );
    }
    // planos do cliente
    await pushSafe(
      () => sb.from('plans' as any)
        .select('id, title, client_id')
        .eq('client_id', user.id)
        .or(`title.ilike.${like}`)
        .limit(limit),
      (r) => ({
        id: String(r.id),
        type: 'plan',
        title: r.title ?? 'Plano',
        subtitle: 'meu plano',
        href: `/dashboard/my-plan?q=${encodeURIComponent(q)}`
      })
    );
    // info do PT atribuído
    if (assignedTrainerId) {
      await pushSafe(
        () => sb.from('users' as any)
          .select('id, name, email')
          .eq('id', assignedTrainerId)
          .limit(1),
        (r) => ({
          id: String(r.id),
          type: 'trainer_info',
          title: r.name ?? r.email ?? 'PT',
          subtitle: r.email ?? null,
          href: `/dashboard/profile?q=${encodeURIComponent(q)}`
        })
      );
    }
  }

  // limitar total enviado (defensivo)
  return NextResponse.json({ items: items.slice(0, 60) });
}
