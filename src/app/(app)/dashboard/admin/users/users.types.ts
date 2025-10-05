export type Role = string;   // 'admin' | 'pt' | 'trainer' | 'client' | ...
export type Status = string; // 'active' | 'pending' | 'blocked' | ...

export type Row = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role | null;
  status: Status | null;
  approved: boolean;
  active: boolean;
  created_at: string | null;
};
