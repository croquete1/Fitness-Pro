// src/components/layout/AppLogo.tsx
'use client';
import Image from 'next/image';
import React from 'react';

type Props = { size?: number; className?: string; alt?: string; priority?: boolean };
const SRC = process.env.NEXT_PUBLIC_APP_LOGO || '/assets/logo.png';

export default function AppLogo({ size = 40, className = '', alt = 'Fitness Pro', priority = true }: Props) {
  const [ok, setOk] = React.useState(true);
  return ok ? (
    <Image
      src={SRC}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={className}
      onError={() => setOk(false)}
    />
  ) : (
    <div
      className={`grid place-items-center rounded-lg bg-slate-200 dark:bg-slate-800 font-bold ${className}`}
      style={{ width: size, height: size }}
      aria-label="Logo fallback"
      title="Logo"
    >
      {/* Fallback minimalista; deverá raramente aparecer */}
      <span>FP</span>
    </div>
  );
}
