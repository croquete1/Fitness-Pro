'use client';
import * as React from 'react';
import { brand } from '@/lib/brand';

export default function AppLogo({
  size = 28,
  className = '',
  title = brand.name,
}: { size?: number; className?: string; title?: string }) {
  return (
    <img
      src={brand.logoLight ?? '/branding/hms-personal-trainer.svg'}
      width={size}
      height={size}
      alt={title}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
    />
  );
}
