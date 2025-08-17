import "./globals.css";
import type { Metadata } from "next";
import ClientCompat from "@/components/system/ClientCompat";
// ... (restantes imports)

export const metadata: Metadata = {
  title: "Fitness Pro",
  // ...
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <ClientCompat />
        {children}
      </body>
    </html>
  );
}
