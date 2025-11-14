import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadChatThread, sendChatMessage } from '@/lib/messages/chatServer';
import type { ChatSendAttachmentMeta } from '@/lib/messages/chatTypes';

function normalizeId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function mapError(error: unknown): { status: number; body: { ok: false; error: string; message?: string } } {
  const message = error instanceof Error ? error.message : null;
  const fallback = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';

  switch (message) {
    case 'UNAUTHENTICATED':
      return { status: 401, body: { ok: false, error: 'UNAUTHENTICATED', message: 'Sessão expirada. Inicia sessão novamente.' } };
    case 'EMPTY_MESSAGE':
      return { status: 400, body: { ok: false, error: 'EMPTY_MESSAGE', message: 'Escreve uma mensagem ou adiciona um anexo.' } };
    case 'TOO_MANY_ATTACHMENTS':
      return { status: 400, body: { ok: false, error: 'TOO_MANY_ATTACHMENTS', message: 'Máximo de 5 anexos por mensagem.' } };
    case 'ATTACHMENT_TOO_LARGE':
      return {
        status: 400,
        body: {
          ok: false,
          error: 'ATTACHMENT_TOO_LARGE',
          message: 'Cada ficheiro pode ter no máximo 15 MB.',
        },
      };
    case 'ATTACHMENT_TYPE_NOT_ALLOWED':
      return {
        status: 400,
        body: {
          ok: false,
          error: 'ATTACHMENT_TYPE_NOT_ALLOWED',
          message: 'Formato de ficheiro não suportado. Usa imagens, PDF, Word ou Excel.',
        },
      };
    case 'EPHEMERAL_ONLY_IMAGES':
      return {
        status: 400,
        body: {
          ok: false,
          error: 'EPHEMERAL_ONLY_IMAGES',
          message: 'Apenas imagens podem ser marcadas como temporárias.',
        },
      };
    case 'THREAD_FORBIDDEN':
      return { status: 403, body: { ok: false, error: 'THREAD_FORBIDDEN', message: 'Não tens acesso a esta conversa.' } };
    case 'THREAD_NOT_FOUND':
      return { status: 404, body: { ok: false, error: 'THREAD_NOT_FOUND', message: 'Conversa não encontrada.' } };
    case 'THREAD_MISSING_IDENTIFIER':
      return {
        status: 400,
        body: { ok: false, error: 'THREAD_MISSING_IDENTIFIER', message: 'Indica a conversa ou o participante da mensagem.' },
      };
    case 'SUPABASE_NOT_CONFIGURED':
      return {
        status: 503,
        body: { ok: false, error: 'SERVICE_UNAVAILABLE', message: 'Serviço de dados indisponível. Tenta novamente em instantes.' },
      };
    default:
      return {
        status: 500,
        body: { ok: false, error: 'CHAT_OPERATION_FAILED', message: fallback ?? 'Não foi possível concluir a operação.' },
      };
  }
}

export async function GET(request: Request): Promise<Response> {
  const session = await getSessionUserSafe();
  const viewerId = session?.user?.id;
  if (!viewerId) {
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  const url = new URL(request.url);
  const threadId = normalizeId(url.searchParams.get('thread'));
  const counterpartId = normalizeId(url.searchParams.get('counterpart'));
  const markReadParam = url.searchParams.get('markRead');
  const markAsRead = markReadParam !== 'false';

  try {
    const payload = await loadChatThread(viewerId, session?.user?.role ?? session?.role, {
      threadId,
      counterpartId,
      createIfMissing: true,
      markAsRead,
    });
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[messages/chat] falha ao carregar conversa', error);
    const mapped = mapError(error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}

export async function POST(request: Request): Promise<Response> {
  const session = await getSessionUserSafe();
  const viewerId = session?.user?.id;
  if (!viewerId) {
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_FORM', message: 'Não foi possível ler o formulário enviado.' }, {
      status: 400,
    });
  }

  const threadId = normalizeId(form.get('threadId'));
  const counterpartId = normalizeId(form.get('counterpartId'));
  const bodyRaw = form.get('body');
  const body = typeof bodyRaw === 'string' ? bodyRaw : null;

  const fileEntries = form.getAll('files');
  const ephemeralEntries = form.getAll('files_is_ephemeral');
  const attachments: ChatSendAttachmentMeta[] = [];

  for (let index = 0; index < fileEntries.length; index += 1) {
    const candidate = fileEntries[index];
    if (candidate == null) continue;
    if (!(candidate instanceof File)) {
      return NextResponse.json({ ok: false, error: 'INVALID_ATTACHMENT', message: 'Anexo inválido.' }, { status: 400 });
    }
    const ephemeralFlag = typeof ephemeralEntries[index] === 'string' ? String(ephemeralEntries[index]).toLowerCase() : '';
    const isEphemeral = ephemeralFlag === 'true' || ephemeralFlag === '1' || ephemeralFlag === 'on';
    attachments.push({ file: candidate, isEphemeral });
  }

  try {
    const payload = await sendChatMessage({
      viewerId,
      viewerRole: session?.user?.role ?? session?.role,
      body,
      attachments,
      threadId,
      counterpartId,
    });
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[messages/chat] falha ao enviar mensagem', error);
    const mapped = mapError(error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}
