// src/lib/messages/chatServer.ts
// Funções de apoio em ambiente servidor para alimentar o chat cliente ↔ PT.

import { randomUUID } from 'node:crypto';
import { createServerClient, isSupabaseConfigured } from '@/lib/supabaseServer';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { isClient, isTrainer, isAdmin } from '@/lib/roles';
import { isSkippableSchemaError } from '@/lib/supabase/errors';
import type {
  ChatAttachment,
  ChatParticipant,
  ChatSendAttachmentMeta,
  ChatThread,
  ChatThreadListResponse,
  ChatThreadResponse,
  ChatViewerRole,
  ChatThreadSummary,
  ChatMessage,
} from './chatTypes';

const ATTACHMENT_BUCKET = 'message-attachments';
const ATTACHMENT_MAX_COUNT = 5;
const ATTACHMENT_MAX_SIZE = 15 * 1024 * 1024; // 15 MB
const SIGNED_URL_TTL_SECONDS = 3600; // 1h padrão
const EPHEMERAL_TTL_HOURS = 24;

const ALLOWED_STATIC_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

function ensureViewerRole(role: unknown): ChatViewerRole {
  if (isClient(role)) return 'CLIENT';
  if (isTrainer(role)) return 'PT';
  if (isAdmin(role)) return 'ADMIN';
  return 'UNKNOWN';
}

function isImageType(type: string | null | undefined): boolean {
  if (!type) return false;
  return type.startsWith('image/');
}

function isAllowedAttachmentType(type: string | null | undefined): boolean {
  if (!type) return false;
  if (isImageType(type)) return true;
  return ALLOWED_STATIC_TYPES.has(type);
}

function sanitizeFileName(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/[^\w\s.()-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
      .slice(0, 120) || 'anexo'
  );
}

type Supabase = SupabaseClient<Database>;

type MessageThreadRow = Database['public']['Tables']['message_threads']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];
type AttachmentRow = Database['public']['Tables']['message_attachments']['Row'];
type MessageRowWithAttachments = MessageRow & { message_attachments?: AttachmentRow[] | null };

type EnsureThreadResult = {
  thread: MessageThreadRow;
  clientId: string;
  trainerId: string;
  counterpartId: string;
  counterpartRole: ChatViewerRole;
  created: boolean;
};

type EnsureThreadOptions = {
  threadId?: string | null;
  counterpartId?: string | null;
  createIfMissing?: boolean;
};

async function loadThreadById(client: Supabase, threadId: string): Promise<MessageThreadRow | null> {
  const { data } = await client
    .from('message_threads')
    .select('*')
    .eq('id', threadId)
    .maybeSingle();
  return (data as MessageThreadRow | null) ?? null;
}

async function loadThreadByPair(client: Supabase, clientId: string, trainerId: string): Promise<MessageThreadRow | null> {
  const { data } = await client
    .from('message_threads')
    .select('*')
    .eq('client_id', clientId)
    .eq('trainer_id', trainerId)
    .maybeSingle();
  return (data as MessageThreadRow | null) ?? null;
}

async function ensureThread(
  client: Supabase,
  viewerId: string,
  viewerRole: ChatViewerRole,
  options: EnsureThreadOptions,
): Promise<EnsureThreadResult> {
  const threadId = options.threadId?.trim();
  if (threadId) {
    const thread = await loadThreadById(client, threadId);
    if (!thread) {
      throw new Error('THREAD_NOT_FOUND');
    }
    if (thread.client_id !== viewerId && thread.trainer_id !== viewerId) {
      throw new Error('THREAD_FORBIDDEN');
    }
    const counterpartId = thread.client_id === viewerId ? thread.trainer_id : thread.client_id;
    const counterpartRole = thread.client_id === viewerId ? 'PT' : 'CLIENT';
    return {
      thread,
      clientId: thread.client_id,
      trainerId: thread.trainer_id,
      counterpartId,
      counterpartRole,
      created: false,
    } satisfies EnsureThreadResult;
  }

  const counterpartId = options.counterpartId?.trim();
  if (!counterpartId) {
    throw new Error('THREAD_MISSING_IDENTIFIER');
  }

  let clientId: string;
  let trainerId: string;
  let counterpartRole: ChatViewerRole;

  if (viewerRole === 'CLIENT') {
    clientId = viewerId;
    trainerId = counterpartId;
    counterpartRole = 'PT';
  } else if (viewerRole === 'PT') {
    clientId = counterpartId;
    trainerId = viewerId;
    counterpartRole = 'CLIENT';
  } else {
    // Administradores podem indicar explicitamente o papel via prefixo? Para já assumir viewer é trainer.
    clientId = counterpartId;
    trainerId = viewerId;
    counterpartRole = 'CLIENT';
  }

  let thread = await loadThreadByPair(client, clientId, trainerId);
  if (thread) {
    return {
      thread,
      clientId,
      trainerId,
      counterpartId,
      counterpartRole,
      created: false,
    } satisfies EnsureThreadResult;
  }

  if (options.createIfMissing !== true) {
    throw new Error('THREAD_NOT_FOUND');
  }

  const { data, error } = await client
    .from('message_threads')
    .insert({ client_id: clientId, trainer_id: trainerId })
    .select('*')
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? 'THREAD_CREATE_FAILED');
  }

  thread = data as MessageThreadRow;
  return {
    thread,
    clientId,
    trainerId,
    counterpartId,
    counterpartRole,
    created: true,
  } satisfies EnsureThreadResult;
}

