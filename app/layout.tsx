import type { Metadata } from 'next';
import Scene from '@/app/components/Scene';
import localFont from 'next/font/local';
import './globals.scss';
import { TransitionProvider } from '@/app/contexts/TransitionContext';

export const metadata: Metadata = {
  title: 'Nomlas Design',
  description: 'Nomlas Design',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <TransitionProvider>
          {children}

          <Scene />
        </TransitionProvider>
      </body>
    </html>
  );
}
