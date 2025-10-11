'use client';

import type { AppRole } from '@/lib/roles';

export default function RolePill({ role }: { role: AppRole | 'TRAINER' }) {
  const dbRole = role === 'PT' ? 'TRAINER' : role;
  const palette =
    dbRole === 'ADMIN'
      ? { c: '#6d28d9', bg: 'rgba(124,58,237,.10)', b: 'rgba(124,58,237,.25)' }
      : dbRole === 'TRAINER'
      ? { c: '#2563eb', bg: 'rgba(37,99,235,.10)', b: 'rgba(37,99,235,.25)' }
      : { c: '#0f766e', bg: 'rgba(15,118,110,.10)', b: 'rgba(15,118,110,.25)' };

  return (
    <span
      className="badge"
      style={{ color: palette.c, background: palette.bg, borderColor: palette.b }}
    >
      {role === 'PT' ? 'Personal Trainer' : role}
    </span>
  );
}
