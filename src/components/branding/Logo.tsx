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

export default function Logo({ size = 28, className, alt = 'HMS Personal Trainer', src }: Props) {
  const [failed, setFailed] = React.useState(false);
  const url = src ?? '/branding/hms-personal-trainer.svg';

  if (failed) {
    return (
      <div className={className} aria-label={alt} title={alt} style={{ fontWeight: 700 }}>
        HMS
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
