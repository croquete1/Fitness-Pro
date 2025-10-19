import { buildMessagesDashboard } from '@/lib/messages/dashboard';
import type { MessageRecord, MessagesDashboardData } from '@/lib/messages/types';

function addMinutes(base: Date, minutes: number): Date {
  return new Date(base.getTime() + minutes * 60_000);
}

function subtractMinutes(base: Date, minutes: number): Date {
  return new Date(base.getTime() - minutes * 60_000);
}

function iso(date: Date): string {
  return date.toISOString();
}

type Participant = { id: string; name: string; channel: string };

const PARTICIPANTS: Participant[] = [
  { id: 'client-ana-marques', name: 'Ana Marques', channel: 'whatsapp' },
  { id: 'client-joao-pires', name: 'João Pires', channel: 'in-app' },
  { id: 'client-maria-costa', name: 'Maria Costa', channel: 'email' },
  { id: 'client-ricardo-fonseca', name: 'Ricardo Fonseca', channel: 'sms' },
  { id: 'client-sara-nogueira', name: 'Sara Nogueira', channel: 'call' },
  { id: 'client-beatriz-lemos', name: 'Beatriz Lemos', channel: 'social' },
];

function buildConversation(
  viewerId: string,
  participant: Participant,
  opts: { base: Date; seed: number },
): MessageRecord[] {
  const { base, seed } = opts;
  const records: MessageRecord[] = [];
  const baseDay = subtractMinutes(base, seed * 360);
  const greeting = subtractMinutes(baseDay, 120);
  const followUp = addMinutes(greeting, 35);
  const workout = addMinutes(baseDay, 90);
  const recap = addMinutes(baseDay, 240);
  const pending = addMinutes(baseDay, 24 * 60 + 60);

  records.push({
    id: `${participant.id}-msg-1`,
    body: `Olá ${participant.name.split(' ')[0]}, tudo pronto para a sessão desta semana?`,
    sentAt: iso(greeting),
    fromId: viewerId,
    toId: participant.id,
    fromName: 'Equipa PT Neo',
    toName: participant.name,
    channel: participant.channel,
  });

  records.push({
    id: `${participant.id}-msg-2`,
    body: 'Sim, podemos focar em reforço de core e mobilidade? Tenho sentido melhorias!',
    sentAt: iso(addMinutes(greeting, 18)),
    fromId: participant.id,
    toId: viewerId,
    fromName: participant.name,
    toName: 'Equipa PT Neo',
    channel: participant.channel,
  });

  records.push({
    id: `${participant.id}-msg-3`,
    body: 'Perfeito, ajustei o plano e já tens o aquecimento actualizado na app. Dá feedback depois da sessão ✅',
    sentAt: iso(followUp),
    fromId: viewerId,
    toId: participant.id,
    fromName: 'Equipa PT Neo',
    toName: participant.name,
    channel: participant.channel,
  });

  records.push({
    id: `${participant.id}-msg-4`,
    body: 'Sessão concluída! Hoje fizemos 3 rondas completas e senti o cardio em alta.',
    sentAt: iso(workout),
    fromId: participant.id,
    toId: viewerId,
    fromName: participant.name,
    toName: 'Equipa PT Neo',
    channel: participant.channel,
  });

  records.push({
    id: `${participant.id}-msg-5`,
    body: 'Excelente! Amanhã envio-te o resumo com métricas e notas de recuperação. Alguma dor ou desconforto? ',
    sentAt: iso(addMinutes(workout, 22)),
    fromId: viewerId,
    toId: participant.id,
    fromName: 'Equipa PT Neo',
    toName: participant.name,
    channel: participant.channel,
  });

  records.push({
    id: `${participant.id}-msg-6`,
    body: 'Apenas um pouco de tensão nos ombros, mas nada preocupante. Obrigado pelo acompanhamento!',
    sentAt: iso(recap),
    fromId: participant.id,
    toId: viewerId,
    fromName: participant.name,
    toName: 'Equipa PT Neo',
    channel: participant.channel,
  });

  records.push({
    id: `${participant.id}-msg-7`,
    body: 'Registado, vou acrescentar alongamentos específicos e uma massagem de relaxamento na próxima semana. ',
    sentAt: iso(addMinutes(recap, 30)),
    fromId: viewerId,
    toId: participant.id,
    fromName: 'Equipa PT Neo',
    toName: participant.name,
    channel: participant.channel,
  });

  if (seed % 2 === 0) {
    records.push({
      id: `${participant.id}-msg-8`,
      body: 'Obrigada! Consegues enviar-me também as recomendações nutricionais para manter o ritmo? ',
      sentAt: iso(addMinutes(recap, 60)),
      fromId: participant.id,
      toId: viewerId,
      fromName: participant.name,
      toName: 'Equipa PT Neo',
      channel: participant.channel,
    });

    records.push({
      id: `${participant.id}-msg-9`,
      body: 'Claro! Já tens uma checklist com sugestões de refeições e hidratação na app. Diz-me se precisares de ajustes.',
      sentAt: iso(addMinutes(recap, 95)),
      fromId: viewerId,
      toId: participant.id,
      fromName: 'Equipa PT Neo',
      toName: participant.name,
      channel: participant.channel,
    });
  } else {
    records.push({
      id: `${participant.id}-msg-8`,
      body: 'Fica combinado! Falamos amanhã para alinhar a semana. Qualquer dúvida responde a esta mensagem. ',
      sentAt: iso(pending),
      fromId: participant.id,
      toId: viewerId,
      fromName: participant.name,
      toName: 'Equipa PT Neo',
      channel: participant.channel,
    });
  }

  return records;
}

export function getMessagesDashboardFallback(
  viewerId: string,
  rangeDays = 14,
): MessagesDashboardData {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 45, 0, 0);
  const allRecords: MessageRecord[] = [];

  PARTICIPANTS.forEach((participant, index) => {
    const records = buildConversation(viewerId, participant, { base: subtractMinutes(base, index * 180), seed: index + 1 });
    allRecords.push(...records);
  });

  // conversas adicionais recentes
  const urgent = subtractMinutes(base, 180);
  allRecords.push(
    {
      id: 'client-diogo-rocha-msg-1',
      body: 'Bom dia! Podemos reagendar a sessão de força para quinta às 07h30?',
      sentAt: iso(urgent),
      fromId: 'client-diogo-rocha',
      toId: viewerId,
      fromName: 'Diogo Rocha',
      toName: 'Equipa PT Neo',
      channel: 'in-app',
    },
    {
      id: 'client-diogo-rocha-msg-2',
      body: 'Confirmado! Já actualizei no calendário e enviei-te a nova convocatória. Até lá! 💪',
      sentAt: iso(addMinutes(urgent, 14)),
      fromId: viewerId,
      toId: 'client-diogo-rocha',
      fromName: 'Equipa PT Neo',
      toName: 'Diogo Rocha',
      channel: 'in-app',
    },
  );

  return buildMessagesDashboard(allRecords, { viewerId, now, rangeDays });
}

export const fallbackMessagesDashboard = getMessagesDashboardFallback('viewer-demo');
