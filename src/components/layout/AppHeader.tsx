// src/components/layout/AppHeader.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Menu,
  MessageSquare,
  Search,
  LogOut,
  User,
  RefreshCw,
  ChevronDown,
  Settings,
} from 'lucide-react';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { useHeaderCounts } from '@/components/header/HeaderCountsContext';
import BrandLogo from '@/components/BrandLogo';
import { brand } from '@/lib/brand';
import type { NavigationSummary } from '@/lib/navigation/types';
import { signOut } from 'next-auth/react';

const METRIC_CARD_LIMIT = 3;

type NotificationItem = {
  id: string;
  title: string;
  href?: string | null;
  created_at?: string | null;
};

type Props = {
  role?: string | null;
  userLabel?: string | null;
  userAvatarUrl?: string | null;
  navigationSummary?: NavigationSummary | null;
  navigationLoading?: boolean;
  onRefreshNavigation?: () => Promise<unknown> | unknown;
};

function initialsFrom(label?: string | null) {
  const s = (label ?? '').trim();
  if (!s) return '•';
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '•';
}

export default function AppHeader({
  role = 'CLIENT',
  userLabel,
  userAvatarUrl,
  navigationSummary,
  navigationLoading,
  onRefreshNavigation,
}: Props) {
  const router = useRouter();
  const { openMobile } = useSidebar();
  const headerCounts = useHeaderCounts();
  const [query, setQuery] = React.useState('');

  const quickMetrics = React.useMemo(
    () => navigationSummary?.quickMetrics?.slice(0, METRIC_CARD_LIMIT) ?? [],
    [navigationSummary],
  );

  const [notifAnchorOpen, setNotifAnchorOpen] = React.useState(false);
  const [notifItems, setNotifItems] = React.useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = React.useState(false);
  const [notifError, setNotifError] = React.useState<string | null>(null);
  const notificationsButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const notificationsPopoverRef = React.useRef<HTMLDivElement | null>(null);
  const hasNotifications = notifAnchorOpen && notifItems.length > 0;

  const submitSearch = React.useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/dashboard/search?q=${encodeURIComponent(trimmed)}`);
  }, [query, router]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitSearch();
    }
  };

  const loadNotifications = React.useCallback(async () => {
    setNotifLoading(true);
    setNotifError(null);
    try {
      const response = await fetch('/api/notifications/dropdown', {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error('REQUEST_FAILED');
      const data = await response.json();
      const items: NotificationItem[] = Array.isArray(data?.items)
        ? data.items.map((item: any) => ({
            id: String(item?.id ?? crypto.randomUUID?.() ?? Date.now()),
            title: String(item?.title ?? 'Notificação'),
            href: item?.href ?? null,
            created_at: item?.created_at ?? null,
          }))
        : [];
      setNotifItems(items);
      headerCounts.setCounts({ notificationsCount: items.length });
    } catch (error) {
      console.warn('[header] notifications dropdown failed', error);
      setNotifItems([]);
      setNotifError('Não foi possível carregar notificações.');
    } finally {
      setNotifLoading(false);
    }
  }, [headerCounts]);

  const toggleNotifications = () => {
    setNotifAnchorOpen((open) => {
      const next = !open;
      if (next && !notifItems.length) {
        void loadNotifications();
      }
      return next;
    });
  };

  const closeNotifications = () => setNotifAnchorOpen(false);

  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);
  const toggleUserMenu = () => setUserMenuOpen((value) => !value);
  const closeUserMenu = () => setUserMenuOpen(false);

  const messagesCount = headerCounts.messagesCount ?? 0;
  const notificationsCount = headerCounts.notificationsCount ?? 0;

  async function handleSignOut() {
    closeUserMenu();
    await signOut({ callbackUrl: '/login' });
  }

  const displayLabel = React.useMemo(() => {
    if (!userLabel) return undefined;
    if (String(role).toUpperCase() !== 'CLIENT') return userLabel;
    const cleaned = userLabel.replace(/^[\s·•\-–:]*?(cliente|client[ea]?)([\s·•\-–:]+|\s+)/i, '').trim();
    return cleaned || userLabel;
  }, [userLabel, role]);

  React.useEffect(() => {
    if (!notifAnchorOpen && !userMenuOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (notifAnchorOpen) setNotifAnchorOpen(false);
        if (userMenuOpen) setUserMenuOpen(false);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const targetNode = event.target as Node | null;
      if (!targetNode) return;
      if (
        notifAnchorOpen &&
        notificationsPopoverRef.current &&
        !notificationsPopoverRef.current.contains(targetNode) &&
        !(notificationsButtonRef.current && notificationsButtonRef.current.contains(targetNode))
      ) {
        setNotifAnchorOpen(false);
      }
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(targetNode) &&
        !(userButtonRef.current && userButtonRef.current.contains(targetNode))
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [notifAnchorOpen, userMenuOpen]);

  return (
    <header className="neo-header" data-role={String(role).toLowerCase()}>
      <div className="neo-header__bar">
        <button
          type="button"
          className="neo-header__menu"
          onClick={() => openMobile(true)}
          aria-label="Abrir menu de navegação"
        >
          <Menu size={18} strokeWidth={1.8} />
        </button>
        <Link href="/dashboard" className="neo-header__brand" prefetch={false}>
          <BrandLogo size={32} priority />
          <span>{brand.name}</span>
        </Link>
        <div className="neo-header__search">
          <Search size={16} strokeWidth={1.6} className="neo-header__search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pesquisar clientes, planos ou sessões"
            aria-label="Pesquisar"
          />
          <button type="button" onClick={submitSearch} className="neo-header__search-button">
            Pesquisar
          </button>
        </div>
        <div className="neo-header__actions">
          {onRefreshNavigation && (
            <button
              type="button"
              className="neo-header__action"
              onClick={() => onRefreshNavigation()}
              aria-label="Actualizar métricas"
              title="Actualizar métricas"
            >
              <RefreshCw size={16} strokeWidth={1.8} />
            </button>
          )}
          <ThemeToggleButton className="neo-header__action" aria-label="Alternar tema" />
          <Link
            href="/dashboard/messages"
            prefetch={false}
            className="neo-header__action neo-header__action--badge"
            aria-label={`${messagesCount} mensagens novas`}
          >
            <MessageSquare size={18} strokeWidth={1.8} />
            {messagesCount > 0 && <span className="neo-header__badge">{messagesCount > 99 ? '99+' : messagesCount}</span>}
          </Link>
          <button
            type="button"
            className="neo-header__action neo-header__action--badge"
            onClick={toggleNotifications}
            aria-expanded={notifAnchorOpen}
            aria-label={notificationsCount ? `${notificationsCount} notificações novas` : 'Abrir notificações'}
            ref={notificationsButtonRef}
          >
            <Bell size={18} strokeWidth={1.8} />
            {notificationsCount > 0 && (
              <span className="neo-header__badge">{notificationsCount > 99 ? '99+' : notificationsCount}</span>
            )}
          </button>
          <button
            type="button"
            className="neo-header__user"
            onClick={toggleUserMenu}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            ref={userButtonRef}
          >
            {userAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatarUrl} alt={displayLabel ?? 'Conta'} />
            ) : (
              <span className="neo-header__user-initials" aria-hidden>
                {initialsFrom(displayLabel)}
              </span>
            )}
            <ChevronDown size={16} strokeWidth={1.6} className="neo-header__user-caret" aria-hidden />
          </button>
        </div>
      </div>

      {quickMetrics.length > 0 && (
        <div className="neo-header__metrics" aria-live={navigationLoading ? 'polite' : undefined}>
          {quickMetrics.map((metric) => (
            <div key={metric.id} className={`neo-header__metric neo-header__metric--${metric.tone}`}>
              <span className="neo-header__metric-label">{metric.label}</span>
              <span className="neo-header__metric-value">{metric.value}</span>
              {metric.hint && <span className="neo-header__metric-hint">{metric.hint}</span>}
            </div>
          ))}
          {navigationLoading && <span className="neo-header__metric-loading">Atualizando…</span>}
        </div>
      )}

      {notifAnchorOpen && (
        <div
          ref={notificationsPopoverRef}
          className="neo-header__popover"
          role="dialog"
          aria-label="Notificações"
          data-tone="panel"
        >
          <div className="neo-header__popover-header">
            <span>Notificações</span>
            <button type="button" onClick={closeNotifications} aria-label="Fechar notificações">
              ×
            </button>
          </div>
          <div className="neo-header__popover-body">
            {notifLoading && <span className="neo-header__popover-empty">A carregar…</span>}
            {notifError && <span className="neo-header__popover-empty">{notifError}</span>}
            {!notifLoading && !notifError && notifItems.length === 0 && (
              <span className="neo-header__popover-empty">Sem notificações pendentes.</span>
            )}
            {!notifLoading && hasNotifications && (
              <ul>
                {notifItems.map((item) => (
                  <li key={item.id}>
                    {item.href ? (
                      <Link href={item.href} prefetch={false} onClick={closeNotifications}>
                        {item.title}
                      </Link>
                    ) : (
                      <span>{item.title}</span>
                    )}
                    {item.created_at && (
                      <time dateTime={item.created_at}>
                        {new Date(item.created_at).toLocaleString('pt-PT', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: 'short',
                        })}
                      </time>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {userMenuOpen && (
        <div ref={userMenuRef} className="neo-header__popover neo-header__popover--menu" role="menu">
          <button
            type="button"
            onClick={() => {
              closeUserMenu();
              router.push('/dashboard/profile');
            }}
            role="menuitem"
          >
            <User size={16} strokeWidth={1.8} /> Perfil
          </button>
          <button
            type="button"
            onClick={() => {
              closeUserMenu();
              router.push('/dashboard/settings');
            }}
            role="menuitem"
          >
            <Settings size={16} strokeWidth={1.8} /> Definições
          </button>
          <button type="button" onClick={handleSignOut} role="menuitem" className="danger">
            <LogOut size={16} strokeWidth={1.8} /> Terminar sessão
          </button>
        </div>
      )}
    </header>
  );
}

