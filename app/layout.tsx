import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { MonitoringProvider } from '@/components/MonitoringProvider';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mavi Fit Game',
  description: 'Gamified quiz app for learning product fits',
  manifest: '/manifest.json',
  themeColor: '#002D66',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mavi Fit Game',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mavi Fit" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
      </head>
      <body className="antialiased bg-background min-h-screen">
        <MonitoringProvider>
          {children}
          <PWAInstallPrompt />
        </MonitoringProvider>
        <Analytics />
        <SpeedInsights />
        
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('[PWA] Service Worker registered'))
                  .catch(err => console.error('[PWA] Service Worker registration failed:', err));
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
