import { createRequire } from 'module';
import type { ComponentType } from 'react';
import React from 'react';

const require = createRequire(import.meta.url);

let Impl: ComponentType | null = null;

try {
  const mod = require('@vercel/speed-insights/next') as {
    SpeedInsights?: ComponentType;
    default?: ComponentType;
  };
  Impl = mod.SpeedInsights ?? mod.default ?? null;
} catch (error) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[SpeedInsights] módulo não encontrado; ignorado.', error);
  }
  Impl = null;
}

export default function OptionalSpeedInsights() {
  if (!Impl) {
    return null;
  }

  const Component = Impl;
  return <Component />;
}
