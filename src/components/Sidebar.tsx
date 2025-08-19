'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Book,
  CheckCircle2,
  Layers,
  LayoutDashboard,
  Menu,
  Pin,
  PinOff,
  Settings,
  UserCog,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { useSidebarState } from './SidebarWrapper';

type NavItem = { href: string; label: string; icon: React.ReactNode };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: 'GERAL',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
      { href: '/dashboard/reports', label: 'Relatórios', icon: <BarChart3 /> },
      { href: '/dashboard/settings', label: 'Definições', icon: <Settings /> },
    ],
  },
  {
    title: 'PT',
    items: [
      { href: '/dashboard/pt/clients', label: 'Clientes', icon: <Users /> },
      { href: '/dashboard/pt/plans', label: 'Planos', icon: <Layers /> },
      { href: '/dashboard/pt/library', label: 'Biblioteca', icon: <Book /> },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: <CheckCircle2 /> },
      { href: '/dashboard/admin/users', label: 'Utilizadores', icon: <UserCog /> },
    ],
  },
  {
    title: 'SISTEMA',
    items: [{ href: '/dashboard/system/health', label: 'Saúde do sistema', icon: <Activity /> }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebarState();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const sbDataAttrs = useMemo(
    () => ({
      'data-collapsed': collapsed ? 'true' : 'false',
    }),
    [collapsed]
  );

  return (
    <div className="h-full flex flex-col" {...sbDataAttrs}>
      {/* Cabeçalho */}
      <div className="fp-sb-head">
        <Link href="/dashboard" className="fp-sb-brand" aria-label="Início">
          <span className="logo overflow-hidden">
            {/* Coloque o teu ficheiro em /public/logo.png */}
            <Image
              src="/logo.png"
              alt="Fitness Pro"
              width={28}
              height={28}
              priority
              style={{ objectFit: 'contain' }}
            />
          </span>
          {!collapsed && <strong>Fitness Pro</strong>}
        </Link>

        <div className="fp-sb-actions">
          {/* Fixar/Desafixar preferência (sempre visível) */}
          <button
            type="button"
            className="btn icon"
            aria-label={pinned ? 'Desafixar sidebar' : 'Fixar sidebar'}
            title={pinned ? 'Desafixar' : 'Fixar'}
            onClick={togglePinned}
          >
            {pinned ? <Pin size={18} /> : <PinOff size={18} />}
          </button>

          {/* Hambúrguer: apenas quando expandida -> encolhe para ícones */}
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
