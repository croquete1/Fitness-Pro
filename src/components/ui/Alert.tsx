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

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
};

export default function Alert({
  tone = 'info',
  title,
  children,
  className,
  style,
  role,
  ...rest
}: AlertProps) {
  const palette = tonePalette[tone];
  const { color, Icon } = palette;

  const mergedStyle: React.CSSProperties = {
    ['--alert-color' as string]: color,
    ...(style ?? {}),
  };

  return (
    <div
      role={role ?? 'status'}
      className={clsx('neo-alert', className)}
      data-tone={tone}
      style={mergedStyle}
      {...rest}
    >
      <span className="neo-alert__icon" aria-hidden>
        <Icon className="neo-alert__iconSvg" aria-hidden />
      </span>
      <span className="neo-alert__content">
        {title && <span className="neo-alert__title">{title}</span>}
        {children && <span className="neo-alert__message">{children}</span>}
      </span>
    </div>
  );
}
