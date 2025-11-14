// src/lib/messages/chatTypes.ts
// Tipos partilhados entre servidor e cliente para o chat de mensagens.

export type ChatViewerRole = 'CLIENT' | 'PT' | 'ADMIN' | 'UNKNOWN';

export type ChatAttachmentKind = 'image' | 'file';

export type ChatAttachment = {
  id: string;
  name: string;
  url: string | null;
  contentType: string | null;
  size: number | null;
  isEphemeral: boolean;
  expiresAt: string | null;
  expired: boolean;
  kind: ChatAttachmentKind;
};

export type ChatMessageDirection = 'inbound' | 'outbound';

export type ChatMessage = {
  id: string;
  threadId: string;
  fromId: string;
  toId: string | null;
  body: string | null;
  sentAt: string | null;
  readAt: string | null;
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
  direction: ChatMessageDirection;
  attachments: ChatAttachment[];
};

export type ChatThread = {
  id: string;
  clientId: string;
  trainerId: string;
  counterpartId: string;
  counterpartRole: ChatViewerRole;
  counterpartName: string;
  counterpartAvatarUrl: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
};

export type ChatThreadSummary = ChatThread & {
  unreadCount: number;
  status: 'active' | 'archived';
};

export type ChatParticipant = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: ChatViewerRole;
  hasThread: boolean;
  threadId: string | null;
};

export type ChatThreadListResponse = {
  ok: true;
  viewerId: string;
  threads: ChatThreadSummary[];
  participants: ChatParticipant[];
};

export type ChatThreadResponse = {
  ok: true;
  viewerId: string;
  thread: ChatThread;
  messages: ChatMessage[];
  participants: ChatParticipant[];
};

export type ChatErrorResponse = {
  ok: false;
  error: string;
  message?: string;
};

export type ChatSendAttachmentMeta = {
  file: File;
  isEphemeral: boolean;
};
