import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { MonitoringProvider } from '@/components/MonitoringProvider';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { UpdateNotification } from '@/components/UpdateNotification';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mavi Fit Game',
  description: 'Gamified quiz app for learning product fits',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mavi Fit Game',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#002D66',
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
          <UpdateNotification />
        </MonitoringProvider>
        <Analytics />
        <SpeedInsights />
        
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => {
                    console.log('[PWA] Service Worker registered');
                    
                    // Check for updates every 30 seconds (more aggressive)
                    setInterval(() => {
                      console.log('[PWA] Checking for updates...');
                      reg.update();
                    }, 30000);
                    
                    // Listen for updates
                    reg.addEventListener('updatefound', () => {
                      const newWorker = reg.installing;
                      console.log('[PWA] New service worker found, installing...');
                      
                      newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                          console.log('[PWA] New version installed! Auto-reloading in 2 seconds...');
                          // Give user 2 seconds to see what's happening, then reload
                          setTimeout(() => {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                            window.location.reload();
                          }, 2000);
                        }
                      });
                    });
                  })
                  .catch(err => console.error('[PWA] Service Worker registration failed:', err));
                  
                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                  if (event.data && event.data.type === 'SW_UPDATED') {
                    console.log('[PWA] Service worker updated to version:', event.data.version);
                    console.log('[PWA] Reloading page to apply update...');
                    window.location.reload();
                  }
                });
                
                // Listen for controller change (new SW activated)
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                  console.log('[PWA] New service worker activated, reloading page...');
                  window.location.reload();
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
