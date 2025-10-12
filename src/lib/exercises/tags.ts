export function parseExerciseTags(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

export function formatExerciseTags(tags: string[]): string {
  return tags
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .join(', ');
}
