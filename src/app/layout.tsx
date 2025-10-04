import AppThemeProvider from '@/components/theme/AppThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <AppThemeProvider>
          {children}
        </AppThemeProvider>
      </body>
    </html>
  );
}
