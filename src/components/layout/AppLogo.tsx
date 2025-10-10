'use client';
import * as React from 'react';

export default function AppLogo({
  size = 28,
  className = '',
  title = 'Fitness Pro',
}: { size?: number; className?: string; title?: string }) {
  return (
    <img
      src="/branding/hms-personal-trainer.svg"
      width={size}
      height={size}
      alt={title}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
    />
  );
}
