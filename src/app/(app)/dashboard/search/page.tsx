import * as React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { searchFallbackDataset } from '@/lib/fallback/users';
import { toAppRole, type AppRole } from '@/lib/roles';
import SearchClient, { type SearchPermissions, type SearchResults } from './search.client';

export const dynamic = 'force-dynamic';

function permissionsForRole(role: AppRole | null): SearchPermissions {
  if (role === 'ADMIN') {
    return { users: true, sessions: true, approvals: true };
  }
  if (role === 'PT') {
    return { users: true, sessions: true, approvals: false };
  }
  if (role === 'CLIENT') {
    return { users: false, sessions: true, approvals: false };
  }
  return { users: false, sessions: false, approvals: false };
}

function matchesSessionRow(row: any, term: string) {
  const query = term.toLowerCase();
  const tokens: Array<string> = [];
  if (row.id) tokens.push(String(row.id));
  if (row.location) tokens.push(String(row.location));
  if (row.trainer?.name) tokens.push(String(row.trainer.name));
  if (row.trainer?.email) tokens.push(String(row.trainer.email));
  if (row.client?.name) tokens.push(String(row.client.name));
  if (row.client?.email) tokens.push(String(row.client.email));
  return tokens.some((value) => value.toLowerCase().includes(query));
}

async function loadSearchResults(
  query: string,
  context: { userId: string; role: AppRole | null },
): Promise<SearchResults> {
  const term = query.trim();
  const permissions = permissionsForRole(context.role);
  if (!term) {
    return { query: '', supabase: false, permissions, users: [], sessions: [], approvals: [] };
  }

  const sb = tryCreateServerClient();
  if (!sb) {
    const fallback = searchFallbackDataset(term);
    return {
      query: term,
      supabase: false,
      permissions,
      users: permissions.users ? fallback.users : [],
      sessions: permissions.sessions ? fallback.sessions : [],
      approvals: permissions.approvals ? fallback.approvals : [],
    };
  }

  try {
    const [usersData, sessionsData, approvalsData] = await Promise.all([
      permissions.users
        ? sb
            .from('users')
            .select('id,name,email,role')
            .or(`name.ilike.%${term}%,email.ilike.%${term}%,id.ilike.%${term}%`)
            .limit(15)
            .then((res) => res.data ?? [])
        : Promise.resolve([]),
      permissions.sessions
        ? (async () => {
            if (context.role === 'ADMIN') {
              const { data } = await sb
                .from('sessions')
                .select(
                  'id,start_time,location,trainer:trainer_id(id,name,email),client:client_id(id,name,email)',
                )
                .or(
                  `location.ilike.%${term}%,trainer_id.ilike.%${term}%,client_id.ilike.%${term}%,` +
                    `trainer.name.ilike.%${term}%,trainer.email.ilike.%${term}%,client.name.ilike.%${term}%,client.email.ilike.%${term}%`,
                )
                .limit(12);
              return data ?? [];
            }

            const { data } = await sb
              .from('sessions')
              .select(
                'id,start_time,location,trainer:trainer_id(id,name,email),client:client_id(id,name,email)',
              )
              .or(`trainer_id.eq.${context.userId},client_id.eq.${context.userId}`)
              .limit(30);
            const filtered = (data ?? []).filter((row: any) => matchesSessionRow(row, term)).slice(0, 12);
            return filtered;
          })()
        : Promise.resolve([]),
      permissions.approvals
        ? sb
            .from('approvals')
            .select('id,name,email,status,user_id')
            .or(`name.ilike.%${term}%,email.ilike.%${term}%,user_id.ilike.%${term}%`)
            .limit(10)
            .then((res) => res.data ?? [])
        : Promise.resolve([]),
    ]);

    return {
      query: term,
      supabase: true,
      permissions,
      users: (usersData as any[]).map((row) => ({
        id: String(row.id),
        name: row.name ?? row.email ?? String(row.id),
        role: row.role ?? 'CLIENT',
        email: row.email ?? null,
      })),
      sessions: (sessionsData as any[]).map((row) => ({
        id: String(row.id),
        when: row.start_time ?? null,
        trainer: row.trainer?.name ?? row.trainer?.email ?? String(row.trainer_id ?? ''),
        client: row.client?.name ?? row.client?.email ?? String(row.client_id ?? ''),
        location: row.location ?? null,
      })),
      approvals: (approvalsData as any[]).map((row) => ({
        id: String(row.id),
        name: row.name ?? null,
        email: row.email ?? null,
        status: row.status ?? 'pending',
      })),
    };
  } catch (error) {
    console.warn('[search] supabase query failed — fallback enabled');
    const fallback = searchFallbackDataset(term);
    return {
      query: term,
      supabase: false,
      permissions,
      users: permissions.users ? fallback.users : [],
      sessions: permissions.sessions ? fallback.sessions : [],
      approvals: permissions.approvals ? fallback.approvals : [],
    };
  }
}

export default async function SearchPage({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  const session = await getSessionUserSafe();
  if (!session?.id) {
    redirect(`/login?next=${encodeURIComponent('/dashboard/search')}`);
  }

  const qRaw = searchParams?.q;
  const query = Array.isArray(qRaw) ? qRaw[0] ?? '' : qRaw ?? '';
  const role = toAppRole(session.role ?? session.user?.role ?? null);
  const results = await loadSearchResults(query, { userId: session.id, role });

  return <SearchClient initialQuery={query} results={results} />;
}
