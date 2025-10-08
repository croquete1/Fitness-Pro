import * as React from 'react';
import AdminPtsScheduleClient from './AdminPtsScheduleClient';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // (se quiseres SSR para counts aqui, podes calcular e passar via props a um “Hydrated”)
  return <AdminPtsScheduleClient pageSize={20} />;
}
