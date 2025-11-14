// src/components/layout/AppHeader.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Bell,
  Menu,
  MessageSquare,
  Search,
  LogOut,
  User,
  RefreshCw,
  ChevronDown,
  Settings,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { useHeaderCounts } from '@/components/header/HeaderCountsContext';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { useNotificationItems } from '@/components/header/useNotificationItems';
import BrandLogo from '@/components/BrandLogo';
import { brand } from '@/lib/brand';
import type { NavigationSummary } from '@/lib/navigation/types';
import { signOut } from 'next-auth/react';
import { formatRelativeTime } from '@/lib/datetime/relative';
import { useToast } from '@/components/ui/ToastProvider';
import { useAlerts } from '@/hooks/useAlerts';

const METRIC_CARD_LIMIT = 3;

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
  const { openMobile, isMobile } = useSidebar();
  const headerCounts = useHeaderCounts();
  const toast = useToast();
  const { alerts, dismiss } = useAlerts();
  const handledAlertsRef = React.useRef<Set<string>>(new Set());
  const [query, setQuery] = React.useState('');

  const quickMetrics = React.useMemo(
    () => navigationSummary?.quickMetrics?.slice(0, METRIC_CARD_LIMIT) ?? [],
    [navigationSummary],
  );

  const [notifAnchorOpen, setNotifAnchorOpen] = React.useState(false);
  const {
    items: notifItems,
    unreadCount: notifUnreadCount,
    source: notifSource,
    syncedAt: notifSyncedAt,
    loading: notifLoading,
    error: notifError,
    refresh: refreshNotifications,
    setItems: setNotifItems,
  } = useNotificationItems({ limit: 8 });
  const [markingAll, setMarkingAll] = React.useState(false);
  const notificationsButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const notificationsPopoverRef = React.useRef<HTMLDivElement | null>(null);

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

  const toggleNotifications = () => {
    setNotifAnchorOpen((open) => {
      const next = !open;
      if (next) {
        void refreshNotifications();
      }
      return next;
    });
  };

  const closeNotifications = React.useCallback(() => setNotifAnchorOpen(false), []);

  const handleNotificationClick = React.useCallback(
    (itemId: string, href: string | null) => {
      closeNotifications();
      setNotifItems((prev) => {
        const next = prev.map((row) => (row.id === itemId ? { ...row, read: true } : row));
        const unread = next.filter((row) => !row.read).length;
        headerCounts.setCounts({ notificationsCount: unread });
        return next;
      });
      if (href) {
        router.push(href);
      }
      void fetch('/api/notifications/mark', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: [itemId], read: true }),
      }).catch(() => {
        /* silencioso */
      });
    },
    [closeNotifications, headerCounts, router, setNotifItems],
  );

  const markAllNotifications = React.useCallback(async () => {
    if (notifUnreadCount === 0) return;
    setMarkingAll(true);
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Não foi possível marcar notificações como lidas.');
      }
      setNotifItems((prev) => prev.map((row) => ({ ...row, read: true })));
      headerCounts.setCounts({ notificationsCount: 0 });
      toast.success('Todas as notificações foram marcadas como lidas.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível marcar como lidas.';
      toast.error(message);
    } finally {
      setMarkingAll(false);
    }
  }, [headerCounts, notifUnreadCount, setNotifItems, toast]);

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
    if (!alerts.length) return;
    for (const alert of alerts) {
      if (handledAlertsRef.current.has(alert.id)) continue;
      handledAlertsRef.current.add(alert.id);
      const message = alert.body ? `${alert.title}: ${alert.body}` : alert.title;
      toast.info(message);
      dismiss(alert.id);
    }
  }, [alerts, toast, dismiss]);

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
        {isMobile && (
          <button
            type="button"
            className="neo-header__menu"
            onClick={() => openMobile(true)}
            aria-label="Abrir menu de navegação"
          >
            <Menu size={18} strokeWidth={1.8} />
          </button>
        )}
        <Link
          href="/dashboard"
          className="neo-header__brand"
          prefetch={false}
          aria-label={`Ir para o painel principal · ${brand.name}`}
        >
          <span className="neo-header__brandMark" aria-hidden="true">
            <BrandLogo size={32} priority />
          </span>
          <span className="sr-only">{brand.name}</span>
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
          <ThemeToggle className="neo-header__action" />
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
            <div>
              <span>Notificações</span>
              <p className="neo-header__popover-description">
                Últimas interacções entre clientes, PTs e equipa de gestão.
              </p>
            </div>
            <button type="button" onClick={closeNotifications} aria-label="Fechar notificações">
              ×
            </button>
          </div>
          <div className="neo-header__popover-meta">
            <DataSourceBadge source={notifSource} generatedAt={notifSyncedAt} />
            <span className="neo-header__popover-count">
              {notifUnreadCount === 0 ? 'Tudo lido' : `${notifUnreadCount} por ler`}
            </span>
            <button
              type="button"
              onClick={markAllNotifications}
              className="neo-header__popover-mark"
              disabled={markingAll || notifUnreadCount === 0}
            >
              {markingAll ? (
                <Loader2 className="neo-icon neo-icon--xs neo-spin" aria-hidden />
              ) : (
                <CheckCheck className="neo-icon neo-icon--xs" aria-hidden />
              )}
              <span>{markingAll ? 'A marcar…' : 'Marcar tudo'}</span>
            </button>
          </div>
          <div className="neo-header__popover-body">
            {notifLoading && <span className="neo-header__popover-empty">A sincronizar notificações…</span>}
            {notifError && <span className="neo-header__popover-empty">{notifError}</span>}
            {!notifLoading && !notifError && notifItems.length === 0 && (
              <span className="neo-header__popover-empty">Sem notificações pendentes.</span>
            )}
            {!notifLoading && !notifError && notifItems.length > 0 && (
              <ul className="neo-header__notificationList">
                {notifItems.map((item) => {
                  const relative = formatRelativeTime(item.createdAt);
                  const absolute =
                    item.createdAt &&
                    new Date(item.createdAt).toLocaleString('pt-PT', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="neo-header__notification"
                        onClick={() => handleNotificationClick(item.id, item.href)}
                      >
                        <div className="neo-header__notificationBody">
                          <span className="neo-header__notificationTitle">{item.title}</span>
                          {item.body && (
                            <span className="neo-header__notificationExcerpt">{item.body}</span>
                          )}
                          <span className="neo-header__notificationMeta">
                            <time dateTime={item.createdAt ?? undefined} title={absolute ?? undefined}>
                              {relative ?? absolute ?? 'há instantes'}
                            </time>
                            {!item.read && <span className="neo-header__notificationUnread">· novo</span>}
                          </span>
                        </div>
                        {item.href && (
                          <span className="neo-header__notificationIcon" aria-hidden>
                            <ArrowUpRight size={16} strokeWidth={1.6} />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
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

