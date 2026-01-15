import { ReactNode } from 'react';
import '@/src/styles/globals.css';
import { Providers } from '@/src/components/Providers';
import { MainLayout } from '@/src/components/layout/MainLayout';

export const metadata = {
  title: 'MiGTool',
  description: 'Medical Imaging Tool',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  );
}
