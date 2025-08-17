"use client";

import { useEffect, useRef, useState } from "react";

type Options<T> = {
  intervalMs?: number;            // default: 30000
  immediate?: boolean;            // default: true
  enabled?: boolean;              // default: true
  parse?: (r: Response) => Promise<T>; // default: r.json()
};

export function usePoll<T = any>(
  url: string,
  opts: Options<T> = {}
) {
  const { intervalMs = 30000, immediate = true, enabled = true, parse } = opts;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let alive = true;
    let ctrl = new AbortController();

    const load = async () => {
      try {
        const res = await fetch(url, { signal: ctrl.signal, credentials: "include" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const body = parse ? await parse(res) : await res.json();
        if (alive) setData(body);
      } catch (e) {
        if (alive) setError(e);
      }
    };

    if (immediate) load();
    timerRef.current = window.setInterval(load, intervalMs);

    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      if (timerRef.current) window.clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVis);
      ctrl.abort();
    };
  }, [url, intervalMs, immediate, enabled, parse]);

  return { data, error };
}
