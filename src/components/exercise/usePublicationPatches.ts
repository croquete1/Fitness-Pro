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

function normalizeTimestamp(value: string | null | undefined): string | null {
  if (!value) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  return new Date(time).toISOString();
}

function toSnapshot(row: RowWithPublication): PublicationSnapshot {
  return {
    isPublished: Boolean(row.isPublished),
    publishedAt: normalizeTimestamp(row.publishedAt),
    updatedAt: normalizeTimestamp(row.updatedAt),
  };
}

function createSnapshotMap(rows: RowWithPublication[]): Map<string, PublicationSnapshot> {
  return new Map(rows.map((row) => [row.id, toSnapshot(row)]));
}

function pruneWithSnapshots(snapshotMap: Map<string, PublicationSnapshot>) {
  if (!snapshotMap.size) return;

  updateStore((prev) => {
    let next: PatchRecord | null = null;

    for (const [id, patch] of Object.entries(prev)) {
      const server = snapshotMap.get(id);
      if (!server) {
        continue;
      }

      if (server.isPublished !== patch.isPublished) {
        continue;
      }

      if (!next) next = { ...prev };
      delete next[id];
    }

    return next ?? prev;
  });
}

export function usePublicationPatches(rows: RowWithPublication[]) {
  const patches = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const snapshots = React.useMemo(() => createSnapshotMap(rows), [rows]);

  React.useEffect(() => {
    pruneWithSnapshots(snapshots);
  }, [snapshots]);

  const resolve = React.useCallback(
    (row: RowWithPublication): PublicationSnapshot => {
      const server = snapshots.get(row.id) ?? toSnapshot(row);
      const patch = patches[row.id];
      if (!patch) {
        return server;
      }

      return {
        isPublished: patch.isPublished,
        publishedAt: patch.publishedAt ?? server.publishedAt,
        updatedAt: patch.updatedAt ?? server.updatedAt,
      };
    },
    [patches, snapshots],
  );

  const record = React.useCallback((result: PublishResult) => {
    const patch: PublicationSnapshot = {
      isPublished: result.isPublished,
      publishedAt: normalizeTimestamp(result.publishedAt),
      updatedAt: normalizeTimestamp(result.updatedAt),
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
