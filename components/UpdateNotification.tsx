'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface UpdateInfo {
  version: string;
  message: string;
  features: string[];
}

export function UpdateNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    // Check if there's a new version - only once per session
    const checkForUpdate = () => {
      const lastSeenVersion = localStorage.getItem('last-seen-version');
      const notificationShownThisSession = sessionStorage.getItem('notification-shown');
      const currentVersion = '1.2.0'; // This will be updated automatically on each deployment
      
      // Don't show if already shown in this session
      if (notificationShownThisSession === 'true') {
        return;
      }
      
      if (lastSeenVersion !== currentVersion) {
        // New version detected
        const updates: Record<string, UpdateInfo> = {
          '1.2.0': {
            version: '1.2.0',
            message: 'Yeni özellikler eklendi!',
            features: [
              'Kategori tamamlama kutlama ekranı',
              'Kategori rozetleri sistemi',
              'Tekrar oyna özelliği',
              'Aynı açıklamalı fitler düzeltildi'
            ]
          },
          '1.1.0': {
            version: '1.1.0',
            message: 'Önemli Güncelleme!',
            features: [
              'Kullanım şartları zorunlu onay sistemi',
              'Mevcut kullanıcılar için şart kabulü',
              'Database güvenlik iyileştirmeleri'
            ]
          },
          '1.0.9': {
            version: '1.0.9',
            message: 'Yeni özellikler eklendi!',
            features: [
              'Kullanım şartları ve sorumluluk reddi',
              'Güvenlik uyarıları eklendi',
              'Kullanıcı adı güvenlik kontrolü'
            ]
          },
          '1.0.8': {
            version: '1.0.8',
            message: 'Yeni özellikler eklendi!',
            features: [
              'Otomatik güncelleme sistemi',
              'Güncelleme bildirimleri',
              'Performans iyileştirmeleri'
            ]
          }
          // Future versions will be added here automatically
        };

        const info = updates[currentVersion];
        if (info) {
          setUpdateInfo(info);
          setShowNotification(true);
          
          // Mark as shown in this session
          sessionStorage.setItem('notification-shown', 'true');
          
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setShowNotification(false);
            localStorage.setItem('last-seen-version', currentVersion);
          }, 5000);
        } else {
          // No specific update info, just mark as seen
          localStorage.setItem('last-seen-version', currentVersion);
        }
      }
    };

    // Check after a short delay to ensure page is loaded
    const timer = setTimeout(checkForUpdate, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowNotification(false);
    if (updateInfo) {
      localStorage.setItem('last-seen-version', updateInfo.version);
      sessionStorage.setItem('notification-shown', 'true');
    }
  };

  return (
    <AnimatePresence>
      {showNotification && updateInfo && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-4 right-4 z-[9999] flex justify-center pointer-events-none"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-2xl p-4 max-w-md w-full pointer-events-auto">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm">
                    {updateInfo.message} 🎉
                  </h3>
                  <button
                    onClick={handleClose}
                    className="text-white/80 hover:text-white transition-colors flex-shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-xs text-white/90 mb-2">
                  Versiyon {updateInfo.version}
                </p>
                
                <ul className="text-xs text-white/80 space-y-1">
                  {updateInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="flex-shrink-0">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
