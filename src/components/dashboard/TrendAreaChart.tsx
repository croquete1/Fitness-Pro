"use client";

import React, { useMemo } from "react";

export type SeriesPoint = { label: string; value: number };

export default function TrendAreaChart({
  data,
  height = 160,
}: {
  data: SeriesPoint[];
  height?: number;
}) {
  const { path, area, max } = useMemo(() => {
    const vals = data?.map((d) => d.value) ?? [];
    const m = Math.max(1, ...vals);
    const w = 560; // viewbox width
    const h = height;
    const pad = 10;

    const sx = (i: number) => {
      if (data.length <= 1) return pad;
      return pad + (i * (w - pad * 2)) / (data.length - 1);
    };
    const sy = (v: number) => pad + (h - pad * 2) * (1 - v / m);

    let p = "";
    data.forEach((pt, i) => {
      const x = sx(i);
      const y = sy(pt.value);
      p += (i === 0 ? "M" : "L") + x + " " + y + " ";
    });

    const lastX = sx(Math.max(0, data.length - 1));
    const firstX = sx(0);
    const areaPath = `${p} L ${lastX} ${h - pad} L ${firstX} ${h - pad} Z`;

    return { path: p.trim(), area: areaPath, max: m };
  }, [data, height]);

  return (
    <div style={{ width: "100%", height }}>
      <svg
        viewBox={`0 0 560 ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico de sessões nos últimos 7 dias"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {/* Área */}
        <path d={area} fill="url(#grad)" opacity={0.6} />
        {/* Linha */}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} />
        {/* Grade leve */}
        {Array.from({ length: 3 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            x2="560"
            y1={(height / 4) * (i + 1)}
            y2={(height / 4) * (i + 1)}
            stroke="var(--border)"
            strokeDasharray="3 5"
          />
        ))}
        <defs>
          <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {data.map((d, i) => (
          <span key={i} style={{ color: "var(--muted)", fontSize: ".8rem" }}>
            {d.label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: ".8rem" }}>
          Máx: {max}
        </span>
      </div>
    </div>
  );
}
