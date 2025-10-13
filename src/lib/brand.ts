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
  // /public/brand/hms-personal-trainer.svg
  logoLight: "/brand/hms-personal-trainer.svg",
  logoDark: "/brand/hms-personal-trainer.svg",

  size: 30,
};
