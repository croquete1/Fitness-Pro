'use client';

import React from 'react';

type Props = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  sticky?: boolean;
  eyebrow?: React.ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  actions,
  sticky = true,
  eyebrow,
}: Props) {
  const TitleTag = (typeof title === 'string' ? 'h1' : 'div') as 'h1' | 'div';

  return (
    <header
      className={`page-header neo-panel neo-panel--header${sticky ? ' page-header--sticky' : ''}`}
    >
      <div className="page-header__body">
        {eyebrow ? <div className="page-header__eyebrow">{eyebrow}</div> : null}
        <TitleTag className="page-header__title heading-solid">
          {title}
        </TitleTag>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}
