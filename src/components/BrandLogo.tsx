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
  const [useFallback, setUseFallback] = React.useState(false);
  const src = useFallback ? '/hms-personal-trainer.png' : '/branding/hms-personal-trainer.svg';

  return (
    <Image
      key={src}
      src={src}
      alt="HMS Personal Trainer"
      width={size}
      height={size}
      priority={priority}
      unoptimized={!useFallback}
      className={className}
      style={{ display: 'block', width: size, height: 'auto' }}
      onError={() => setUseFallback(true)}
    />
  );
}
