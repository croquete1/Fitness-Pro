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

function toSnapshot(row: RowWithPublication): PublicationSnapshot {
  return {
    isPublished: Boolean(row.isPublished),
    publishedAt: row.publishedAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

export function usePublicationPatches(rows: RowWithPublication[]) {
  const [patches, setPatches] = React.useState<Record<string, PublicationSnapshot>>({});

  React.useEffect(() => {
    setPatches((prev) => {
      if (!rows.length) {
        return Object.keys(prev).length ? {} : prev;
      }

      const rowMap = new Map<string, PublicationSnapshot>(rows.map((row) => [row.id, toSnapshot(row)]));
      let mutated = false;
      const next: Record<string, PublicationSnapshot> = {};

      for (const [id, patch] of Object.entries(prev)) {
        const server = rowMap.get(id);
        if (!server) {
          mutated = true;
          continue;
        }

        if (
          server.isPublished === patch.isPublished &&
          server.publishedAt === patch.publishedAt &&
          server.updatedAt === patch.updatedAt
        ) {
          mutated = true;
          continue;
        }

        next[id] = patch;
      }

      return mutated ? next : prev;
    });
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

    setPatches((prev) => {
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
