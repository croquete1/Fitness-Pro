// src/components/layout/SidebarAdmin.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = { label: string; href: string; Icon: (p?: { active?: boolean }) => JSX.Element };

function IconHome({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24"
      style={{ color: active ? '#0ea5e9' : '#64748b' }} aria-hidden>
      <path fill="currentColor"
        d="M12 3l9 8h-3v8h-12v-8H3l9-8z" />
    </svg>
  );
}
function IconUsers({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24"
      style={{ color: active ? '#22c55e' : '#64748b' }} aria-hidden>
      <path fill="currentColor"
        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3s1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5S5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V20h10v-3.5c0-2.33-4.67-3.5-7-3.5m8 0c-.29 0-.62.02-.97.05c1.16.84 1.97 1.97 1.97 3.45V20h7v-3.5c0-2.33-4.67-3.5-7-3.5" />
    </svg>
  );
}
function IconClipboard({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24"
      style={{ color: active ? '#a855f7' : '#64748b' }} aria-hidden>
      <path fill="currentColor"
        d="M9 2h6a2 2 0 0 1 2 2h2a1 1 0 0 1 1 1v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1h2a2 2 0 0 1 2-2m0 2v2h6V4z" />
    </svg>
  );
}
function IconDumbbell({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24"
      style={{ color: active ? '#f59e0b' : '#64748b' }} aria-hidden>
      <path fill="currentColor"
        d="M20.57 14.86L19.14 16.29L16.29 13.44L17.71 12.01L20.57 14.86M7.71 12.01L8.44 12.74L7.01 14.16L3.43 10.57L4.86 9.14L7.71 12M22 12.01L19.86 9.86L18.43 11.29L21.29 14.15L22 12.01M5.57 16.29L2.72 13.44L2 15.58L4.14 17.72L5.57 16.29M21.29 9.86L19.86 8.43L18.43 9.86L19.86 11.29L21.29 9.86M7.71 9.86L6.29 11.29L9.14 14.14L10.57 12.71L7.71 9.86Z" />
    </svg>
  );
}

export default function SidebarAdmin() {
  const pathname = usePathname();

  const items: Item[] = [
    { label: 'Dashboard', href: '/dashboard', Icon: IconHome },
    { label: 'Clientes & Pacotes', href: '/dashboard/admin/clients', Icon: IconUsers },
    { label: 'Planos (Admin)', href: '/dashboard/admin/plans', Icon: IconClipboard },
    { label: 'Catálogo de Exercícios', href: '/dashboard/admin/catalog', Icon: IconDumbbell },
  ];

  return (
    <nav aria-label="Admin" style={{ display: 'grid', gap: 6 }}>
      {items.map(({ label, href, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className="nav-link"
            aria-current={active ? 'page' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 10,
              background: active ? 'rgba(2,132,199,.08)' : 'transparent',
              color: active ? '#0ea5e9' : 'inherit',
              border: active ? '1px solid #0ea5e922' : '1px solid transparent',
            }}
          >
            <Icon active={active} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}