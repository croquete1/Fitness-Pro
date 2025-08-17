import "./globals.css";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Fitness Pro",
  description: "Plataforma de gestão Fitness Pro",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        {/* Aplica o tema guardado antes da hidratação para evitar flicker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try{
                  var t = localStorage.getItem("fp-theme") || "light";
                  document.documentElement.setAttribute("data-theme", t);
                }catch(e){}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
