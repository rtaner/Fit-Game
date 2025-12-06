'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
          >
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Kullanım Şartları</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6 text-sm text-gray-700">
                {/* Section 1 */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">1. UYGULAMA HAKKINDA</h3>
                  <ul className="space-y-1 ml-4">
                    <li>• Bu uygulama resmi bir şirket ürünü DEĞİLDİR.</li>
                    <li>• Kâr amacı gütmeyen, kişisel gelişim ve eğitim amaçlı deneysel bir prototiptir.</li>
                    <li>• Şirket yönetimi tarafından talep edilmemiş veya onaylanmamıştır.</li>
                  </ul>
                </div>

                {/* Section 2 */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">2. İÇERİK DOĞRULUĞU VE SORUMLULUK</h3>
                  <ul className="space-y-1 ml-4">
                    <li>• Uygulama içerisindeki sorular, yanıtlar, model isimleri ve koleksiyon bilgileri; halka açık veriler ve yapay zeka modelleri kullanılarak derlenmiştir; hata veya güncellik sorunu olabilir.</li>
                    <li>• Müşteriyle iletişimde ve satış süreçlerinde doğabilecek hatalı bilgilendirmelerden geliştirici sorumlu tutulamaz.</li>
                    <li>• Kesin bilgi için daima resmi şirket kataloglarını ve ürün etiketlerini esas alınız.</li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">3. KİŞİSEL VERİLER</h3>
                  <p className="font-semibold mb-1">Toplanan veriler:</p>
                  <ul className="space-y-1 ml-4 mb-3">
                    <li>• Ad, soyad, kullanıcı adı, mağaza bilgisi.</li>
                    <li>• Oyun performans verileri (puanlar, doğru/yanlış cevaplar).</li>
                  </ul>
                  <p className="font-semibold mb-1">Kullanım amacı:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Sadece eğitim takibi, performans analizi ve deneyimi kişiselleştirmek içindir.</li>
                    <li>• Veriler ticari amaçla kullanılmaz veya satılmaz.</li>
                  </ul>
                </div>

                {/* Section 4 - Warning */}
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    4. ÖNEMLİ GÜVENLİK UYARISI
                  </h3>
                  <ul className="space-y-2 ml-4 text-red-800">
                    <li className="font-semibold">• Bu uygulamada ASLA şirket hesaplarınızda (e-posta, ERP) veya bankacılık işlemlerinizde kullandığınız sicil kodu ve şifreleri KULLANMAYINIZ.</li>
                    <li>• Sadece bu uygulama için basit ve önemsiz bir şifre (örn: 123456) belirleyiniz.</li>
                    <li>• Uygulama "deneme sürümü" olduğundan üst düzey veri güvenliği taahhüt etmez.</li>
                  </ul>
                </div>

                {/* Section 5 */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">5. FİKRİ MÜLKİYET</h3>
                  <ul className="space-y-1 ml-4">
                    <li>• Marka adları, koleksiyon isimleri ve görseller ilgili hak sahiplerinin mülkiyetindedir.</li>
                    <li>• Ticari bir amaç gütmeksizin, sadece eğitim amaçlı "adil kullanım" çerçevesinde yer almaktadır.</li>
                  </ul>
                </div>

                {/* Section 6 */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                  <h3 className="font-bold text-blue-900 mb-2">6. KABUL BEYANI</h3>
                  <p className="text-blue-800 ml-4">
                    Kayıt olarak:
                  </p>
                  <ul className="space-y-1 ml-8 mt-2 text-blue-800">
                    <li>• Uygulamanın resmi olmadığını, hatalı bilgi içerebileceğini,</li>
                    <li>• Güvenlik uyarılarını okuduğunuzu ve</li>
                    <li>• Bu şartları kabul ettiğinizi beyan edersiniz.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="p-6 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-mavi-navy text-white rounded-2xl hover:bg-mavi-navy/90 font-semibold transition-colors"
              >
                Anladım
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
