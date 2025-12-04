import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { MonitoringProvider } from '@/components/MonitoringProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mavi Fit Game',
  description: 'Gamified quiz app for learning product fits',
  manifest: '/manifest.json',
  themeColor: '#0A66C2',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="antialiased bg-background min-h-screen">
        <MonitoringProvider>
          {children}
        </MonitoringProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
