// src/lib/stats.ts
import { unstable_cache } from 'next/cache';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, type AppRole } from '@/lib/roles';
import { dirAndPct } from './metrics';
import { TAG } from './cache-tags';

type SB = ReturnType<typeof createServerClient>;

async function safeCount(sb: SB, table: string, build?: (q: any) => any) {
  try {
    let q = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count, error } = await q;
    if (error) return 0;
    return count ?? 0;
  } catch { return 0; }
}

async function countRole(sb: SB, role: AppRole) {
  if (role === 'PT') {
    let c = await safeCount(sb, 'users',    (q: any) => q.in('role', ['PT','TRAINER']));
    if (c > 0) return c;
    return await safeCount(sb, 'profiles',  (q: any) => q.in('role', ['PT','TRAINER']));
  }
  let c = await safeCount(sb, 'users',    (q: any) => q.eq('role', role));
  if (c > 0) return c;
  return await safeCount(sb, 'profiles',  (q: any) => q.eq('role', role));
}

/* ========================= ADMIN ========================= */

export const getAdminDashboardStats = unstable_cache(
  async (userId: string) => {
    const sb = createServerClient();
    const now = new Date();
    const startToday = new Date(now); startToday.setHours(0,0,0,0);
    const startYesterday = new Date(startToday); startYesterday.setDate(startYesterday.getDate() - 1);
    const endYesterday = new Date(startToday);

    const in7 = new Date(now); in7.setDate(now.getDate() + 7);
    const prev7Start = new Date(now); prev7Start.setDate(prev7Start.getDate() - 7);
    const prev7PrevStart = new Date(now); prev7PrevStart.setDate(prev7PrevStart.getDate() - 14);

    const [clients, trainers, sessions7d, unreadNotifs, pending, newToday] = await Promise.all([
      countRole(sb, 'CLIENT'),
      countRole(sb, 'PT'),
      safeCount(sb, 'sessions', (q: any) => q.gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
      safeCount(sb, 'notifications', (q: any) => q.eq('user_id', userId).eq('read', false)),
      (async () => {
        let c = await safeCount(sb, 'users', (q: any) => q.eq('approved', false));
        if (c === 0) c = await safeCount(sb, 'users', (q: any) => q.eq('status', 'PENDING'));
        if (c === 0) c = await safeCount(sb, 'profiles', (q: any) => q.eq('approved', false));
        return c;
      })(),
      (async () => {
        let c = await safeCount(sb, 'users', (q: any) => q.gte('created_at', startToday.toISOString()));
        if (c === 0) c = await safeCount(sb, 'profiles', (q: any) => q.gte('created_at', startToday.toISOString()));
        return c;
      })(),
    ]);

    const [sessionsPrev7, newYesterday] = await Promise.all([
      safeCount(sb, 'sessions', (q: any) => q.gte('scheduled_at', prev7PrevStart.toISOString()).lt('scheduled_at', prev7Start.toISOString())),
      (async () => {
        let c = await safeCount(sb, 'users', (q: any) => q.gte('created_at', startYesterday.toISOString()).lt('created_at', endYesterday.toISOString()));
        if (c === 0) c = await safeCount(sb, 'profiles', (q: any) => q.gte('created_at', startYesterday.toISOString()).lt('created_at', endYesterday.toISOString()));
        return c;
      })(),
    ]);

    const sessionsTrend = dirAndPct(sessions7d, sessionsPrev7);
    const newTodayTrend = dirAndPct(newToday, newYesterday);

    // Série inscrições 14d (users/profiles fallback)
    const since14d = new Date(now); since14d.setDate(now.getDate() - 13); since14d.setHours(0,0,0,0);
    const { data: regUsers } = await sb.from('users').select('id, created_at').gte('created_at', since14d.toISOString());
    const { data: regProf }  = regUsers?.length ? { data: null } : await sb.from('profiles').select('id, created_at').gte('created_at', since14d.toISOString());
    const regRows = (regUsers ?? regProf ?? []) as any[];
    const perDay = new Array<number>(14).fill(0);
    regRows.forEach((u: any) => {
      const d = new Date(u.created_at); d.setHours(0,0,0,0);
      const idx = Math.round((+d - +since14d) / 86400000);
      if (idx >= 0 && idx < 14) perDay[idx] += 1;
    });

    // Sessões/semana por PT (MV → fallback direto)
    let weekRows: Array<{ id: string; name: string; count: number }> = [];
    try {
      const { data: mv } = await sb
        .from('mv_sessions_next7_by_trainer' as any)
        .select('trainer_id, day_date, total');
      const map = new Map<string, number>();
      (mv ?? []).forEach((r: any) => {
        if (!r.trainer_id) return;
        map.set(r.trainer_id, (map.get(r.trainer_id) || 0) + (r.total ?? 0));
      });
      const ids = Array.from(map.keys());
      let nameMap = new Map<string, string>();
      if (ids.length) {
        const { data: u } = await sb.from('users').select('id,name,email').in('id', ids);
        nameMap = new Map((u ?? []).map((x: any) => [x.id, x.name ?? x.email ?? x.id]));
      }
      weekRows = Array.from(map.entries())
        .map(([id, c]) => ({ id, name: nameMap.get(id) ?? id, count: c }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    } catch {
      const startToday = new Date(now); startToday.setHours(0,0,0,0);
      const { data: rawWeek } = await sb
        .from('sessions')
        .select('id,trainer_id,scheduled_at')
        .gte('scheduled_at', startToday.toISOString())
        .lt('scheduled_at', in7.toISOString());
      const byPT = new Map<string, number>();
      (rawWeek ?? []).forEach((s: any) => {
        if (!s.trainer_id) return;
        byPT.set(s.trainer_id, (byPT.get(s.trainer_id) || 0) + 1);
      });
      const trainerIds = Array.from(byPT.keys());
      let trainerNames = new Map<string, string>();
      if (trainerIds.length) {
        const { data: trows } = await sb.from('users').select('id,name,email').in('id', trainerIds);
        trainerNames = new Map((trows ?? []).map((u: any) => [u.id, u.name ?? u.email ?? u.id]));
      }
      weekRows = Array.from(byPT.entries())
        .map(([id, c]) => ({ id, name: trainerNames.get(id) ?? id, count: c }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    }

    return {
      clients, trainers, sessions7d, unreadNotifs, pending, newToday,
      sessionsTrend, newTodayTrend, perDay, weekRows,
    };
  },
  // cache key por utilizador
  ['admin-stats'],
  { revalidate: 60, tags: [TAG.METRICS, TAG.SESSIONS, TAG.USERS, TAG.PROFILES, TAG.SIGNUPS, TAG.NOTIFICATIONS] }
);

/* ========================= PT ========================= */

export const getPtDashboardStats = unstable_cache(
  async (userId: string) => {
    const sb = createServerClient();
    const now = new Date();
    const startToday = new Date(now); startToday.setHours(0,0,0,0);
    const startYesterday = new Date(startToday); startYesterday.setDate(startYesterday.getDate() - 1);
    const endYesterday = new Date(startToday);
    const in7 = new Date(now); in7.setDate(now.getDate() + 7);
    const prev7Start = new Date(now); prev7Start.setDate(prev7Start.getDate() - 7);
    const prev7PrevStart = new Date(now); prev7PrevStart.setDate(prev7PrevStart.getDate() - 14);

    const [sessionsToday, sessions7d, unread, myClients, sessionsYesterday, sessionsPrev7] = await Promise.all([
      safeCount(sb, 'sessions', (q: any) => q.eq('trainer_id', userId).gte('scheduled_at', startToday.toISOString()).lt('scheduled_at', in7.toISOString())),
      safeCount(sb, 'sessions', (q: any) => q.eq('trainer_id', userId).gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
      safeCount(sb, 'notifications', (q: any) => q.eq('user_id', userId).eq('read', false)),
      (async () => {
        const { data } = await sb.from('sessions').select('client_id').eq('trainer_id', userId).gte('scheduled_at', startToday.toISOString());
        const s = new Set((data ?? []).map((r: any) => r.client_id).filter(Boolean));
        return s.size;
      })(),
      safeCount(sb, 'sessions', (q: any) => q.eq('trainer_id', userId).gte('scheduled_at', startYesterday.toISOString()).lt('scheduled_at', endYesterday.toISOString())),
      safeCount(sb, 'sessions', (q: any) => q.eq('trainer_id', userId).gte('scheduled_at', prev7PrevStart.toISOString()).lt('scheduled_at', prev7Start.toISOString())),
    ]);

    const todayTrend = dirAndPct(sessionsToday, sessionsYesterday);
    const weekTrend = dirAndPct(sessions7d, sessionsPrev7);

    const { data: rows } = await sb
      .from('sessions')
      .select('scheduled_at')
      .eq('trainer_id', userId)
      .gte('scheduled_at', startToday.toISOString())
      .lt('scheduled_at', in7.toISOString());

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startToday); d.setDate(d.getDate() + i);
      return Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit' }).format(d);
    });
    const counts = new Array<number>(7).fill(0);
    (rows ?? []).forEach((r: any) => {
      const d = new Date(r.scheduled_at); d.setHours(0,0,0,0);
      const idx = Math.round((+d - +startToday) / 86400000);
      if (idx >= 0 && idx < 7) counts[idx] += 1;
    });

    return { sessionsToday, sessions7d, unread, myClients, todayTrend, weekTrend, days, counts };
  },
  ['pt-stats'],
  { revalidate: 60, tags: [TAG.METRICS, TAG.SESSIONS, TAG.NOTIFICATIONS] }
);

/* ========================= CLIENT ========================= */

export const getClientDashboardStats = unstable_cache(
  async (userId: string) => {
    const sb = createServerClient();
    const now = new Date();
    const in7 = new Date(now); in7.setDate(now.getDate() + 7);
    const prev7Start = new Date(now); prev7Start.setDate(prev7Start.getDate() - 7);
    const prev7PrevStart = new Date(now); prev7PrevStart.setDate(prev7PrevStart.getDate() - 14);

    const [myPlans, myUpcoming, unread, myPrev7] = await Promise.all([
      safeCount(sb, 'training_plans', (q: any) => q.eq('client_id', userId)),
      safeCount(sb, 'sessions', (q: any) => q.eq('client_id', userId).gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
      safeCount(sb, 'notifications', (q: any) => q.eq('user_id', userId).eq('read', false)),
      safeCount(sb, 'sessions', (q: any) => q.eq('client_id', userId).gte('scheduled_at', prev7PrevStart.toISOString()).lt('scheduled_at', prev7Start.toISOString())),
    ]);
    const weekTrend = dirAndPct(myUpcoming, myPrev7);

    return { myPlans, myUpcoming, unread, weekTrend };
  },
  ['client-stats'],
  { revalidate: 60, tags: [TAG.METRICS, TAG.SESSIONS, TAG.NOTIFICATIONS] }
);
