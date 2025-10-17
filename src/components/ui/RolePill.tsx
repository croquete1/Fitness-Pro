'use client';

import type { AppRole } from '@/lib/roles';

export default function RolePill({ role }: { role: AppRole | 'TRAINER' }) {
  const dbRole = role === 'PT' ? 'TRAINER' : role;
  const palette =
    dbRole === 'ADMIN'
      ? {
          key: 'admin',
          fg: '#6d28d9',
          bg: 'rgba(124,58,237,.10)',
          border: 'rgba(124,58,237,.25)',
        }
      : dbRole === 'TRAINER'
      ? {
          key: 'trainer',
          fg: '#2563eb',
          bg: 'rgba(37,99,235,.10)',
          border: 'rgba(37,99,235,.25)',
        }
      : {
          key: 'client',
          fg: '#0f766e',
          bg: 'rgba(15,118,110,.10)',
          border: 'rgba(15,118,110,.25)',
        };

  const label =
    dbRole === 'ADMIN'
      ? 'Administrador'
      : dbRole === 'TRAINER'
      ? 'Personal Trainer'
      : 'Cliente';

  return (
    <span
      className="badge"
      style={{
        color: `var(--badge-role-${palette.key}-fg, ${palette.fg})`,
        background: `var(--badge-role-${palette.key}-bg, ${palette.bg})`,
        border: `1px solid var(--badge-role-${palette.key}-border, ${palette.border})`,
      }}
    >
      {label}
    </span>
  );
}
