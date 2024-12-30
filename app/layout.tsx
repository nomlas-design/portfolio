import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Nomlas Design',
  description: 'Nomlas Design',
};

const helvetica = localFont({
  src: '../public/fonts/HelveticaNowDisplay-Bold.woff2',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={helvetica.className}>
      <body>{children}</body>
    </html>
  );
}
