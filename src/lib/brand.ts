// src/lib/brand.ts
export type BrandConfig = {
  name: string;            // nome mostrado ao lado do logo
  short: string;           // fallback "iniciais" no quadradinho
  logoLight?: string;      // caminho relativo em /public (ex: "/brand/logo-light.svg")
  logoDark?: string;       // caminho relativo em /public (ex: "/brand/logo-dark.svg")
  size?: number;           // tamanho do logo (px)
};

export const brand: BrandConfig = {
  name: "HMS",
  short: "HMS",

  // coloca os teus ficheiros aqui (ou altera os caminhos):
  // /public/brand/hms-logo-light.png e /public/brand/hms-logo-dark.png
  logoLight: "/brand/hms-logo-light.png",
  logoDark: "/brand/hms-logo-dark.png",

  size: 30,
};

const FALLBACK_LIGHT_LOGO = "/brand/hms-logo-light.png" as const;
const FALLBACK_DARK_LOGO = "/brand/hms-logo-dark.png" as const;
const LEGACY_LOGO = "/brand/hms-personal-trainer.svg" as const;

const isNonEmptyString = (value: string | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const brandFallbackLogos = {
  light: FALLBACK_LIGHT_LOGO,
  dark: FALLBACK_DARK_LOGO,
  legacy: LEGACY_LOGO,
};

export type BrandLogoMode = "light" | "dark" | "any";

export function resolveBrandLogos(mode: BrandLogoMode = "any"): string[] {
  const orderedCandidates: (string | undefined)[] =
    mode === "dark"
      ? [
          brand.logoDark,
          FALLBACK_DARK_LOGO,
          brand.logoLight,
          FALLBACK_LIGHT_LOGO,
          LEGACY_LOGO,
        ]
      : mode === "light"
        ? [
            brand.logoLight,
            FALLBACK_LIGHT_LOGO,
            brand.logoDark,
            FALLBACK_DARK_LOGO,
            LEGACY_LOGO,
          ]
        : [
            brand.logoLight,
            FALLBACK_LIGHT_LOGO,
            brand.logoDark,
            FALLBACK_DARK_LOGO,
            LEGACY_LOGO,
          ];

  const unique = Array.from(new Set(orderedCandidates.filter(isNonEmptyString)));

  if (unique.length === 0) {
    unique.push(mode === "dark" ? FALLBACK_DARK_LOGO : FALLBACK_LIGHT_LOGO);
  }

  return unique;
}
