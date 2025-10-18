export type SessionHistoryPerson = {
  id: string;
  name: string;
  email?: string | null;
};

export type SessionHistoryRow = {
  id: string;
  scheduledAt: string | null;
  startAt: string | null;
  endAt: string | null;
  durationMin: number | null;
  status: string | null;
  attendance: string | null;
  location: string | null;
  notes: string | null;
  trainer: SessionHistoryPerson | null;
  client: SessionHistoryPerson | null;
};

export type SessionHistoryDataset = {
  generatedAt: string;
  rows: SessionHistoryRow[];
};
