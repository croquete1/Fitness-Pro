// src/components/BrandLogo.tsx
'use client';
import * as React from 'react';
import Image from 'next/image';
import { brand, brandFallbackLogos, resolveBrandLogos } from '@/lib/brand';

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({ size = 56, className, priority = false }: Props) {
  const candidates = React.useMemo(() => resolveBrandLogos('any'), []);
  const [index, setIndex] = React.useState(0);
  const src = candidates[index] ?? brandFallbackLogos.light;

  const handleLogoError = React.useCallback(() => {
    setIndex((prev) => {
      if (prev + 1 < candidates.length) {
        return prev + 1;
      }
      return prev;
    });
  }, [candidates]);

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
      onError={handleLogoError}
    />
  );
}
