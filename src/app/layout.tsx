// src/app/(app)/dashboard/layout.tsx
import SidebarWrapper from "@/components/SidebarWrapper";

export default function Layout({children}:{children:React.ReactNode}){
  return (
    <html lang="pt">
      <body>
        {/* Header global aqui, se tiveres */}
        <SidebarWrapper>{children}</SidebarWrapper>
      </body>
    </html>
  );
}
