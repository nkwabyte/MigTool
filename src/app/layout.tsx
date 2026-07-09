import { ReactNode } from 'react';
import '@/src/styles/globals.css';
import { Providers } from '@/src/components/Providers';
import { MainLayout } from '@/src/components/layout/MainLayout';

export const metadata = {
  title: 'MiGTool',
  description: 'Medical Imaging Tool',
};

// Fetch session here in server component
import { getSession } from '../lib/session';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers user={session}>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  );
}
