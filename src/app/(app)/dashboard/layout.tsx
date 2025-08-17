import "@/app/globals.css";
import SidebarWrapper from "@/components/SidebarWrapper";
import HeaderBridge from "@/components/HeaderBridge";

export const metadata = { title: "Dashboard • Fitness Pro" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <HeaderBridge />
        <SidebarWrapper>{children}</SidebarWrapper>
      </body>
    </html>
  );
}
