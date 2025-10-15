'use client';

import * as React from 'react';

/**
 * Lightweight media query hook sem depender de MUI.
 * Usa matchMedia quando disponível e sincroniza com eventos de `change`.
 */
export function useMediaQuery(query: string, { defaultValue = false, ssrValue }: { defaultValue?: boolean; ssrValue?: boolean } = {}) {
  const getInitial = React.useCallback(() => {
    if (typeof window === 'undefined') {
      return typeof ssrValue === 'boolean' ? ssrValue : defaultValue;
    }
    return window.matchMedia(query).matches;
  }, [defaultValue, query, ssrValue]);

  const [matches, setMatches] = React.useState<boolean>(getInitial);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
