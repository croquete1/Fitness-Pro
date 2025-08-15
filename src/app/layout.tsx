// src/app/layout.tsx
import React from "react";

export const metadata = {
  title: "Fitness-Pro Dashboard",
  description: "Dashboard PT — Administração e Personal Trainer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          background: "#ffffff",
          color: "#111827",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
