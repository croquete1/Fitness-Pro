// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <title>Fitness Pro</title>
      </head>
      <body className="bg-gray-100 text-gray-900">{children}</body>
    </html>
  );
}
