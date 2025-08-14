// src/components/layout/Logo.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { brand } from "@/lib/brand";

export default function Logo({
  size = brand.size ?? 30,
  title = brand.name,
  priority = false,
}: {
  size?: number;
  title?: string;
  priority?: boolean;
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
      {brand.logoLight && !lightErr ? (
        <Image
          src={brand.logoLight}
          alt={title}
          width={size}
          height={size}
          className="brand-logo-light"
          onError={() => setLightErr(true)}
          priority={priority}
          style={{ position: "absolute", inset: 0, objectFit: "contain" }}
        />
      ) : null}

      {brand.logoDark && !darkErr ? (
        <Image
          src={brand.logoDark}
          alt={title}
          width={size}
          height={size}
          className="brand-logo-dark"
          onError={() => setDarkErr(true)}
          priority={priority}
          style={{ position: "absolute", inset: 0, objectFit: "contain" }}
        />
      ) : null}
    </div>
  );
}
