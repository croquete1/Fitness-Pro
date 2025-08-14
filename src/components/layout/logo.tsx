"use client";

import * as React from "react";
import { brand } from "@/lib/brand";

export default function Logo({
  size = brand.size ?? 30,
  title = brand.name,
}: {
  size?: number;
  title?: string;
}) {
  const [lightErr, setLightErr] = React.useState(false);
  const [darkErr, setDarkErr] = React.useState(false);

  const showFallback =
    (!brand.logoLight || lightErr) && (!brand.logoDark || darkErr);

  if (showFallback) {
    return (
      <div
        aria-label={title}
        title={title}
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          border: "1px solid var(--border)",
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          userSelect: "none",
        }}
      >
        {brand.short}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {brand.logoLight ? (
        <img
          src={brand.logoLight}
          width={size}
          height={size}
          alt={title}
          className="brand-logo-light"
          onError={() => setLightErr(true)}
          style={{
            position: "absolute",
            inset: 0,
            objectFit: "contain",
            display: "block",
          }}
        />
      ) : null}
      {brand.logoDark ? (
        <img
          src={brand.logoDark}
          width={size}
          height={size}
          alt={title}
          className="brand-logo-dark"
          onError={() => setDarkErr(true)}
          style={{
            position: "absolute",
            inset: 0,
            objectFit: "contain",
            display: "block",
          }}
        />
      ) : null}
    </div>
  );
}
