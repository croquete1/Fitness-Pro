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

function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function getSampleAdminRoster(): SampleRosterPayload {
  const assignments: SampleRosterAssignment[] = [
    {
      id: 'assign-ines',
      trainer_id: 'trainer-ines',
      trainer_name: 'Inês Costa',
      trainer_focus: 'HIIT & Mobilidade',
      status: 'active',
      shift: 'manhã',
      clients_count: 12,
      highlighted_client_id: 'client-bruno',
      highlighted_client_name: 'Bruno Mota',
      next_check_in_at: minutesFromNow(90),
      load_level: 'Alta',
      tags: ['Premium', 'Reabilitação'],
      last_synced_at: minutesAgo(42),
    },
    {
      id: 'assign-diego',
      trainer_id: 'trainer-diogo',
      trainer_name: 'Diogo Faria',
      trainer_focus: 'Força & Hipertrofia',
      status: 'onboarding',
      shift: 'tarde',
      clients_count: 8,
      highlighted_client_id: 'client-helena',
      highlighted_client_name: 'Helena Duarte',
      next_check_in_at: minutesFromNow(300),
      load_level: 'Moderada',
      tags: ['Onboarding'],
      last_synced_at: minutesAgo(60),
    },
    {
      id: 'assign-raquel',
      trainer_id: 'trainer-raquel',
      trainer_name: 'Raquel Santos',
      trainer_focus: 'Wellness & Mindfulness',
      status: 'active',
      shift: 'manhã',
      clients_count: 10,
      highlighted_client_id: 'client-sara',
      highlighted_client_name: 'Sara Oliveira',
      next_check_in_at: minutesFromNow(18 * 60),
      load_level: 'Equilibrada',
      tags: ['Corporate'],
      last_synced_at: minutesAgo(18),
    },
    {
      id: 'assign-mateus',
      trainer_id: 'trainer-mateus',
      trainer_name: 'Mateus Ribeiro',
      trainer_focus: 'Performance Atleta',
      status: 'paused',
      shift: 'noite',
      clients_count: 6,
      highlighted_client_id: null,
      highlighted_client_name: 'Equipa Sub23',
      next_check_in_at: null,
      load_level: 'Revisão',
      tags: ['Equipa'],
      last_synced_at: minutesAgo(180),
    },
    {
      id: 'assign-lara',
      trainer_id: 'trainer-lara',
      trainer_name: 'Lara Mendes',
      trainer_focus: 'Pilates & Mobilidade',
      status: 'active',
      shift: 'tarde',
      clients_count: 11,
      highlighted_client_id: 'client-carina',
      highlighted_client_name: 'Carina Lopes',
      next_check_in_at: minutesFromNow(255),
      load_level: 'Alta',
      tags: ['Studio'],
      last_synced_at: minutesAgo(27),
    },
  ];

  const timeline: SampleRosterEvent[] = [
    {
      id: 'slot-1',
      assignment_id: 'assign-ines',
      owner_id: 'trainer-ines',
      owner_name: 'Inês Costa',
      title: 'Check-in premium',
      detail: 'Follow-up com Bruno Mota',
      scheduled_at: minutesFromNow(90),
    },
    {
      id: 'slot-2',
      assignment_id: 'assign-raquel',
      owner_id: 'trainer-raquel',
      owner_name: 'Raquel Santos',
      title: 'Sessão corporativa',
      detail: 'Workshop “Pausa activa”',
      scheduled_at: minutesFromNow(180),
    },
    {
      id: 'slot-3',
      assignment_id: 'assign-mateus',
      owner_id: 'trainer-mateus',
      owner_name: 'Mateus Ribeiro',
      title: 'Revisão planos atleta',
      detail: 'Equipa Sub23 · novo calendário',
      scheduled_at: minutesFromNow(8 * 60 + 15),
    },
  ];

  return {
    assignments,
    timeline,
    count: assignments.length,
  };
}