async function fetchProfiles(client: Supabase, ids: Iterable<string>): Promise<Map<string, { name: string; avatarUrl: string | null; role: ChatViewerRole }>> {
  const uniqueIds = Array.from(new Set(Array.from(ids).filter(Boolean)));
  if (!uniqueIds.length) return new Map();

  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, name, avatar_url, role')
    .in('id', uniqueIds);

  if (error) {
    throw new Error(error.message ?? 'PROFILES_FETCH_FAILED');
  }

  const map = new Map<string, { name: string; avatarUrl: string | null; role: ChatViewerRole }>();
  for (const row of data ?? []) {
    if (!row || typeof row.id !== 'string') continue;
    const label =
      (typeof row.full_name === 'string' && row.full_name.trim()) ||
      (typeof row.name === 'string' && row.name.trim()) ||
      row.id;
    map.set(row.id, {
      name: label,
      avatarUrl: row.avatar_url ?? null,
      role: ensureViewerRole(row.role),
    });
  }
  return map;
}

function toChatThreadSummary(
  row: MessageThreadRow,
  viewerId: string,
  profileMap: Map<string, { name: string; avatarUrl: string | null; role: ChatViewerRole }>,
  unreadCount: number,
): ChatThreadSummary {
  const counterpartId = row.client_id === viewerId ? row.trainer_id : row.client_id;
  const counterpartProfile = profileMap.get(counterpartId) ?? { name: counterpartId, avatarUrl: null, role: 'UNKNOWN' };
  return {
    id: row.id,
    clientId: row.client_id,
    trainerId: row.trainer_id,
    counterpartId,
    counterpartRole: counterpartProfile.role,
    counterpartName: counterpartProfile.name,
    counterpartAvatarUrl: counterpartProfile.avatarUrl,
    lastMessageAt: row.last_message_at ?? null,
    lastMessagePreview: row.last_message_preview ?? null,
    unreadCount,
    status: (row.status ?? 'active') as 'active' | 'archived',
  } satisfies ChatThreadSummary;
}

function attachmentKind(row: AttachmentRow): 'image' | 'file' {
  return isImageType(row.content_type) ? 'image' : 'file';
}

async function buildAttachmentPayload(
  client: Supabase,
  row: AttachmentRow,
): Promise<ChatAttachment> {
  const now = Date.now();
  const expiresAtIso = row.expires_at ?? null;
  let expired = false;
  if (expiresAtIso) {
    const expiryMs = new Date(expiresAtIso).getTime();
    if (!Number.isNaN(expiryMs) && expiryMs < now) {
      expired = true;
    }
  }

  let url: string | null = null;
  if (!expired && row.storage_path) {
    const bucket = row.bucket || ATTACHMENT_BUCKET;
    const ttlSeconds = (() => {
      if (!expiresAtIso) return SIGNED_URL_TTL_SECONDS;
      const expiryMs = new Date(expiresAtIso).getTime();
      if (Number.isNaN(expiryMs)) return SIGNED_URL_TTL_SECONDS;
      const remaining = Math.max(60, Math.floor((expiryMs - now) / 1000));
      return Math.min(SIGNED_URL_TTL_SECONDS, remaining);
    })();
    const { data, error } = await client.storage.from(bucket).createSignedUrl(row.storage_path, ttlSeconds);
    if (!error && data?.signedUrl) {
      url = data.signedUrl;
    }
  }

  return {
    id: row.id,
    name: row.file_name,
    url,
    contentType: row.content_type ?? null,
    size: row.size_bytes ?? null,
    isEphemeral: row.is_ephemeral ?? false,
    expiresAt: expiresAtIso,
    expired,
    kind: attachmentKind(row),
  } satisfies ChatAttachment;
}

