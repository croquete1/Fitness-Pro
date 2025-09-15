// src/components/client/ClientHeader.tsx
export const dynamic = 'force-dynamic';

import React from 'react';
import ThemeToggle from '@/components/layout/ThemeToggle';
import SignOutButton from '@/components/auth/SignOutConfirmButton';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

function initialsFrom(s: string) {
  const t = (s || '').trim();
  if (!t) return 'U';
  const parts = t.split(/\s+/);
  if (parts.length === 1) return t[0]!.toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

export default async function ClientHeader() {
  const me = await getSessionUserSafe().catch(() => null);
  if (!me?.id) return null;

  const sb = createServerClient();
  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', me.id)
    .maybeSingle();

  const display = prof?.name ?? me.name ?? me.email ?? 'Utilizador';
  const avatarUrl = prof?.avatar_url ?? null;
  const initials = initialsFrom(display);

  return (
    <header className="sticky top-0 z-30 border-b bg-white/60 dark:bg-black/30 backdrop-blur">
      <div className="mx-auto max-w-screen-2xl flex items-center justify-between gap-4 px-4 py-3">
        <div className="font-semibold">Fitness Pro</div>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-black/10 dark:ring-white/10 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xs font-semibold"
            title={display}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={display} src={avatarUrl} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
