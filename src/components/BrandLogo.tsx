// src/components/BrandLogo.tsx
'use client';
import * as React from 'react';
import Image from 'next/image';

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({ size = 56, className, priority = false }: Props) {
  return (
    <Image
      src="/branding/hms-logo.svg"
      alt="HMS Personal Trainer"
      width={size}
      height={size}
      priority={priority}
      className={className}
      style={{ display: 'block' }}
    />
  );
}
