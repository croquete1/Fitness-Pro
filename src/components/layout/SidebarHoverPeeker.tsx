'use client';

import * as React from 'react';

// Este componente era um “hover zone” para expand temporário.
// Removemos a chamada a setPeek (não existe no contexto atual).
// Mantemos o componente como inócuo para evitar regressões e erros de import.

export default function SidebarHoverPeeker() {
  // Caso queiras reativar futuramente, podemos ligar a um estado interno
  // e expor via CSS (mas hoje o width vem do contexto colapsado/expandido).
  return null;
}