function toChatMessage(
  row: MessageRow,
  viewerId: string,
  attachments: ChatAttachment[],
): ChatMessage {
  const direction = row.from_id === viewerId ? 'outbound' : 'inbound';
  return {
    id: row.id,
    threadId: row.thread_id,
    fromId: row.from_id,
    toId: row.to_id ?? null,
    body: row.body ?? null,
    sentAt: row.sent_at ?? null,
    readAt: row.read_at ?? null,
    status: (row.status ?? 'sent') as ChatMessage['status'],
    direction,
    attachments,
  } satisfies ChatMessage;
}

async function listUnreadCounts(client: Supabase, viewerId: string, threadIds: string[]): Promise<Map<string, number>> {
  if (!threadIds.length) return new Map();
  const { data, error } = await client
    .from('messages')
    .select('thread_id')
    .eq('to_id', viewerId)
    .is('read_at', null)
    .in('thread_id', threadIds);
  if (error) {
    throw new Error(error.message ?? 'UNREAD_FETCH_FAILED');
  }
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row || typeof row.thread_id !== 'string') continue;
    map.set(row.thread_id, (map.get(row.thread_id) ?? 0) + 1);
  }
  return map;
}

async function loadAssignments(
  client: Supabase,
  viewerId: string,
  role: ChatViewerRole,
): Promise<Array<{ participantId: string; role: ChatViewerRole }>> {
  if (role === 'CLIENT') {
    const { data } = await client
      .from('trainer_clients')
      .select('trainer_id')
      .eq('client_id', viewerId)
      .limit(5);
    const trainers = (data ?? []).map((row: any) => ({ participantId: row?.trainer_id, role: 'PT' as ChatViewerRole }));
    return trainers.filter((item) => typeof item.participantId === 'string');
  }

  if (role === 'PT') {
    const { data } = await client
      .from('trainer_clients')
      .select('client_id')
      .eq('trainer_id', viewerId)
      .limit(200);
    const clients = (data ?? []).map((row: any) => ({ participantId: row?.client_id, role: 'CLIENT' as ChatViewerRole }));
    return clients.filter((item) => typeof item.participantId === 'string');
  }

  return [];
}

async function ensureSupabase(): Promise<Supabase> {
  if (!isSupabaseConfigured()) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }
  return createServerClient() as Supabase;
}

