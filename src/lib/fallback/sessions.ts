import type { ClientSession, SessionRequest } from '@/lib/sessions/types';

export function getFallbackClientSessions(): ClientSession[] {
  return [];
}

export function getFallbackSessionRequests(): SessionRequest[] {
  return [];
}
