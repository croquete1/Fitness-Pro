// src/components/layout/SidebarHoverPeeker.tsx
'use client';

import React from 'react';

export default function SidebarHoverPeeker() {
  // Uma pequena faixa fixa à esquerda que NÃO bloqueia quando a sidebar está afixada
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: '0 auto 0 0',
        width: '10px',
        zIndex: 80,
        // só ativa quando colapsada e não afixada
        pointerEvents: 'auto',
      }}
      className="fp-sb-peeker"
      // Não precisamos JS: o :hover do .fp-sb-flyout já abre;
      // esta faixa apenas facilita atingir a área quando a sidebar está encostada.
    />
  );
}
