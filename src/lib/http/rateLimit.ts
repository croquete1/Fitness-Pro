const BUCKETS = new Map<string, { count: number; reset: number }>();

export type RateLimitInfo = {
  ok: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type RateLimitOptions = {
  /** Máximo de pedidos permitidos dentro da janela. */
  limit: number;
  /** Duração da janela em milissegundos. */
  windowMs: number;
  /** Prefixo para distinguir diferentes buckets do mesmo identificador. */
  prefix?: string;
};

const DEFAULT_IDENTIFIER = 'anonymous';

function sanitizeAddressToken(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let token = raw.trim();
  if (!token) return null;

  if (token.startsWith('"') && token.endsWith('"') && token.length > 1) {
    token = token.slice(1, -1).trim();
  }
  if (!token || token.toLowerCase() === 'unknown') return null;

  if (token.startsWith('[')) {
    const closing = token.indexOf(']');
    if (closing > 0) {
      const ipv6 = token.slice(1, closing).trim();
      return ipv6 || null;
    }
    return null;
  }

  if (token.includes(':') && token.includes('.')) {
    const lastColon = token.lastIndexOf(':');
    if (lastColon > -1) {
      token = token.slice(0, lastColon).trim();
    }
  }

  return token || null;
}

function parseForwardedHeader(headerValue: string | null): string | null {
  if (!headerValue) return null;

  for (const entry of headerValue.split(',')) {
    const segments = entry.split(';');
    for (const segment of segments) {
      const trimmed = segment.trim();
      if (!trimmed.toLowerCase().startsWith('for=')) continue;

      const ip = sanitizeAddressToken(trimmed.slice(4));
      if (ip) return ip;
    }
  }

  return null;
}

function cleanupIfExpired(key: string, now: number) {
  const entry = BUCKETS.get(key);
  if (!entry) return;
  if (entry.reset <= now) {
    BUCKETS.delete(key);
  }
}

export function getRequestFingerprint(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const [first] = forwarded.split(',');
    const ip = sanitizeAddressToken(first);
    if (ip) return ip;
  }
  const forwardedStd = parseForwardedHeader(request.headers.get('forwarded'));
  if (forwardedStd) return forwardedStd;
  const real = request.headers.get('x-real-ip');
  const realIp = sanitizeAddressToken(real);
  if (realIp) return realIp;
  const cf = request.headers.get('cf-connecting-ip');
  const cfIp = sanitizeAddressToken(cf);
  if (cfIp) return cfIp;
  const remoteAddr = (request as unknown as { ip?: string | null }).ip;
  if (typeof remoteAddr === 'string' && remoteAddr.trim().length > 0) {
    return remoteAddr.trim();
  }
  return DEFAULT_IDENTIFIER;
}

function buildBucketKey(identifier: string, options: RateLimitOptions): string {
  const prefix = options.prefix?.trim() ?? 'global';
  return `${prefix}:${identifier}`;
}

export function rateLimitIdentifier(identifier: string, options: RateLimitOptions): RateLimitInfo {
  const now = Date.now();
  const key = buildBucketKey(identifier, options);
  cleanupIfExpired(key, now);

  const existing = BUCKETS.get(key);
  const reset = existing?.reset && existing.reset > now ? existing.reset : now + options.windowMs;

  if (existing && existing.reset > now) {
    if (existing.count >= options.limit) {
      return { ok: false, limit: options.limit, remaining: 0, reset };
    }
    existing.count += 1;
    return { ok: true, limit: options.limit, remaining: Math.max(0, options.limit - existing.count), reset };
  }

  BUCKETS.set(key, { count: 1, reset });
  return { ok: true, limit: options.limit, remaining: Math.max(0, options.limit - 1), reset };
}

export function rateLimitRequest(request: Request, options: RateLimitOptions & { identifier?: string }): RateLimitInfo {
  const identifier = options.identifier?.trim() || getRequestFingerprint(request);
  return rateLimitIdentifier(identifier, options);
}

export function buildRateLimitHeaders(info: RateLimitInfo): Record<string, string> {
  const resetSeconds = Math.max(0, Math.ceil((info.reset - Date.now()) / 1000));
  const headers: Record<string, string> = {
    'x-ratelimit-limit': String(info.limit),
    'x-ratelimit-remaining': String(Math.max(0, info.remaining)),
    'x-ratelimit-reset': String(Math.ceil(info.reset / 1000)),
  };
  if (!info.ok) {
    headers['retry-after'] = String(resetSeconds);
  }
  return headers;
}

/** @internal – exposto apenas para facilitar testes determinísticos. */
export function resetRateLimitBuckets() {
  BUCKETS.clear();
}
