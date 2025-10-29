export type MessageChannelKey =
  | 'in-app'
  | 'whatsapp'
  | 'email'
  | 'sms'
  | 'call'
  | 'social'
  | 'unknown';

export type MessageDirection = 'inbound' | 'outbound' | 'internal';

export type MessageRecord = {
  id: string;
  body: string | null;
  sentAt: string | null;
  fromId: string | null;
  toId: string | null;
  fromName?: string | null;
  toName?: string | null;
  channel?: string | null;
  status?: string | null;
  readAt?: string | null;
  replyToId?: string | null;
};

export type MessageTimelinePoint = {
  day: string;
  label: string;
  inbound: number;
  outbound: number;
  replies: number;
};

export type MessageHeroMetric = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  trend?: string | null;
  tone?: 'positive' | 'warning' | 'critical' | 'info' | 'neutral';
};

export type MessageDistributionSegment = {
  key: MessageChannelKey;
  label: string;
  value: number;
  percentage: number;
  tone?: 'positive' | 'warning' | 'critical' | 'info' | 'neutral';
};

export type MessageHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning' | 'critical' | 'info' | 'neutral';
  value: string;
  meta?: string;
};

export type MessageConversationRow = {
  id: string;
  counterpartId: string | null;
  counterpartName: string;
  totalMessages: number;
  inbound: number;
  outbound: number;
  internal: number;
  lastDirection: MessageDirection;
  lastMessageAt: string | null;
  averageResponseMinutes: number | null;
  pendingResponses: number;
  mainChannel: MessageChannelKey;
  mainChannelLabel: string;
};

export type MessageListRow = {
  id: string;
  body: string | null;
  sentAt: string | null;
  relative: string | null;
  fromId: string | null;
  toId: string | null;
  fromName: string | null;
  toName: string | null;
  direction: MessageDirection;
  channel: MessageChannelKey;
  channelLabel: string;
  responseMinutes: number | null;
};

export type MessagesDashboardData = {
  generatedAt: string;
  viewerId: string;
  range: {
    days: number;
    since: string;
    until: string;
    label: string;
  };
  totals: {
    inbound: number;
    outbound: number;
    internal: number;
    replies: number;
    participants: number;
    pendingResponses: number;
  };
  hero: MessageHeroMetric[];
  timeline: MessageTimelinePoint[];
  distribution: MessageDistributionSegment[];
  highlights: MessageHighlight[];
  conversations: MessageConversationRow[];
  messages: MessageListRow[];
};
