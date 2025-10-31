function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type ExtractedNotificationMetadata = {
  metadata: Record<string, unknown> | null;
  event: Record<string, unknown> | null;
  eventMeta: Record<string, unknown> | null;
  href: string | null;
  type: string | null;
};

export function extractNotificationMetadata(raw: unknown): ExtractedNotificationMetadata {
  if (!isRecord(raw)) {
    return { metadata: null, event: null, eventMeta: null, href: null, type: null };
  }

  const metadata = raw;
  const event = isRecord(metadata.event) ? (metadata.event as Record<string, unknown>) : null;
  const eventMeta = isRecord(event?.meta) ? (event!.meta as Record<string, unknown>) : null;

  const hrefCandidates = [metadata.href, event?.href, eventMeta?.href]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0);

  const typeCandidate =
    typeof metadata.type === 'string' && metadata.type.trim().length > 0
      ? metadata.type.trim()
      : typeof event?.type === 'string' && event.type.trim().length > 0
        ? event.type.trim()
        : null;

  return {
    metadata,
    event,
    eventMeta,
    href: hrefCandidates[0] ?? null,
    type: typeCandidate,
  };
}
