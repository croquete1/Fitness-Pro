// src/components/BrandLogo.tsx
'use client';
import * as React from 'react';
import Image from 'next/image';
import { brandFallbackLogos, resolveBrandLogos } from '@/lib/brand';

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
  alt?: string | null;
};

export default function BrandLogo({ size = 56, className, priority = false, alt }: Props) {
  const candidates = React.useMemo(() => resolveBrandLogos('any'), []);
  const [index, setIndex] = React.useState(0);
  const src = candidates[index] ?? brandFallbackLogos.light;

  const altText = alt ?? '';
  const isDecorative = altText.trim().length === 0;

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
      alt={altText}
      aria-hidden={isDecorative ? true : undefined}
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={className}
      style={{ display: 'block', width: size, height: 'auto' }}
      onError={handleLogoError}
      draggable={false}
    />
  );
}
