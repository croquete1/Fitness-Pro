'use client';

import Link from 'next/link';
import { NavIcon } from '@/components/layout/icons';
import type { NavigationHighlight } from '@/lib/navigation/types';

export type SidebarHighlightsProps = {
  title: string;
  items: NavigationHighlight[];
  onNavigate?: () => void;
};

export default function SidebarHighlights({ title, items, onNavigate }: SidebarHighlightsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="neo-sidebar__highlights">
      <span className="neo-sidebar__highlights-title">{title}</span>
      <ul className="neo-sidebar__highlights-list">
        {items.map((highlight) => {
          const { id, title: itemTitle, description, href, icon, tone } = highlight;
          const content = (
            <span className="neo-sidebar__highlight-content">
              <span className="neo-sidebar__highlight-title">{itemTitle}</span>
              <span className="neo-sidebar__highlight-desc">{description}</span>
            </span>
          );

          if (href) {
            return (
              <li key={id}>
                <Link
                  href={href}
                  prefetch={false}
                  className="neo-sidebar__highlight"
                  data-tone={tone ?? 'neutral'}
                  onClick={onNavigate}
                >
                  {icon && (
                    <span className="neo-sidebar__highlight-icon" aria-hidden>
                      <NavIcon name={icon} size={18} />
                    </span>
                  )}
                  {content}
                </Link>
              </li>
            );
          }

          return (
            <li key={id}>
              <span className="neo-sidebar__highlight" data-tone={tone ?? 'neutral'}>
                {icon && (
                  <span className="neo-sidebar__highlight-icon" aria-hidden>
                    <NavIcon name={icon} size={18} />
                  </span>
                )}
                {content}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
