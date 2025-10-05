import * as React from 'react';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import AdminExerciseFormClient from '../AdminExerciseFormClient';

export const dynamic = 'force-dynamic';

function mapRow(u: any) {
  return {
    id: String(u.id),
    name: u.name ?? '',
    muscle_group: u.muscle_group ?? u.group ?? null,
    equipment: u.equipment ?? null,
    difficulty: u.difficulty ?? null,
    description: u.description ?? u.instructions ?? null,
    video_url: u.video_url ?? u.video ?? null,
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data, error } = await sb.from('exercises').select('*').eq('id', params.id).single();

  if (error || !data) return notFound();

  const initial = mapRow(data);
  return <AdminExerciseFormClient mode="edit" initial={initial} />;
}
