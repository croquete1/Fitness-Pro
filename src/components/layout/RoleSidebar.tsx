'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Dumbbell, UsersRound, BookOpenText, ChevronLeft, ChevronRight } from 'lucide-react';

type AppRole = 'ADMIN' | 'TRAINER' | 'CLIENT';

function roleFromPathname(pathname: string): AppRole {
  if (pathname.startsWith('/dashboard/admin')) return 'ADMIN';
  if (pathname.startsWith('/dashboard/pt')) return 'TRAINER';
  return 'CLIENT';
}

// persiste no localStorage e expõe via atributo para CSS
function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  useEffect(() => {
    const v = typeof window !== 'undefined' ? localStorage.getItem('sidebar:collapsed') : null;
    if (v === '1') setCollapsed(true);
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    localStorage.setItem('sidebar:collapsed', collapsed ? '1' : '0');
    document.documentElement.setAttribute('data-sidebar', collapsed ? 'collapsed' : 'open');
  }, [collapsed]);
  return { collapsed, setCollapsed };
}

export default function RoleSidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarCollapsed();
  const activeRole = roleFromPathname(pathname);

  const items = useMemo(
    () => [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
      { href: '/dashboard/users', label: 'Utilizadores', icon: UsersRound, roles: ['ADMIN'] as AppRole[] },
      { href: '/dashboard/clients-packages', label: 'Clientes & Pacotes', icon: UsersRound, roles: ['ADMIN', 'TRAINER'] as AppRole[] },
      { href: '/dashboard/pt/plans', label: 'Planos (Admin)', icon: BookOpenText, roles: ['ADMIN'] as AppRole[] },
      { href: '/dashboard/exercises', label: 'Exercícios (Catálogo)', icon: Dumbbell, roles: ['ADMIN', 'TRAINER'] as AppRole[] },
    ],
    []
  );

  const visible = items.filter(i => !i.roles || i.roles.includes(activeRole));

  return (
    <aside
      aria-label="Barra lateral de navegação"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'var(--sidebar-w)',
        transition: 'width .18s ease',
        borderRight: '1px solid var(--border)',
        background: 'var(--sidebar, #fff)',
        padding: 8,
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gap: 10,
        zIndex: 40,
      }}
    >
      {/* topo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--hover, #f2f4f7)',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
          }}
        >
          FP
        </div>
        <div className="sb-label" style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Fitness Pro
        </div>
        <button
          aria-label={collapsed ? 'Expandir sidebar' : 'Compactar sidebar'}
          onClick={() => setCollapsed(!collapsed)}
          className="btn chip"
          style={{ marginLeft: 'auto', display: 'grid', placeItems: 'center', padding: 6 }}
          title={collapsed ? 'Expandir' : 'Compactar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* lista */}
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
          {visible.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="sidebar-item"
                  aria-current={active ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    color: 'inherit',
                    background: active ? 'var(--hover, #f2f4f7)' : 'transparent',
                    border: active ? '1px solid var(--border)' : '1px solid transparent',
                  }}
                >
                  <Icon size={18} />
                  <span className="sb-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* rodapé opcional */}
      <div style={{ fontSize: 12, opacity: 0.55, padding: '6px 8px' }}>
        <span className="sb-label">v1</span>
      </div>
    </aside>
  );
}