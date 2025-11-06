import type { SessionHistoryDataset } from '@/lib/history/types';

/**
 * Fallback neutro para o histórico de sessões. Quando a app está offline ou
 * a chamada ao servidor falha devolvemos um payload vazio para evitar dados
 * fictícios.
 */
export function getEmptySessionHistory(): SessionHistoryDataset {
  return {
    generatedAt: new Date().toISOString(),
    rows: [],
  };
}

// Compatibilidade: exporta o nome antigo enquanto eliminamos referências ao
// dataset com dados fictícios.
export const getSampleSessionHistory = getEmptySessionHistory;
