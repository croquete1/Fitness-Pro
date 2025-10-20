export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, isAdmin } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import AdminOnboardingReviewClient from '@/components/onboarding/AdminOnboardingReviewClient';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSessionUserSafe();
  if (!s?.user?.id) redirect('/login');
  if (!isAdmin(toAppRole(s.user.role) ?? 'CLIENT')) redirect('/dashboard');

  const sb = createServerClient();

  const { data: form } = await sb
    .from('onboarding_forms')
    .select('*, profiles(name), users(email)')
    .eq('id', id)
    .maybeSingle();

  // Nota: o join do PostgREST pode devolver `profiles` como array; normalizamos p/ objeto { name }
  const { data: notesRaw } = await sb
    .from('onboarding_notes')
    .select(
      'id,visibility,content,created_at,author_id,profiles:profiles!onboarding_notes_author_id_fkey(name)'
    )
    .eq('onboarding_id', id)
    .order('created_at', { ascending: false });

  const notes = (notesRaw ?? []).map((n: any) => ({
    id: n.id as string,
    visibility: n.visibility as 'private' | 'shared',
    content: n.content as string,
    created_at: n.created_at as string,
    author_id: n.author_id as string,
    profiles: Array.isArray(n.profiles)
      ? { name: n.profiles[0]?.name ?? null }
      : (n.profiles ?? null),
  }));

  const viewerName = s?.name ?? s?.user?.name ?? null;

  return <AdminOnboardingReviewClient form={form ?? null} notes={notes} viewerName={viewerName} />;
}
