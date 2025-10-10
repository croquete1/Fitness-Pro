import * as React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { searchFallbackDataset } from '@/lib/fallback/users';
import SearchClient, { type SearchResults } from './search.client';

export const dynamic = 'force-dynamic';

async function loadSearchResults(query: string): Promise<SearchResults> {
  const term = query.trim();
  if (!term) {
    return { query: '', supabase: false, users: [], sessions: [], approvals: [] };
  }

  const sb = tryCreateServerClient();
  if (!sb) {
    const fallback = searchFallbackDataset(term);
    return { query: term, supabase: false, ...fallback };
  }

  try {
    const usersPromise = sb
      .from('users')
      .select('id,name,email,role')
      .or(`name.ilike.%${term}%,email.ilike.%${term}%,id.ilike.%${term}%`)
      .limit(15);

    const sessionsPromise = sb
      .from('sessions')
      .select(
        'id,start_time,location,trainer:trainer_id(id,name,email),client:client_id(id,name,email)',
      )
      .or(
        `location.ilike.%${term}%,trainer_id.ilike.%${term}%,client_id.ilike.%${term}%,` +
          `trainer.name.ilike.%${term}%,trainer.email.ilike.%${term}%,client.name.ilike.%${term}%,client.email.ilike.%${term}%`,
      )
      .limit(12);

    const approvalsPromise = sb
      .from('approvals')
      .select('id,name,email,status,user_id')
      .or(`name.ilike.%${term}%,email.ilike.%${term}%,user_id.ilike.%${term}%`)
      .limit(10);

    const [{ data: usersData }, { data: sessionsData }, { data: approvalsData }] = await Promise.all([
      usersPromise,
      sessionsPromise,
      approvalsPromise,
    ]);

    return {
      query: term,
      supabase: true,
      users:
        usersData?.map((row: any) => ({
          id: String(row.id),
          name: row.name ?? row.email ?? String(row.id),
          role: row.role ?? 'CLIENT',
          email: row.email ?? null,
        })) ?? [],
      sessions:
        sessionsData?.map((row: any) => ({
          id: String(row.id),
          when: row.start_time ?? null,
          trainer: row.trainer?.name ?? row.trainer?.email ?? String(row.trainer_id ?? ''),
          client: row.client?.name ?? row.client?.email ?? String(row.client_id ?? ''),
          location: row.location ?? null,
        })) ?? [],
      approvals:
        approvalsData?.map((row: any) => ({
          id: String(row.id),
          name: row.name ?? null,
          email: row.email ?? null,
          status: row.status ?? 'pending',
        })) ?? [],
    };
  } catch (error) {
    console.warn('[search] supabase query failed — fallback enabled');
    const fallback = searchFallbackDataset(term);
    return { query: term, supabase: false, ...fallback };
  }
}

export default async function SearchPage({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  const session = await getSessionUserSafe();
  if (!session?.id) {
    redirect(`/login?next=${encodeURIComponent('/dashboard/search')}`);
  }

  const qRaw = searchParams?.q;
  const query = Array.isArray(qRaw) ? qRaw[0] ?? '' : qRaw ?? '';
  const results = await loadSearchResults(query);

  return <SearchClient initialQuery={query} results={results} />;
}
