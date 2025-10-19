import * as React from 'react';
import { notFound } from 'next/navigation';

import { createServerClient } from '@/lib/supabaseServer';
import PlanFormClient, { mapRow } from '../PlanFormClient';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServerClient();

  let row: any | null = null;
  const a = await sb.from('plans').select('*').eq('id', id).maybeSingle();
  if (a.data) row = a.data;
  else {
    const b = await sb.from('programs').select('*').eq('id', id).maybeSingle();
    if (b.data) row = b.data;
  }
  if (!row) return notFound();

  return (
    <div className="admin-plan-form-page">
      <PlanFormClient mode="edit" initial={mapRow(row)} />
    </div>
  );
}
