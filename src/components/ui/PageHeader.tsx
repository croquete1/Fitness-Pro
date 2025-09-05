'use client';

import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  actions,
  sticky = true,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  sticky?: boolean;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        position: sticky ? 'sticky' : 'static',
        top: 0,
        zIndex: 10,
        backdropFilter: 'saturate(180%) blur(6px)',
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: 20 }}>{title}</h1>
        {subtitle && (
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}
