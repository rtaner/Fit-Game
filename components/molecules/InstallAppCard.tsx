'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallAppCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      return isStandalone || isIOSStandalone;
    };

    setIsInstalled(checkInstalled());

    // Check if user dismissed the card
    const dismissed = localStorage.getItem('install-card-dismissed');
    if (dismissed) {
      setIsVisible(false);
      return;
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show card if not installed
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !checkInstalled()) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      // iOS için talimatları göster
      alert(
        'iOS\'ta uygulamayı yüklemek için:\n\n' +
        '1. Safari\'de bu sayfayı açın\n' +
        '2. Paylaş butonuna (⬆️) tıklayın\n' +
        '3. "Ana Ekrana Ekle" seçeneğini seçin'
      );
      return;
    }

    // Android/Chrome için
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsVisible(false);
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('install-card-dismissed', 'true');
  };

  // Don't show if installed or not visible
  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleInstall}
      className="relative bg-gradient-to-br from-purple-50 to-pink-50 border border-border-light rounded-3xl p-4 cursor-pointer shadow-sm flex flex-col items-center justify-center aspect-square active:scale-95 transition-all hover:shadow-md"
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
      >
        <X className="h-3 w-3 text-gray-600" />
      </button>

      <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-3">
        <Download className="h-6 w-6 text-purple-600" />
      </div>
      <span className="text-purple-600 text-xs font-bold text-center">
        Uygulamayı Yükle
      </span>
    </motion.div>
  );
}
