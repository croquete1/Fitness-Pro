// src/components/trainer/TrainerHeader.tsx
export const dynamic = 'force-dynamic';

import React from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import SignOutButton from '@/components/auth/SignOutConfirmButton';
import BrandMark from '@/components/layout/BrandMark';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

function initialsFrom(s: string) {
  const t = (s || '').trim();
  if (!t) return 'U';
  const parts = t.split(/\s+/);
  if (parts.length === 1) return t[0]!.toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

export default async function TrainerHeader() {
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
    <header className="neo-app-header">
      <div className="neo-app-header__inner">
        <div className="neo-app-header__brand" aria-label="Área do personal trainer">
          <span className="inline-flex" aria-hidden="true">
            <BrandMark size={32} priority />
          </span>
        </div>
        <div className="neo-app-header__actions">
          <div className="neo-avatar" title={display}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={display} src={avatarUrl} />
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
