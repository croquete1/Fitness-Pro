// src/components/admin/AdminHeader.tsx
export const dynamic = 'force-dynamic';

import React from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import SignOutButton from '@/components/auth/SignOutConfirmButton';
import BrandMark from '@/components/layout/BrandMark';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

function initialsFrom(nameOrEmail: string) {
  const s = (nameOrEmail || '').trim();
  if (!s) return 'U';
  const parts = s.split(/\s+/).slice(0, 2);
  if (parts.length === 1) {
    const p = parts[0];
    if (p.includes('@')) return p[0]!.toUpperCase();
    return p.substring(0, 2).toUpperCase();
  }
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

export default async function AdminHeader() {
  // Sessão (server-side)
  const sessionUser = await getSessionUserSafe().catch(() => null);
  const me: any = sessionUser || null;
  if (!me?.id) return null;

  // Perfil (nome + avatar)
  const sb = createServerClient();
  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', me.id)
    .maybeSingle();

  const displayName = prof?.name ?? me.name ?? me.email ?? 'Utilizador';
  const avatarUrl = prof?.avatar_url ?? null;
  const initials = initialsFrom(displayName);

  return (
    <header className="sticky top-0 z-30 border-b bg-white/60 dark:bg-black/30 backdrop-blur">
      <div className="mx-auto max-w-screen-2xl flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2" aria-label="Área administrativa">
          <span className="inline-flex" aria-hidden="true">
            <BrandMark size={32} priority />
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-black/10 dark:ring-white/10 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xs font-semibold"
            title={displayName}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={displayName} src={avatarUrl} className="w-full h-full object-cover" />
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
