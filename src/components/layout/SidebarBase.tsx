// src/components/layout/SidebarBase.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import type { UrlObject } from 'url';

/* ================================
 * Tipos / Contexto
 * ================================ */
export type NavItem = {
  href: string | Route | UrlObject;
  label: string;
  icon?: React.ReactNode;
  activePrefix?: string;
};

type SidebarCtx = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;

  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

export function useSidebar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}

/* ================================
 * Provider
 * ================================ */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fp.sidebar.collapsed') === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('fp.sidebar.collapsed', collapsed ? '1' : '0');
    } catch {}
  }, [collapsed]);

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggle: () => setCollapsed((v) => !v),
      mobileOpen,
      openMobile: () => setMobileOpen(true),
      closeMobile: () => setMobileOpen(false),
    }),
    [collapsed, mobileOpen]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function SidebarMobileToggleButton({ className }: { className?: string }) {
  const { openMobile } = useSidebar();
  return (
    <button
      className={className ?? 'btn icon'}
      aria-label="Abrir menu"
      onClick={openMobile}
    >
      ☰
    </button>
  );
}

/* ================================
 * Utils
 * ================================ */
function hrefAsString(href: NavItem['href']) {
  if (typeof href === 'string') return href;
  if (typeof (href as UrlObject).pathname === 'string') {
    return (href as UrlObject).pathname as string;
  }
  return String(href);
}

function normalizeHref(href: NavItem['href']): Route | UrlObject {
  return typeof href === 'string' ? (href as Route) : (href as UrlObject);
}

/* ================================
 * Sidebar
 * ================================ */
export default function SidebarBase({
  items,
  userLabel,
  onNavigate,
  badges,
  footerActions,
}: {
  items: NavItem[];
  userLabel: string;
  onNavigate?: () => void;
  badges?: Record<string, number>;
  footerActions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { collapsed, toggle, mobileOpen, openMobile, closeMobile } = useSidebar();

  const width = collapsed ? 76 : 260;

  // Fechar drawer em navegação / Esc
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && closeMobile();
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [closeMobile]);

  // Swipe (global) para abrir a partir da margem esquerda (mobile)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const startedAtEdge = useRef(false);

  useEffect(() => {
    const EDGE = 24;
    const OPEN_THRESHOLD = 40;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStartX.current = t.clientX;
      touchStartY.current = t.clientY;
      startedAtEdge.current = !mobileOpen && t.clientX <= EDGE;
    };
    const onMove = (e: TouchEvent) => {
      if (touchStartX.current == null || touchStartY.current == null) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStartX.current;
      const dy = t.clientY - touchStartY.current;
      if (Math.abs(dy) > Math.abs(dx)) return; // ignora scroll vertical
      if (startedAtEdge.current && dx > OPEN_THRESHOLD) {
        e.preventDefault();
        openMobile(); // ✅ abrir corretamente
        touchStartX.current = null;
        touchStartY.current = null;
        startedAtEdge.current = false;
      }
    };
    const onEnd = () => {
      touchStartX.current = null;
      touchStartY.current = null;
      startedAtEdge.current = false;
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
  }, [mobileOpen, openMobile]);

  // Swipe dentro do aside para fechar
  const asideRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const CLOSE_THRESHOLD = -40;
    let sx: number | null = null;
    let sy: number | null = null;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (sx == null || sy == null) return;
      const t = e.touches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (dx < CLOSE_THRESHOLD) {
        e.preventDefault();
        closeMobile();
        sx = sy = null;
      }
    };
    const onEnd = () => {
      sx = sy = null;
    };

    const el = asideRef.current;
    if (!el) return;
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, [closeMobile]);

  return (
    <>
      {mobileOpen && (
        <div
          onClick={closeMobile}
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.35)',
            zIndex: 998,
          }}
        />
      )}

      <aside
        ref={asideRef}
        data-collapsed={collapsed ? 'true' : 'false'}
        style={{
          position: mobileOpen ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          bottom: 0,
          width,
          transition: 'width 180ms ease',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
          zIndex: mobileOpen ? 999 : 1,
          overflow: 'hidden',
        }}
        role="navigation"
        aria-label="Navegação principal"
      >
        {/* Cabeçalho */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 12,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <button className="logo" aria-label="Fitness Pro" style={{ fontSize: 20 }}>
            💪
          </button>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, lineHeight: 1 }}>Fitness Pro</div>
              <div
                className="small text-muted"
                style={{
                  maxWidth: 160,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={userLabel}
              >
                {userLabel}
              </div>
            </div>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button
              className="btn chip"
              onClick={toggle}
              aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
              title={collapsed ? 'Expandir' : 'Colapsar'}
            >
              {collapsed ? '»' : '«'}
            </button>
          </div>
        </div>

        {/* Lista */}
        <nav aria-label="Secções" style={{ padding: 8 }}>
          {items.map((it) => {
            const hrefStr = hrefAsString(it.href);
            const active = it.activePrefix
              ? pathname?.startsWith(it.activePrefix)
              : pathname === hrefStr || pathname?.startsWith(`${hrefStr}/`);
            const badge = badges?.[hrefStr] ?? 0;

            return (
              <div key={hrefStr} style={{ marginBottom: 6 }}>
                <Link
                  href={normalizeHref(it.href)} // ✅ typedRoutes friendly
                  className="nav-item"
                  data-active={active ? 'true' : 'false'}
                  onClick={onNavigate}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: collapsed ? '1fr auto' : 'auto 1fr auto',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 12,
                    textDecoration: 'none',
                    color: 'var(--text)',
                    background: active ? 'var(--sidebar-active)' : 'transparent',
                    border: active ? '1px solid var(--primary)' : '1px solid transparent',
                  }}
                >
                  <span aria-hidden>{it.icon ?? '•'}</span>
                  {!collapsed && (
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {it.label}
                    </span>
                  )}
                  {badge > 0 && (
                    <span
                      aria-label={`${badge} por ler`}
                      style={{
                        justifySelf: 'end',
                        fontSize: 12,
                        minWidth: 20,
                        height: 20,
                        padding: '0 6px',
                        display: 'inline-grid',
                        placeItems: 'center',
                        borderRadius: 999,
                        background: 'var(--danger)',
                        color: 'white',
                        fontWeight: 700,
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {footerActions && (
          <div style={{ marginTop: 'auto', padding: 8, borderTop: '1px solid var(--border)' }}>
            {footerActions}
          </div>
        )}
      </aside>
    </>
  );
}
