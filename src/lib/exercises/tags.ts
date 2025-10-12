export function parseTagList(raw?: string | null): string[] {
  if (!raw) return [];

  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.replace(/\s+/g, ' '))
    .filter((tag, index, arr) => index === arr.findIndex((candidate) => candidate.toLowerCase() === tag.toLowerCase()));
}

export function formatTagList(raw?: string | null): string | undefined {
  const tags = parseTagList(raw);
  if (tags.length === 0) return undefined;
  return tags.join(', ');
}

export function stringifyTagList(raw?: string | null): string {
  return formatTagList(raw) ?? '';
}
