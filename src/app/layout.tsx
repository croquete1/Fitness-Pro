import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import ClientCompat from "@/components/system/ClientCompat"; // mantém o polyfill que já te enviei
import React from "react";

export const metadata: Metadata = {
  title: "Fitness Pro",
  description: "Dashboard Fitness Pro",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <Providers>
          <ClientCompat />
          {children}
        </Providers>
      </body>
    </html>
  );
}
