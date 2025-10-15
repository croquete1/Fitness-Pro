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
  badge?: number;
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
    <div className="nav-group">
      <span className="nav-section">{title}</span>
      <div className="nav-group__items">
        {items.map((item) => {
          const active = item.exact
            ? currentPath === item.href
            : matchesPrefix(currentPath, item.activePrefix) || currentPath.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={clsx('nav-item', active && 'nav-item--active')}
              aria-current={active ? 'page' : undefined}
              title={isRail ? item.label : undefined}
              onClick={onNavigate}
            >
              <span className="nav-icon" aria-hidden>
                <NavIcon name={item.icon} />
              </span>
              <span className="nav-label">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="nav-badge" aria-label={`${item.badge} itens pendentes`}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
