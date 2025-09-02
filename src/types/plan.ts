// Type partilhado para linhas de plano em listas/tabelas.
// Mantém os campos usados pelos componentes como opcionais
// para evitar erros de compilação se algum estiver ausente.
// Podes ajustar/estreitar conforme fores consolidando o modelo.

export type PlanRow = {
  id: string;

  // Identidades
  clientId?: string | null;
  clientName?: string | null;
  trainerId?: string | null;
  trainerName?: string | null;

  // Metadados do plano
  title?: string | null;
  status?: 'ACTIVE' | 'PAUSED' | 'ENDED' | string | null;

  // Datas (ISO strings)
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  // Campo “escape hatch” para evitar erros enquanto alinhas tudo
  [key: string]: any;
};