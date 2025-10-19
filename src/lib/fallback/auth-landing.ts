import type {
  LandingActivity,
  LandingHighlight,
  LandingMetric,
  LandingSummary,
  LandingTimelinePoint,
} from '@/lib/public/landing/types';

const numberFormatter = new Intl.NumberFormat('pt-PT');
const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function iso(date: Date): string {
  return date.toISOString();
}

function relative(date: Date, now: Date): string {
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute');
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  }
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, 'day');
}

function buildTimeline(now: Date): LandingTimelinePoint[] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 7 * 7);

  const labels = [
    { clients: 6, sessions: 42, revenue: 3200 },
    { clients: 7, sessions: 45, revenue: 3520 },
    { clients: 5, sessions: 48, revenue: 3610 },
    { clients: 9, sessions: 53, revenue: 3880 },
    { clients: 10, sessions: 57, revenue: 4125 },
    { clients: 11, sessions: 60, revenue: 4370 },
    { clients: 9, sessions: 63, revenue: 4510 },
    { clients: 12, sessions: 68, revenue: 4895 },
  ];

  const fmt = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });

  return labels.map((sample, index) => {
    const bucketStart = new Date(start.getTime() + index * 7 * 86400000);
    const bucketEnd = new Date(bucketStart.getTime() + 6 * 86400000);
    const label = `${fmt.format(bucketStart)} – ${fmt.format(bucketEnd)}`;
    return {
      bucket: `${bucketStart.toISOString().slice(0, 10)}`,
      label,
      clients: sample.clients,
      sessions: sample.sessions,
      revenue: sample.revenue,
    };
  });
}

function buildMetrics(): LandingMetric[] {
  return [
    {
      id: 'active-clients',
      label: 'Clientes ativos',
      value: numberFormatter.format(186),
      hint: '+28 novos nos últimos 30 dias',
      trend: '+17% face ao período anterior',
      tone: 'up',
    },
    {
      id: 'active-trainers',
      label: 'PTs envolvidos',
      value: numberFormatter.format(24),
      hint: 'Taxa de retenção 96%',
      trend: 'Estável',
      tone: 'neutral',
    },
    {
      id: 'sessions',
      label: 'Sessões concluídas (30d)',
      value: numberFormatter.format(412),
      hint: 'Taxa de presença 82%',
      trend: '+9% face a 30d',
      tone: 'up',
    },
    {
      id: 'revenue',
      label: 'Faturação paga (30d)',
      value: currencyFormatter.format(18240),
      hint: 'Ticket médio €44,25',
      trend: '+6% face a 30d',
      tone: 'up',
    },
  ];
}

function buildHighlights(): LandingHighlight[] {
  return [
    {
      id: 'attendance',
      title: 'Assiduidade sólida',
      description: '82% das sessões agendadas foram concluídas com sucesso nos últimos 30 dias.',
      meta: 'Meta: >= 75%',
      tone: 'positive',
    },
    {
      id: 'retention',
      title: 'Retenção de PTs',
      description: 'A equipa mantém 96% de PTs ativos com carga consistente acima de 12h/semana.',
      meta: '12h médias por PT',
      tone: 'informative',
    },
    {
      id: 'requests',
      title: 'Pedidos ágeis',
      description: '92% dos pedidos de remarcação são respondidos em menos de 12h.',
      meta: 'Objetivo < 18h',
      tone: 'positive',
    },
  ];
}

function buildActivities(now: Date): LandingActivity[] {
  const base = new Date(now);
  return [
    {
      id: 'act-1',
      title: 'Fatura liquidada',
      description: 'Plano Premium PT 12 Sessões pago via MB Way (€240,00).',
      occurredAt: iso(new Date(base.getTime() - 2 * 3600000)),
      relativeTime: relative(new Date(base.getTime() - 2 * 3600000), now),
      tone: 'success',
    },
    {
      id: 'act-2',
      title: 'Sessão concluída',
      description: 'Treino funcional avançado com taxa de esforço alta.',
      occurredAt: iso(new Date(base.getTime() - 6 * 3600000)),
      relativeTime: relative(new Date(base.getTime() - 6 * 3600000), now),
      tone: 'success',
    },
    {
      id: 'act-3',
      title: 'Novo cliente registado',
      description: 'Inscrição cliente corporativo “Ricardo Fonseca”.',
      occurredAt: iso(new Date(base.getTime() - 14 * 3600000)),
      relativeTime: relative(new Date(base.getTime() - 14 * 3600000), now),
      tone: 'neutral',
    },
    {
      id: 'act-4',
      title: 'Pedido confirmado',
      description: 'Remarcação aceite para sessão HIIT de sábado.',
      occurredAt: iso(new Date(base.getTime() - 26 * 3600000)),
      relativeTime: relative(new Date(base.getTime() - 26 * 3600000), now),
      tone: 'success',
    },
    {
      id: 'act-5',
      title: 'Fatura pendente',
      description: 'Reavaliação Bioimpedância a aguardar pagamento (€25,00).',
      occurredAt: iso(new Date(base.getTime() - 3 * 86400000)),
      relativeTime: relative(new Date(base.getTime() - 3 * 86400000), now),
      tone: 'danger',
    },
  ];
}

export function getFallbackLandingSummary(now: Date = new Date()): LandingSummary {
  return {
    ok: true,
    source: 'fallback',
    generatedAt: iso(now),
    metrics: buildMetrics(),
    timeline: buildTimeline(now),
    highlights: buildHighlights(),
    activities: buildActivities(now),
  };
}
