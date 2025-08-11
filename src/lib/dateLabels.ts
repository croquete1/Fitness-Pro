// Pequeno helper para rotular dias: "Hoje", "Amanhã", "Ontem" ou data formatada.
// Mantém PT-PT por defeito.

export function dateLabel(date: Date, base: Date = new Date(), locale = "pt-PT") {
  // normaliza para só comparar a parte de data (sem horas)
  const toYMD = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const d = toYMD(date);
  const today = toYMD(base);

  const baseTomorrow = new Date(base);
  baseTomorrow.setDate(baseTomorrow.getDate() + 1);
  const tomorrow = toYMD(baseTomorrow);

  const baseYesterday = new Date(base);
  baseYesterday.setDate(baseYesterday.getDate() - 1);
  const yesterday = toYMD(baseYesterday);

  if (d === today) return "Hoje";
  if (d === tomorrow) return "Amanhã";
  if (d === yesterday) return "Ontem";

  // Ex.: "terça, 13 ago"
  const fmt = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
  // capitaliza a primeira letra
  const s = fmt.format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}
