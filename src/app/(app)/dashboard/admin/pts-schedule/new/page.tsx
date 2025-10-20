'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import PageHeader from '@/components/ui/PageHeader';
import SessionFormClient from '../SessionFormClient';

export default function Page() {
  const params = useSearchParams();
  const initial = React.useMemo(() => {
    const get = (key: string) => params.get(key) ?? '';
    return {
      start_time: get('start_time'),
      end_time: get('end_time'),
      trainer_id: get('trainer_id') || undefined,
      client_id: get('client_id') || undefined,
    };
  }, [params]);

  return (
    <div className="admin-pts-schedule__formPage">
      <PageHeader title="Nova sessão" subtitle="Agenda uma nova sessão para a tua equipa." sticky={false} />
      <div className="admin-pts-schedule__formCard">
        <SessionFormClient mode="create" initial={initial} />
      </div>
    </div>
  );
}
