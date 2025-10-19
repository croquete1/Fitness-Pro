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
};

export function AuthNeoShell({
  title,
  subtitle,
  children,
  summary,
  loadingSummary,
  footer,
  tone = 'default',
}: AuthNeoShellProps) {
  return (
    <div className="neo-auth" data-tone={tone}>
      <aside className="neo-auth__aside">
        <AuthNeoInsights summary={summary} loading={loadingSummary} />
      </aside>

      <main className="neo-auth__main" aria-live="polite">
        <header className="neo-auth__header">
          <div className="neo-auth__brand" aria-label={`Plataforma ${brand.name}`}>
            <span className="neo-auth__brandMark">
              <BrandLogo size={48} />
            </span>
            <span className="neo-auth__brandText">{brand.name}</span>
          </div>
          <ThemeToggle variant="subtle" />
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
