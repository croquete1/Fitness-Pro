export type PlanFeedbackScope = 'plan' | 'days' | 'exercises';

export type PlanFeedbackEntry = {
  id: string;
  scope: PlanFeedbackScope;
  planId: string | null;
  planTitle: string | null;
  targetLabel: string | null;
  comment: string;
  createdAt: string | null;
  mood?: 'positive' | 'negative' | 'neutral' | 'warning';
};

export type PlanFeedbackDashboard = {
  source: 'supabase' | 'fallback';
  updatedAt: string | null;
  plan: PlanFeedbackEntry[];
  days: PlanFeedbackEntry[];
  exercises: PlanFeedbackEntry[];
};
