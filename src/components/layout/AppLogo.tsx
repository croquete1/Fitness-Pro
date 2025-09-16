// src/components/layout/AppLogo.tsx
'use client';

import Image from 'next/image';
import React from 'react';

type Props = {
  size?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
};

const SRC = process.env.NEXT_PUBLIC_APP_LOGO || '/assets/logo.png';

export default function AppLogo({
  size = 40,
  alt = 'Logo',
  className = '',
  priority = true,
}: Props) {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div
        className={`grid place-items-center rounded-lg bg-slate-200 dark:bg-slate-800 font-bold ${className}`}
        style={{ width: size, height: size }}
        aria-label="Logo"
      >
        FP
      </div>
    );
  }

  return (
    <Image
      src={SRC}
      alt={alt}
      width={size}
      height={size}
      className={className}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
