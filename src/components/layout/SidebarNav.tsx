'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { NavIcon } from '@/components/layout/icons';

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  activePrefix?: string | string[];
  badge?: number | null;
  description?: string | null;
  kpiLabel?: string | null;
  kpiValue?: string | null;
  tone?: 'primary' | 'positive' | 'warning' | 'danger' | 'neutral';
};

type Props = {
  title: string;
  items: SidebarNavItem[];
  currentPath: string;
  isRail: boolean;
  onNavigate: () => void;
};

function matchesPrefix(path: string, prefix?: string | string[]) {
  if (!prefix) return false;
  if (Array.isArray(prefix)) {
    return prefix.some((p) => path.startsWith(p));
  }
  return path.startsWith(prefix);
}

export function SidebarNavSection({ title, items, currentPath, isRail, onNavigate }: Props) {
  return (
    <section className="neo-sidebar__section">
      <header className="neo-sidebar__section-header">
        <span>{title}</span>
      </header>
      <ul className="neo-sidebar__list">
        {items.map((item) => {
          const active = item.exact
            ? currentPath === item.href
            : matchesPrefix(currentPath, item.activePrefix) || currentPath.startsWith(item.href);
          const badge = typeof item.badge === 'number' ? item.badge : null;
          const tone = item.tone ?? (badge && badge > 0 ? 'warning' : 'neutral');

          return (
            <li key={item.href} className="neo-sidebar__list-item">
              <Link
                href={item.href}
                prefetch={false}
                className={clsx('neo-sidebar__item', active && 'neo-sidebar__item--active')}
                aria-current={active ? 'page' : undefined}
                title={isRail ? item.label : undefined}
                onClick={onNavigate}
                data-tone={tone}
              >
                <span className="neo-sidebar__item-icon" aria-hidden>
                  <NavIcon name={item.icon} />
                </span>
                <span className="neo-sidebar__item-body">
                  <span className="neo-sidebar__item-label">{item.label}</span>
                  {item.description && !isRail && (
                    <span className="neo-sidebar__item-description">{item.description}</span>
                  )}
                </span>
                {(item.kpiValue || badge) && (
                  <span className="neo-sidebar__item-meta">
                    {item.kpiValue && !isRail && (
                      <span className="neo-sidebar__item-kpi">
                        {item.kpiLabel && <span className="neo-sidebar__item-kpi-label">{item.kpiLabel}</span>}
                        <span className="neo-sidebar__item-kpi-value">{item.kpiValue}</span>
                      </span>
                    )}
                    {badge !== null && badge > 0 && (
                      <span className="neo-sidebar__item-badge" data-tone={tone} aria-label={`${badge} itens pendentes`}>
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
