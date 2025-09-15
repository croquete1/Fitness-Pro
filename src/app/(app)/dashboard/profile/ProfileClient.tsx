'use client';

import React, { useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser, type Database } from '@/lib/supabaseBrowser';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Anthro = Database['public']['Tables']['anthropometry']['Row'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-4 md:p-6">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function ProfileClient({
  initialProfile,
  initialAnthro,
}: {
  initialProfile: Profile | null;
  initialAnthro: Anthro[];
}) {
  const sb = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [anthro, setAnthro] = useState<Anthro[]>(initialAnthro);

  // … aqui ficas livre para pôr handlers específicos do cliente se precisares …
  // (Se já tens a página a tratar do fetch e update, este Client pode focar-se em UX extra)

  return (
    <div className="space-y-4">
      <Section title="Vista rápida">
        <div className="text-sm text-slate-600">Tudo ok ✅</div>
      </Section>
    </div>
  );
}
