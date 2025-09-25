// src/components/branding/Logo.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';

type Props = {
  size?: number;
  className?: string;
  alt?: string;
  src?: string; // permite override (ex.: /branding/logo.svg)
};

export default function Logo({ size = 28, className, alt = 'Fitness Pro', src }: Props) {
  const [failed, setFailed] = React.useState(false);
  const url = src ?? '/logo.png'; // por omissão usa /public/logo.png

  if (failed) {
    return (
      <div className={className} aria-label={alt} title={alt} style={{ fontWeight: 700 }}>
        Fitness&nbsp;Pro
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={size}
      height={size}
      priority
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
