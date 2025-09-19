// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';

export async function GET(req: NextRequest) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ results: [] }, { status: 401 });

  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json({ results: [] });

  const sb = createServerClient();
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  const uid = session.user.id;

  // monta padrão seguro para ILIKE
  const pattern = `%${q.replace(/[%_]/g, '').toLowerCase()}%`;

  const tasks: Promise<any>[] = [];

  // USERS (apenas admin)
  if (isAdmin(role)) {
    tasks.push(
      (async () => {
        const { data } = await sb
          .from('users')
          .select('id,name,email,role,created_at')
          .or(`name.ilike.${pattern},email.ilike.${pattern}`)
          .order('created_at', { ascending: false })
          .limit(5);

        return {
          type: 'users',
          items: (data ?? []).map((u: any) => ({
            id: u.id,
            title: u.name ?? u.email ?? u.id,
            subtitle: u.role ?? '',
            href: '/dashboard/users?q=' + encodeURIComponent(q),
          })),
        };
      })()
    );
  }

  // PLANS
  if (role === 'CLIENT') {
    tasks.push(
      (async () => {
        const { data } = await sb
          .from('training_plans')
          .select('id,title,updated_at')
          .eq('client_id', uid)
          .ilike('title', pattern)
          .order('updated_at', { ascending: false })
          .limit(5);

        return {
          type: 'plans',
          items: (data ?? []).map((p: any) => ({
            id: p.id,
            title: p.title ?? 'Plano',
            subtitle: p.updated_at ? new Date(p.updated_at).toLocaleString('pt-PT') : '',
            href: '/dashboard/my-plan?q=' + encodeURIComponent(q),
          })),
        };
      })()
    );
  } else if (isPT(role) || isAdmin(role)) {
    tasks.push(
      (async () => {
        const { data } = await sb
          .from('training_plans')
          .select('id,title,updated_at')
          .ilike('title', pattern)
          .order('updated_at', { ascending: false })
          .limit(5);

        return {
          type: 'plans',
          items: (data ?? []).map((p: any) => ({
            id: p.id,
            title: p.title ?? 'Plano',
            subtitle: p.updated_at ? new Date(p.updated_at).toLocaleString('pt-PT') : '',
            href: isPT(role)
              ? '/dashboard/pt/my-plan?q=' + encodeURIComponent(q)
              : '/dashboard/admin/plans?q=' + encodeURIComponent(q),
          })),
        };
      })()
    );
  }

  // SESSIONS
  if (role === 'CLIENT') {
    tasks.push(
      (async () => {
        const { data } = await sb
          .from('sessions')
          .select('id,location,status,scheduled_at')
          .eq('client_id', uid)
          .or(`location.ilike.${pattern},status.ilike.${pattern}`)
          .order('scheduled_at', { ascending: false })
          .limit(5);

        return {
          type: 'sessions',
          items: (data ?? []).map((s: any) => ({
            id: s.id,
            title: s.location ?? 'Sessão',
            subtitle: s.scheduled_at
              ? new Date(s.scheduled_at).toLocaleString('pt-PT')
              : s.status ?? '',
            href: '/dashboard/sessions?q=' + encodeURIComponent(q),
          })),
        };
      })()
    );
  } else if (isPT(role) || isAdmin(role)) {
    tasks.push(
      (async () => {
        let query = sb.from('sessions').select('id,location,status,scheduled_at');
        if (isPT(role)) query = query.eq('trainer_id', uid);

        const { data } = await query
          .or(`location.ilike.${pattern},status.ilike.${pattern}`)
          .order('scheduled_at', { ascending: false })
          .limit(5);

        return {
          type: 'sessions',
          items: (data ?? []).map((s: any) => ({
            id: s.id,
            title: s.location ?? 'Sessão',
            subtitle: s.scheduled_at
              ? new Date(s.scheduled_at).toLocaleString('pt-PT')
              : s.status ?? '',
            href: isPT(role)
              ? '/dashboard/pt/sessions?q=' + encodeURIComponent(q)
              : '/dashboard/history?q=' + encodeURIComponent(q),
          })),
        };
      })()
    );
  }

  // MESSAGES (todas as roles; apenas as do utilizador)
  tasks.push(
    (async () => {
      const { data } = await sb
        .from('messages')
        .select('id,body,sent_at')
        .or(`from_id.eq.${uid},to_id.eq.${uid}`)
        .ilike('body', pattern)
        .order('sent_at', { ascending: false })
        .limit(5);

      return {
        type: 'messages',
        items: (data ?? []).map((m: any) => ({
          id: m.id,
          title: (m.body ?? '').slice(0, 60),
          subtitle: m.sent_at ? new Date(m.sent_at).toLocaleString('pt-PT') : '',
          href: isPT(role)
            ? '/dashboard/pt/messages?q=' + encodeURIComponent(q)
            : '/dashboard/messages?q=' + encodeURIComponent(q),
        })),
      };
    })()
  );

  const results = await Promise.all(tasks);
  return NextResponse.json({ results });
}
