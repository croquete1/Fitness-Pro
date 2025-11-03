// src/components/layout/MainContent.tsx
'use client';

import * as React from 'react';
import { NeoMainContainer } from '@/components/layout/NeoMainContainer';

type Props = {
  children: React.ReactNode;
  /** Ajusta facilmente o content width da página */
  maxWidth?: 'xl' | 'lg' | 'md' | 'sm' | false;
  /** Útil para páginas full-bleed (grids, etc.) */
  disableGutters?: boolean;
  /** Espaçamento vertical entre blocos */
  spacing?: number;
};

export default function MainContent({
  children,
  maxWidth = 'xl',
  disableGutters = false,
  spacing = 2,
}: Props) {
  return (
    <NeoMainContainer maxWidth={maxWidth} disableGutters={disableGutters} spacing={spacing}>
      {children}
    </NeoMainContainer>
  );
}
