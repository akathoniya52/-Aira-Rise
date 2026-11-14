import './globals.css';
import type { Metadata } from 'next';
import ClientProvider from '@/components/ClientProvider';

export const metadata: Metadata = {
  title: 'AiraRise — Civic Air Quality Intelligence Platform',
  description: 'AI-powered civic air-quality intelligence that turns raw sensor data into traceable insights and prioritized local actions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-primary">
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
