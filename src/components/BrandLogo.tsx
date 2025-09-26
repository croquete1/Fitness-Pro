// src/components/BrandLogo.tsx
'use client';
import * as React from 'react';
import Image from 'next/image';

export default function BrandLogo({ size = 56 }: { size?: number }) {
  return (
    <Image
      src="/logo.png" // garante que existe /public/logo.png
      alt="Fitness Pro"
      width={size}
      height={size}
      priority
      style={{ borderRadius: 12 }}
    />
  );
}
