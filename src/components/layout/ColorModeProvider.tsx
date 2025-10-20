'use client';

import * as React from 'react';

type Mode = 'light' | 'dark';

type Ctx = { mode: Mode; toggle: () => void; set: (m: Mode) => void };

const ColorModeCtx = React.createContext<Ctx | null>(null);

type Props = { children: React.ReactNode; initialMode?: Mode };

function readStoredMode(): Mode | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem('fp-mode');
    return stored === 'dark' || stored === 'light' ? (stored as Mode) : null;
  } catch {
    return null;
  }
}

function getSystemMode(): Mode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function persistCookie(mode: Mode) {
  if (typeof document === 'undefined') return;
  try {
    const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `fp-mode=${mode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`;
  } catch {
    // Falhas ao escrever cookies são silenciosas
  }
}

export default function ColorModeProvider({ children, initialMode = 'light' }: Props) {
  const [mode, setMode] = React.useState<Mode>(initialMode);
  const [source, setSource] = React.useState<'system' | 'manual'>('manual');
  const sourceRef = React.useRef(source);

  React.useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = readStoredMode();
    if (stored) {
      setMode(stored);
      setSource('manual');
      return;
    }
    const system = getSystemMode();
    setMode(system);
    setSource('system');
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      if (sourceRef.current === 'manual') return;
      setMode(event.matches ? 'dark' : 'light');
      setSource('system');
    };
    media.addEventListener?.('change', handler);
    return () => media.removeEventListener?.('change', handler);
  }, []);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.setAttribute('data-theme', mode);
    persistCookie(mode);
    if (typeof window !== 'undefined') {
      try {
        if (source === 'manual') {
          window.localStorage.setItem('fp-mode', mode);
        } else {
          window.localStorage.removeItem('fp-mode');
        }
      } catch {
        // Falhas em localStorage são silenciosas
      }
    }
  }, [mode, source]);

  const setManualMode = React.useCallback((next: Mode) => {
    setMode(next);
    setSource('manual');
  }, []);

  const toggle = React.useCallback(() => {
    setManualMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setManualMode]);

  const value = React.useMemo<Ctx>(
    () => ({
      mode,
      toggle,
      set: setManualMode,
    }),
    [mode, setManualMode, toggle],
  );

  return <ColorModeCtx.Provider value={value}>{children}</ColorModeCtx.Provider>;
}

export function useColorMode() {
  const ctx = React.useContext(ColorModeCtx);
  if (!ctx) throw new Error('useColorMode must be used within ColorModeProvider');
  return ctx;
}
