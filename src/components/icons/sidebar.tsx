// src/components/icons/sidebar.tsx
import * as React from 'react';

type SvgProps = React.SVGProps<SVGSVGElement>;
const common = { width: 18, height: 18, viewBox: '0 0 24 24' } as const;

export function IconDashboard(props: SvgProps) {
  return (
    <svg {...common} {...props} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h7v7H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 13h7v7H4z" />
    </svg>
  );
}

export function IconReports(props: SvgProps) {
  return (
    <svg {...common} {...props} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-6M20 20V8" />
    </svg>
  );
}

export function IconSettings(props: SvgProps) {
  return (
    <svg {...common} {...props} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a7.97 7.97 0 0 0 .1-2 7.97 7.97 0 0 0-.1-2l2.1-1.6-2-3.4-2.5.6a8.2 8.2 0 0 0-1.7-1L12 2 9.7 3.6a8.2 8.2 0 0 0-1.7 1l-2.5-.6-2 3.4L5.6 9a7.97 7.97 0 0 0-.1 2 7.97 7.97 0 0 0 .1 2l-2.1 1.6 2 3.4 2.5-.6c.54.4 1.11.75 1.7 1L12 22l2.3-1.6c.59-.25 1.16-.6 1.7-1l2.5.6 2-3.4L19.4 15Z" />
    </svg>
  );
}

export function IconApprovals(props: SvgProps) {
  return (
    <svg {...common} {...props} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 13.7 7.8 15l.8-4.7L5.2 7l4.7-.7L12 2Z" />
      <path d="m9.5 11.5 1.7 1.7 3.3-3.3" />
    </svg>
  );
}

export function IconUsers(props: SvgProps) {
  return (
    <svg {...common} {...props} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="8" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconHealth(props: SvgProps) {
  return (
    <svg {...common} {...props} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l2-5 4 10 2-5h4" />
    </svg>
  );
}

export function IconBilling(props: SvgProps) {
  return (
    <svg {...common} {...props} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

export function IconCalendar(props: SvgProps) {
  return (
    <svg {...common} {...props} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function IconBell(props: SvgProps) {
  return (
    <svg {...common} {...props} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function IconDumbbell(props: SvgProps) {
  return (
    <svg {...common} {...props} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9h3v6H2zM19 9h3v6h-3zM7 10h10v4H7zM5 8v8M19 8v8" />
    </svg>
  );
}

export function IconClient(props: SvgProps) {
  return (
    <svg {...common} {...props} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}
