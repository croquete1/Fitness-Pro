export type LandingMetricTone = 'up' | 'down' | 'neutral';
export type LandingHighlightTone = 'positive' | 'informative' | 'warning';

export type LandingMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  trend?: string;
  tone?: LandingMetricTone;
};

export type LandingHighlight = {
  id: string;
  title: string;
  description: string;
  meta?: string;
  tone?: LandingHighlightTone;
};

export type LandingTimelinePoint = {
  bucket: string;
  label: string;
  clients: number;
  sessions: number;
  revenue: number;
};

export type LandingActivity = {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  relativeTime: string;
  tone?: 'success' | 'neutral' | 'danger';
};

export type LandingSummary = {
  ok: true;
  source: 'live' | 'fallback';
  generatedAt: string;
  metrics: LandingMetric[];
  timeline: LandingTimelinePoint[];
  highlights: LandingHighlight[];
  activities: LandingActivity[];
};

export type LandingResponse = LandingSummary;
