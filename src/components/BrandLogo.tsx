// src/components/BrandLogo.tsx
'use client';
import * as React from 'react';
import Image from 'next/image';
import { brand } from '@/lib/brand';

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({ size = 56, className, priority = false }: Props) {
  const [useFallback, setUseFallback] = React.useState(false);
  const primary = brand.logoLight ?? '/branding/hms-personal-trainer.svg';
  const fallback = brand.logoDark ?? '/brand/hms-logo-light.png';
  const src = useFallback ? fallback : primary;

  return (
    <Image
      key={src}
      src={src}
      alt={brand.name}
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={className}
      style={{ display: 'block', width: size, height: 'auto' }}
      onError={() => {
        if (!useFallback) {
          setUseFallback(true);
        }
      }}
    />
  );
}
