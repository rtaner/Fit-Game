'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Flame, Award, BookOpen, Target } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white rounded-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-[#002D66] to-[#0E487A] text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Oyun Kuralları</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-white/80 text-sm mt-2">
                Mavi Fit oyununu oynamak için bilmen gerekenler
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Nasıl Oynanır */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Nasıl Oynanır?</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">1.</span>
                    <span>Bir kategori seç veya "Oynamaya Başla" ile tüm kategorilerden soru çöz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">2.</span>
                    <span>Her soruya 8 saniye içinde cevap ver</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">3.</span>
                    <span>Doğru cevaplarla puan kazan ve seriyi devam ettir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">4.</span>
                    <span>Jokerlerini akıllıca kullan (50-50, Zaman Ekle)</span>
                  </li>
                </ul>
              </div>

              {/* Günlük Seri */}
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Günlük Seri</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Her gün en az bir oyun oynayarak serini devam ettir! Serin ne kadar uzun olursa, 
                  o kadar çok bonus puan kazanırsın. Seriyi kırma, her gün giriş yap!
                </p>
              </div>

              {/* Rozetler */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Rozetler</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  Başarılarını rozetlerle göster! Farklı kategorilerde ustalaş, yüksek puanlar al 
                  ve özel rozetleri kazan. Rozetlerin profilinde görünür ve seni diğerlerinden ayırır.
                </p>
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100 rounded-lg p-2">
                  <span className="font-semibold">💡 İpucu:</span>
                  <span>Gizli rozetleri keşfetmek için farklı kategorileri dene!</span>
                </div>
              </div>

              {/* Liderlik Tablosu */}
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Liderlik Tablosu</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Hem mağazanda hem de tüm Mavi'de en iyiler arasına gir! Puanlarını artır, 
                  sıralamada yüksel ve arkadaşlarınla yarış. Haftalık ve aylık sıralamalar da mevcut.
                </p>
              </div>

              {/* Eğitim */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Eğitim</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Oyuna başlamadan önce eğitim bölümünden ürün bilgilerini öğren! 
                  Fit rehberleri, ürün özellikleri ve müşteri hizmetleri ipuçlarıyla kendini geliştir.
                </p>
              </div>

              {/* Puanlama */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Puanlama Sistemi</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Doğru cevap</span>
                    <span className="font-bold text-green-600">+10 puan</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Hızlı cevap bonusu</span>
                    <span className="font-bold text-blue-600">+5 puan</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Seri bonusu (3+ doğru)</span>
                    <span className="font-bold text-orange-600">x2 çarpan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 rounded-b-3xl">
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#002D66] text-white rounded-xl font-semibold hover:bg-[#0E487A] transition-colors"
              >
                Anladım, Hadi Oynayalım!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
