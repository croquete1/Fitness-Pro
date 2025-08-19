'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Pin, PinOff } from 'lucide-react';
import { useSidebarState } from './SidebarWrapper';
import { useMemo } from 'react';

type NavItem = { href: string; label: string; icon: React.ReactNode };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: 'GERAL',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <span>📊</span> },
      { href: '/dashboard/reports', label: 'Relatórios', icon: <span>🧾</span> },
      { href: '/dashboard/settings', label: 'Definições', icon: <span>⚙️</span> },
    ],
  },
  {
    title: 'PT',
    items: [
      { href: '/dashboard/pt/clients', label: 'Clientes', icon: <span>🙋</span> },
      { href: '/dashboard/pt/plans', label: 'Planos', icon: <span>🧱</span> },
      { href: '/dashboard/pt/library', label: 'Biblioteca', icon: <span>📚</span> },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: <span>✅</span> },
      { href: '/dashboard/admin/users', label: 'Utilizadores', icon: <span>👥</span> },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { href: '/dashboard/system/health', label: 'Saúde do sistema', icon: <span>🧰</span> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const {
    collapsed,
    pinned,
    toggleCollapsed,
    togglePinned,
  } = useSidebarState();

  // ativo por prefixo (p.ex. /dashboard/pt/clients/123)
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // classes utilitárias
  const sbDataAttrs = useMemo(
    () => ({
      'data-collapsed': collapsed ? 'true' : 'false',
    }),
    [collapsed]
  );

  return (
    <div className="h-full flex flex-col" {...sbDataAttrs}>
      {/* Cabeçalho da sidebar */}
      <div className="fp-sb-head">
        <Link href="/dashboard" className="fp-sb-brand" aria-label="Início">
          <span className="logo overflow-hidden">
            {/* Coloca o teu ficheiro em /public/logo.svg (ou troca src por .png) */}
            <Image
              src="/logo.svg"
              alt="Fitness Pro"
              width={28}
              height={28}
              priority
              style={{ objectFit: 'contain' }}
            />
          </span>
          {/* Esconde o texto quando encolhida */}
          {!collapsed && <strong>Fitness Pro</strong>}
        </Link>

        <div className="fp-sb-actions">
          {/* fixar/desafixar preferência */}
          <button
            type="button"
            className="btn icon"
            aria-label={pinned ? 'Desafixar sidebar' : 'Fixar sidebar'}
            title={pinned ? 'Desafixar' : 'Fixar'}
            onClick={togglePinned}
          >
            {pinned ? <Pin size={18} /> : <PinOff size={18} />}
          </button>

          {/* hambúrguer: quando expandida, encolhe para ícones */}
          {!collapsed && (
            <button
              type="button"
              className="btn icon"
              aria-label="Encolher sidebar"
              title="Encolher"
              onClick={toggleCollapsed}
            >
              <Menu size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Navegação */}
      <nav className="fp-nav overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.title} className="nav-group">
            {/* título da secção (oculto quando encolhida via CSS) */}
            <div className="nav-section">{group.title}</div>

            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-item"
                  data-active={active ? 'true' : 'false'}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
