'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { useSidebar } from '@/components/layout/SidebarProvider';

/**
 * Uma faixa muito fina no extremo esquerdo do ecrã (desktop) que,
 * quando “hovered”, abre temporariamente (peek) a sidebar colapsada.
 * Não altera `collapsed` permanentemente — é só enquanto o cursor está lá.
 *
 * Coloca este componente uma vez dentro do teu layout (ex.: no DashboardFrame),
 * preferencialmente logo a seguir ao <RoleSidebar/>.
 */
export default function SidebarHoverPeeker() {
  const { setPeek } = useSidebar();

  return (
    <Box
      onMouseEnter={() => setPeek(true)}
      onMouseLeave={() => setPeek(false)}
      sx={{
        display: { xs: 'none', lg: 'block' },
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 10,               // estreitinho e inócuo
        zIndex: 1200,            // acima do conteúdo, abaixo de modais
        pointerEvents: 'auto',
        // invisível mas “clicável” para hover
        background: 'transparent',
      }}
    />
  );
}
