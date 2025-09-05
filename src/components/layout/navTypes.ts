// src/components/layout/navTypes.ts
import type { Route } from 'next';
import type { UrlObject } from 'url';

export type Href = string | Route | UrlObject;

export type NavItem = {
  href: Href;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  /** prefixo(s) que marcam o item como ativo (opcional) */
  activePrefix?: string | string[];
};
