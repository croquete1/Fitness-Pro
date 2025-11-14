'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export type ProfileHeroTab<Value extends string = string> = {
  label: string;
  value: Value;
  badge?: string | number | null;
  href?: string;
  kind?: 'local' | 'link';
};

type ProfileHeroTabsProps<Value extends string = string> = {
  tabs: ProfileHeroTab<Value>[];
  value: Value;
  onValueChange?: (next: Value) => void;
  ariaLabel?: string;
};

export default function ProfileHeroTabs<Value extends string = string>({
  tabs,
  value,
  onValueChange,
  ariaLabel,
}: ProfileHeroTabsProps<Value>) {
  const router = useRouter();

  if (!tabs.length) return null;

  const handleSelect = React.useCallback(
    (tab: ProfileHeroTab<Value>) => {
      if (tab.kind === 'link' && tab.href) {
        router.push(tab.href);
        return;
      }
      if (typeof onValueChange === 'function') {
        onValueChange(tab.value);
      }
    },
    [onValueChange, router],
  );

  return (
    <nav className="profile-dashboard__tabs" aria-label={ariaLabel ?? 'Secções disponíveis'} role="tablist">
      <ul>
        {tabs.map((tab) => {
          const isActive = tab.value === value;
          const badge = tab.badge;
          const badgeLabel = badge != null ? String(badge) : null;
          const tabId = `profile-tab-${tab.value}`;
          const controlsId = `profile-panel-${tab.value}`;

          return (
            <li key={tab.value}>
              <button
                type="button"
                id={tabId}
                role="tab"
                className={clsx('profile-dashboard__tab', isActive && 'is-active')}
                aria-selected={isActive}
                aria-controls={controlsId}
                onClick={() => handleSelect(tab)}
                data-kind={tab.kind ?? 'local'}
              >
                <span className="profile-dashboard__tabLabel">{tab.label}</span>
                {badgeLabel ? <span className="profile-dashboard__tabBadge">{badgeLabel}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
