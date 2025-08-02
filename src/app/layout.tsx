import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Fitness Pro",
  description: "Dashboard fitness profissional",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
