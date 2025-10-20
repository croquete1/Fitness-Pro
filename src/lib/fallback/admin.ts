export type SampleRosterAssignment = {
  id: string;
  trainer_id: string;
  trainer_name: string;
  trainer_focus: string | null;
  status: string;
  shift: string;
  clients_count: number;
  highlighted_client_id: string | null;
  highlighted_client_name: string | null;
  next_check_in_at: string | null;
  load_level: string | null;
  tags: string[];
  last_synced_at: string | null;
  metadata?: Record<string, unknown>;
};

export type SampleRosterEvent = {
  id: string;
  assignment_id: string | null;
  owner_id: string | null;
  owner_name: string | null;
  title: string;
  detail: string | null;
  scheduled_at: string | null;
};

export type SampleRosterPayload = {
  assignments: SampleRosterAssignment[];
  timeline: SampleRosterEvent[];
  count: number;
};

/**
 * Fallback mínimo quando o Supabase não está configurado.
 * Mantém a aplicação estável sem apresentar dados fictícios.
 */
export function getSampleAdminRoster(): SampleRosterPayload {
  return {
    assignments: [],
    timeline: [],
    count: 0,
  };
}
