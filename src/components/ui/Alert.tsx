'use client';

import * as React from 'react';
import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Info, Octagon } from 'lucide-react';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const tonePalette: Record<AlertTone, { color: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = {
  info: { color: 'var(--info)', Icon: Info },
  success: { color: 'var(--success)', Icon: CheckCircle2 },
  warning: { color: 'var(--warning)', Icon: AlertTriangle },
  danger: { color: 'var(--danger)', Icon: Octagon },
};

type AlertProps = {
  tone?: AlertTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export default function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const palette = tonePalette[tone];
  const { color, Icon } = palette;

  const style: React.CSSProperties = {
    borderColor: `color-mix(in srgb, ${color} 42%, transparent)`,
    background: `color-mix(in srgb, ${color} 12%, transparent)`,
    color: `color-mix(in srgb, ${color} 82%, var(--fg))`,
  };

  return (
    <div
      role="status"
      className={clsx(
        'relative flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm backdrop-blur-sm',
        className,
      )}
      style={style}
    >
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="space-y-1">
        {title && <span className="block text-sm font-semibold leading-5">{title}</span>}
        {children && <span className="block leading-5 text-[color:inherit] opacity-90">{children}</span>}
      </span>
    </div>
  );
}
