// src/lib/brand.ts
export type BrandConfig = {
  name: string;            // nome mostrado ao lado do logo
  short: string;           // fallback "iniciais" no quadradinho
  logoLight?: string;      // caminho relativo em /public (ex: "/brand/logo-light.svg")
  logoDark?: string;       // caminho relativo em /public (ex: "/brand/logo-dark.svg")
  size?: number;           // tamanho do logo (px)
};

export const brand: BrandConfig = {
  name: "Fitness Pro",
  short: "FP",

  // coloca os teus ficheiros aqui (ou altera os caminhos):
  // /public/brand/logo-light.png e /public/brand/logo-dark.png
  logoLight: "/brand/hms-logo-light.png",
  logoDark: "/brand/hms-logo-dark.png",

  size: 30,
};
