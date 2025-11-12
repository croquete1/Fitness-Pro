'use client';

import * as React from 'react';
import BrandLogo from '@/components/BrandLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { brand } from '@/lib/brand';
import type { LandingSummary } from '@/lib/public/landing/types';
import { AuthNeoInsights } from '@/components/auth/AuthNeoInsights';

type AuthNeoShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  summary?: LandingSummary | null;
  loadingSummary?: boolean;
  footer?: React.ReactNode;
  tone?: 'default' | 'notice';
  showInsights?: boolean;
};

export function AuthNeoShell({
  title,
  subtitle,
  children,
  summary,
  loadingSummary,
  footer,
  tone = 'default',
  showInsights = false,
}: AuthNeoShellProps) {
  const hasInsights = showInsights && (!!summary || !!loadingSummary);

  return (
    <div className="neo-auth" data-tone={tone} data-has-insights={hasInsights ? 'true' : 'false'}>
      {hasInsights ? (
        <aside className="neo-auth__aside">
          <AuthNeoInsights summary={summary} loading={loadingSummary} />
        </aside>
      ) : null}

      <main className="neo-auth__main" aria-live="polite">
        <header className="neo-auth__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="neo-auth__brand" aria-label={`Plataforma ${brand.name}`} style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
            <span className="neo-auth__brandMark">
              <BrandLogo size={100} />
            </span>
            <span className="sr-only">{brand.name}</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <ThemeToggle variant="subtle" />
          </div>
        </header>

        <div className="neo-auth__intro">
          <h1 className="neo-auth__title">{title}</h1>
          <p className="neo-auth__subtitle">{subtitle}</p>
        </div>

        <section className="neo-auth__card" aria-label={title} data-section="form">
          {children}
        </section>

        {footer ? <footer className="neo-auth__footer">{footer}</footer> : null}
      </main>
    </div>
  );
}
