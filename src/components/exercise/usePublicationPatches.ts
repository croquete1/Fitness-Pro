'use client';

import * as React from 'react';

import type { PublishResult } from './PublishToggle';

type PublicationSnapshot = {
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
};

type RowWithPublication = {
  id: string;
  isPublished?: boolean | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
};

type PatchRecord = Record<string, PublicationSnapshot>;

let patchStore: PatchRecord = {};
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function getSnapshot(): PatchRecord {
  return patchStore;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function updateStore(updater: (prev: PatchRecord) => PatchRecord) {
  const next = updater(patchStore);
  if (next === patchStore) return;
  patchStore = next;
  notifyListeners();
}

function toSnapshot(row: RowWithPublication): PublicationSnapshot {
  return {
    isPublished: Boolean(row.isPublished),
    publishedAt: row.publishedAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

function pruneWithRows(rows: RowWithPublication[]) {
  if (!rows.length) return;

  const rowMap = new Map<string, PublicationSnapshot>(rows.map((row) => [row.id, toSnapshot(row)]));

  updateStore((prev) => {
    let next: PatchRecord | null = null;

    for (const [id, patch] of Object.entries(prev)) {
      const server = rowMap.get(id);
      if (!server) {
        continue;
      }

      if (
        server.isPublished === patch.isPublished &&
        server.publishedAt === patch.publishedAt &&
        server.updatedAt === patch.updatedAt
      ) {
        if (!next) next = { ...prev };
        delete next[id];
      }
    }

    return next ?? prev;
  });
}

export function usePublicationPatches(rows: RowWithPublication[]) {
  const patches = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  React.useEffect(() => {
    pruneWithRows(rows);
  }, [rows]);

  const resolve = React.useCallback(
    (row: RowWithPublication): PublicationSnapshot => {
      const server = toSnapshot(row);
      const patch = patches[row.id];
      if (!patch) {
        return server;
      }

      return {
        isPublished: patch.isPublished,
        publishedAt: patch.publishedAt,
        updatedAt: patch.updatedAt ?? server.updatedAt,
      };
    },
    [patches],
  );

  const record = React.useCallback((result: PublishResult) => {
    const patch: PublicationSnapshot = {
      isPublished: result.isPublished,
      publishedAt: result.publishedAt,
      updatedAt: result.updatedAt,
    };

    updateStore((prev) => {
      const current = prev[result.id];
      if (
        current &&
        current.isPublished === patch.isPublished &&
        current.publishedAt === patch.publishedAt &&
        current.updatedAt === patch.updatedAt
      ) {
        return prev;
      }

      return { ...prev, [result.id]: patch };
    });
  }, []);

  return { resolve, record };
}

export type { PublicationSnapshot };