export async function loadChatThreadList(
  viewerId: string,
  viewerRoleRaw: unknown,
): Promise<ChatThreadListResponse> {
  const role = ensureViewerRole(viewerRoleRaw);
  const client = await ensureSupabase();

  const { data: rows, error } = await client
    .from('message_threads')
    .select('*')
    .or(`client_id.eq.${viewerId},trainer_id.eq.${viewerId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(200);

  let threadRows: MessageThreadRow[] = [];
  if (error) {
    if (!isSkippableSchemaError(error)) {
      throw new Error(error.message ?? 'THREADS_FETCH_FAILED');
    }
  } else {
    threadRows = Array.isArray(rows) ? (rows as MessageThreadRow[]) : [];
  }

  const threadIds = threadRows.map((row) => row.id);
  const unreadMap = threadIds.length ? await listUnreadCounts(client, viewerId, threadIds) : new Map<string, number>();

  const participantIds = new Set<string>();
  threadRows.forEach((row) => {
    participantIds.add(row.client_id);
    participantIds.add(row.trainer_id);
  });

  const assignments = await loadAssignments(client, viewerId, role);
  assignments.forEach((assignment) => participantIds.add(assignment.participantId));

  const profileMap = await fetchProfiles(client, participantIds);

  const threads: ChatThreadSummary[] = threadRows.map((row) => {
    const unread = unreadMap.get(row.id) ?? 0;
    return toChatThreadSummary(row, viewerId, profileMap, unread);
  });

  const participantMap = new Map<string, ChatParticipant>();
  for (const thread of threads) {
    participantMap.set(thread.counterpartId, {
      id: thread.counterpartId,
      name: thread.counterpartName,
      avatarUrl: thread.counterpartAvatarUrl,
      role: thread.counterpartRole,
      hasThread: true,
      threadId: thread.id,
    });
  }

  for (const assignment of assignments) {
    if (!participantMap.has(assignment.participantId)) {
      const profile = profileMap.get(assignment.participantId) ?? {
        name: assignment.participantId,
        avatarUrl: null,
        role: assignment.role,
      };
      participantMap.set(assignment.participantId, {
        id: assignment.participantId,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        role: profile.role,
        hasThread: false,
        threadId: null,
      });
    }
  }

  return {
    ok: true,
    viewerId,
    threads,
    participants: Array.from(participantMap.values()),
  } satisfies ChatThreadListResponse;
}

export async function loadChatThread(
  viewerId: string,
  viewerRoleRaw: unknown,
  opts: EnsureThreadOptions & { markAsRead?: boolean },
): Promise<ChatThreadResponse> {
  const role = ensureViewerRole(viewerRoleRaw);
  const client = await ensureSupabase();

  const ensureResult = await ensureThread(client, viewerId, role, { ...opts, createIfMissing: opts.createIfMissing ?? true });
  const { thread, counterpartId, counterpartRole } = ensureResult;

  const profileMap = await fetchProfiles(client, [thread.client_id, thread.trainer_id, counterpartId]);
  const counterpartProfile = profileMap.get(counterpartId) ?? {
    name: counterpartId,
    avatarUrl: null,
    role: counterpartRole,
  };

  const { data: messageRows, error } = await client
    .from('messages')
    .select(
      `
        id,
        thread_id,
        from_id,
        to_id,
        body,
        status,
        sent_at,
        read_at,
        metadata,
        reply_to_id,
        expires_at,
        channel,
        message_attachments (
          id,
          bucket,
          storage_path,
          file_name,
          content_type,
          size_bytes,
          is_ephemeral,
          expires_at,
          metadata,
          created_at
        )
      `,
    )
    .eq('thread_id', thread.id)
    .order('sent_at', { ascending: true })
    .limit(400);

  if (error) {
    throw new Error(error.message ?? 'MESSAGES_FETCH_FAILED');
  }

  const attachmentsByMessage = new Map<string, ChatAttachment[]>();
  const attachmentPromises: Array<Promise<void>> = [];
  const rowsWithAttachments: MessageRowWithAttachments[] = Array.isArray(messageRows)
    ? (messageRows as MessageRowWithAttachments[])
    : [];

  for (const row of rowsWithAttachments) {
    const attachments = Array.isArray(row.message_attachments) ? row.message_attachments : [];
    if (!attachments.length) continue;
    attachmentsByMessage.set(row.id, []);
    for (const attachmentRow of attachments) {
      attachmentPromises.push(
        buildAttachmentPayload(client, attachmentRow).then((payload) => {
          const list = attachmentsByMessage.get(row.id);
          if (list) list.push(payload);
        }),
      );
    }
  }

  await Promise.all(attachmentPromises);

  const messages: ChatMessage[] = rowsWithAttachments.map((row) =>
    toChatMessage(row, viewerId, attachmentsByMessage.get(row.id) ?? []),
  );

  if (opts.markAsRead !== false) {
    await client
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('thread_id', thread.id)
      .eq('to_id', viewerId)
      .is('read_at', null);
  }

  const threadsResponse = await loadChatThreadList(viewerId, role);
  const currentThreadSummary = threadsResponse.threads.find((item) => item.id === thread.id);

  const chatThread: ChatThread = {
    id: thread.id,
    clientId: thread.client_id,
    trainerId: thread.trainer_id,
    counterpartId,
    counterpartRole: counterpartProfile.role,
    counterpartName: counterpartProfile.name,
    counterpartAvatarUrl: counterpartProfile.avatarUrl,
    lastMessageAt: currentThreadSummary?.lastMessageAt ?? thread.last_message_at ?? null,
    lastMessagePreview: currentThreadSummary?.lastMessagePreview ?? thread.last_message_preview ?? null,
  } satisfies ChatThread;

  return {
    ok: true,
    viewerId,
    thread: chatThread,
    messages,
    participants: threadsResponse.participants,
  } satisfies ChatThreadResponse;
}

export type SendMessageOptions = {
  viewerId: string;
  viewerRole: unknown;
  body: string | null;
  attachments: ChatSendAttachmentMeta[];
  threadId?: string | null;
  counterpartId?: string | null;
};

async function uploadAttachment(
  client: Supabase,
  threadId: string,
  messageId: string,
  attachment: ChatSendAttachmentMeta,
): Promise<AttachmentRow> {
  const { file, isEphemeral } = attachment;
  if (!(file instanceof File)) {
    throw new Error('INVALID_ATTACHMENT');
  }
  if (file.size > ATTACHMENT_MAX_SIZE) {
    throw new Error('ATTACHMENT_TOO_LARGE');
  }
  if (!isAllowedAttachmentType(file.type)) {
    throw new Error('ATTACHMENT_TYPE_NOT_ALLOWED');
  }
  if (isEphemeral && !isImageType(file.type)) {
    throw new Error('EPHEMERAL_ONLY_IMAGES');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = sanitizeFileName(file.name || 'anexo');
  const objectPath = `${threadId}/${messageId}/${randomUUID()}-${safeName}`;
  const bucket = ATTACHMENT_BUCKET;

  const { error: uploadError } = await client.storage.from(bucket).upload(objectPath, buffer, {
    contentType: file.type || 'application/octet-stream',
    cacheControl: '3600',
    upsert: false,
  });
  if (uploadError) {
    throw new Error(uploadError.message ?? 'ATTACHMENT_UPLOAD_FAILED');
  }

  const expiresAt = isEphemeral
    ? new Date(Date.now() + EPHEMERAL_TTL_HOURS * 60 * 60 * 1000).toISOString()
    : null;

  const { data, error } = await client
    .from('message_attachments')
    .insert({
      message_id: messageId,
      bucket,
      storage_path: objectPath,
      file_name: safeName,
      content_type: file.type || null,
      size_bytes: file.size,
      is_ephemeral: isEphemeral,
      expires_at: expiresAt,
    })
    .select('*')
    .single();

  if (error || !data) {
    await client.storage.from(bucket).remove([objectPath]);
    throw new Error(error?.message ?? 'ATTACHMENT_PERSIST_FAILED');
  }

  return data as AttachmentRow;
}

export async function sendChatMessage(options: SendMessageOptions): Promise<ChatThreadResponse> {
  const { viewerId, viewerRole, body, attachments: rawAttachments, threadId, counterpartId } = options;
  const role = ensureViewerRole(viewerRole);
  if (!viewerId) {
    throw new Error('UNAUTHENTICATED');
  }

  const attachments = rawAttachments ?? [];
  if (!body && attachments.length === 0) {
    throw new Error('EMPTY_MESSAGE');
  }
  if (attachments.length > ATTACHMENT_MAX_COUNT) {
    throw new Error('TOO_MANY_ATTACHMENTS');
  }

  const client = await ensureSupabase();
  const ensureResult = await ensureThread(client, viewerId, role, {
    threadId,
    counterpartId,
    createIfMissing: true,
  });
  const { thread, counterpartId: resolvedCounterpart } = ensureResult;

  const payload: Database['public']['Tables']['messages']['Insert'] = {
    thread_id: thread.id,
    from_id: viewerId,
    to_id: resolvedCounterpart,
    body: body && body.trim().length ? body.trim() : null,
    channel: 'in-app',
    status: 'sent',
  };

  const { data: messageRow, error: insertError } = await client
    .from('messages')
    .insert(payload)
    .select('*')
    .single();

  if (insertError || !messageRow) {
    throw new Error(insertError?.message ?? 'MESSAGE_SEND_FAILED');
  }

  const typedMessageRow = messageRow as MessageRow;
  const messageId = typedMessageRow.id;
  const uploaded: AttachmentRow[] = [];
  try {
    for (const attachment of attachments) {
      const stored = await uploadAttachment(client, thread.id, messageId, attachment);
      uploaded.push(stored);
    }
  } catch (error) {
    await client
      .from('messages')
      .delete()
      .eq('id', messageId);
    if (uploaded.length) {
      await client.storage.from(ATTACHMENT_BUCKET).remove(uploaded.map((item) => item.storage_path));
    }
    throw error instanceof Error ? error : new Error('ATTACHMENT_UPLOAD_FAILED');
  }

  const preview = body && body.trim().length ? body.trim().slice(0, 200) : uploaded.length ? `${uploaded.length} anexo(s)` : null;
  await client
    .from('message_threads')
    .update({
      last_message_at: typedMessageRow.sent_at ?? new Date().toISOString(),
      last_message_preview: preview,
      last_message_author_id: viewerId,
    })
    .eq('id', thread.id);

  return loadChatThread(viewerId, role, { threadId: thread.id, markAsRead: false });
}
