import Link from 'next/link';
import clsx from 'clsx';

export type ProfileHeroTab = {
  label: string;
  href: string;
  current?: boolean;
  badge?: string | number | null;
};

type ProfileHeroTabsProps = {
  tabs: ProfileHeroTab[];
  ariaLabel?: string;
};

export default function ProfileHeroTabs({ tabs, ariaLabel }: ProfileHeroTabsProps) {
  if (!tabs.length) return null;

  return (
    <nav className="profile-dashboard__tabs" aria-label={ariaLabel ?? 'Secções disponíveis'}>
      <ul>
        {tabs.map((tab) => {
          const isActive = Boolean(tab.current);
          const badge = tab.badge;
          const badgeLabel = badge != null ? String(badge) : null;

          return (
            <li key={`${tab.href}-${tab.label}`}>
              <Link
                href={tab.href}
                className={clsx('profile-dashboard__tab', isActive && 'is-active')}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="profile-dashboard__tabLabel">{tab.label}</span>
                {badgeLabel ? <span className="profile-dashboard__tabBadge">{badgeLabel}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
