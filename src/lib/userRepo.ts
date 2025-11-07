// src/lib/userRepo.ts
import { createServerClient } from '@/lib/supabaseServer';
import type { SupabaseClient } from '@supabase/supabase-js';

type Client = SupabaseClient;

export type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  status: string | null;
  approved: boolean | null;
  active: boolean | null;
  created_at: string | null;
  updated_at?: string | null;
  last_sign_in_at?: string | null;
  avatar_url?: string | null;
  username?: string | null;
  phone?: string | null;
};

type Options = { client?: Client; withProfile?: boolean };

function getClient(opts?: Options): Client {
  return opts?.client ?? createServerClient();
}

function mergeUserProfile(user: any, profile: any | null): UserRecord {
  const merged = {
    ...(profile ?? {}),
    ...(user ?? {}),
  } as Record<string, any>;

  return {
    id: String(merged.id),
    email: String(merged.email ?? ''),
    name: merged.name ?? merged.full_name ?? null,
    role: merged.role ?? merged.user_role ?? null,
    status: merged.status ?? merged.state ?? null,
    approved: merged.approved ?? merged.is_approved ?? null,
    active: merged.active ?? merged.is_active ?? null,
    created_at: merged.created_at ?? merged.inserted_at ?? null,
    updated_at: merged.updated_at ?? merged.modified_at ?? null,
    last_sign_in_at: merged.last_sign_in_at ?? merged.last_signin_at ?? merged.last_login_at ?? null,
    avatar_url: merged.avatar_url ?? null,
    username: merged.username ?? null,
    phone: merged.phone ?? null,
  };
}

export async function fetchUserById(id: string, opts?: Options): Promise<UserRecord | null> {
  const client = getClient(opts);
  const { data: user, error } = await client.from('users').select('*').eq('id', id).maybeSingle();
  if (error || !user) return null;
  if (opts?.withProfile) {
    const { data: profile } = await client.from('profiles').select('*').eq('id', id).maybeSingle();
    return mergeUserProfile(user, profile ?? null);
  }
  return mergeUserProfile(user, null);
}

export async function getUserRole(id: string, opts?: Options): Promise<string | null> {
  const client = getClient(opts);
  const { data } = await client.from('users').select('role').eq('id', id).maybeSingle();
  return (data?.role as string | null) ?? null;
}

export async function countUsersByRole(role: string, opts?: Options): Promise<number> {
  const client = getClient(opts);
  const { count } = await client
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', role);
  return count ?? 0;
}

export async function countPendingUsers(opts?: Options): Promise<number> {
  const client = getClient(opts);
  const { count } = await client
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING');
  return count ?? 0;
}

export async function countNewUsersSince(date: string, opts?: Options): Promise<number> {
  const client = getClient(opts);
  const { count } = await client
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', date);
  return count ?? 0;
}

export async function countNewUsersBetween(start: string, end: string, opts?: Options): Promise<number> {
  const client = getClient(opts);
  const { count } = await client
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start)
    .lt('created_at', end);
  return count ?? 0;
}

export async function listSignupsSince(date: string, opts?: Options): Promise<Array<{ id: string; created_at: string }>> {
  const client = getClient(opts);
  const { data } = await client
    .from('users')
    .select('id, created_at')
    .gte('created_at', date)
    .order('created_at', { ascending: true });
  return (data ?? []).map((row) => ({ id: String(row.id), created_at: String(row.created_at) }));
}
